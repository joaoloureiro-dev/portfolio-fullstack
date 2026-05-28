import { OAuth2Client } from "google-auth-library";
import pool from "../db/index.js";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

async function googleAuthRoutes(app) {

    console.log("✅ Google Auth Routes Loaded");

    app.post("/auth/google", async (req, reply) => {

        try {

            // 🔥 SAFE BODY
            const body = req.body || {};

            const googleToken = body.token;

            if (!googleToken) {

                return reply.status(400).send({
                    error: "Google token missing"
                });
            }

            console.log("🟠 Verifying Google token...");

            const ticket =
                await client.verifyIdToken({
                    idToken: googleToken,
                    audience:
                        process.env.GOOGLE_CLIENT_ID
                });

            const payload = ticket.getPayload();

            if (!payload?.email) {

                return reply.status(401).send({
                    error: "Google email missing"
                });
            }

            const email = payload.email;

            console.log("✅ GOOGLE EMAIL:", email);

            // =====================================
            // USER
            // =====================================
            let result = await pool.query(
                "SELECT * FROM users WHERE username = $1",
                [email]
            );

            let userData;

            // cria user
            if (result.rows.length === 0) {

                const newUser = await pool.query(
                    `
                    INSERT INTO users
                    (username, password_hash, role)
                    VALUES ($1, $2, $3)
                    RETURNING *
                    `,
                    [
                        email,
                        "google-oauth",
                        "admin"
                    ]
                );

                userData = newUser.rows[0];

            } else {

                userData = result.rows[0];
            }

            // =====================================
            // JWT
            // =====================================
            const appToken = app.jwt.sign({
                id: userData.id,
                username: userData.username,
                role: userData.role
            });

            console.log("✅ JWT CREATED");

            return reply.send({
                token: appToken
            });

        } catch (error) {

            console.error(
                "❌ GOOGLE AUTH ERROR:",
                error
            );

            return reply.status(401).send({
                error:
                    error.message ||
                    "Google verification failed"
            });
        }
    });
}

export default googleAuthRoutes;