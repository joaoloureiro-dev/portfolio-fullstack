import { OAuth2Client } from "google-auth-library";
import pool from "../db/index.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function googleAuthRoutes(app) {

    app.post("/auth/google", async (req, reply) => {
        const { token } = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();
            const email = payload.email;

            // 🔎 procurar user na DB
            let user = await pool.query(
                "SELECT * FROM users WHERE username = $1",
                [email]
            );

            // ➕ se não existir cria
            if (user.rows.length === 0) {
                user = await pool.query(
                    "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *",
                    [email, "google-oauth"]
                );
            }

            // 🔐 criar JWT teu
            const appToken = app.jwt.sign({
                email
            });

            return { token: appToken };

        } catch (err) {
            console.log(err);
            return reply.status(401).send({ error: "Invalid Google token" });
        }
    });

}