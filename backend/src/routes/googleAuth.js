import { OAuth2Client } from "google-auth-library";
import pool from "../db/index.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function googleAuthRoutes(app) {
    app.post("/auth/google", async (req, reply) => {
        // 1. Mudar o nome para googleToken para evitar conflitos
        const { token: googleToken } = req.body;

        try {
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });


            const payload = ticket.getPayload();
            const email = payload.email;

            // 🔎 Procurar user na DB
            let result = await pool.query(
                "SELECT * FROM users WHERE username = $1",
                [email]
            );

            let userData;

            if (result.rows.length === 0) {
                // ➕ Criar se não existir (garante que retorna os dados com RETURNING *)
                const newUser = await pool.query(
                    "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
                    [email, "google-oauth", "user"] // Muda de 'user' para 'admin' aqui
                );
                userData = newUser.rows[0];
            } else {
                userData = result.rows[0];
            }

            // 🔐 Criar o TEU JWT usando os dados extraídos da row
            // Verifica se o 'app.jwt' está configurado corretamente no Fastify
            const appToken = app.jwt.sign({
                id: userData.id,
                username: userData.username,
                role: userData.role
            });

            // Enviar o token gerado pelo teu backend
            return { token: appToken };

        } catch (err) {
            console.error("Erro na autenticação Google:", err);
            return reply.status(401).send({ error: "Invalid Google token" });
            console.error("ERRO NO GOOGLE VERIFY:", error.message); // <--- Vê o que aparece no terminal do VS Code
            return reply.status(401).send({ error: "Google verification failed" });
        }
    });
}