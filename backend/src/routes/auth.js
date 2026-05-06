import pool from "../db/index.js";
import bcrypt from "bcrypt";

export default async function authRoutes(app) {
    app.post("/login", async (request, reply) => {
        const { username, password } = request.body;

        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            return reply.status(401).send({ error: "Invalid credentials" });
        }

        const token = app.jwt.sign({ id: user.id, username: user.username });

        return { token };
    });
}