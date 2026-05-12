import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function logsRoutes(app) {
    app.get("/logs", { preHandler: authenticate }, async (request, reply) => {
        try {
            const result = await pool.query(`
                SELECT al.*, u.username 
                FROM activity_logs al
                JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT 50
            `);
            return result.rows;
        } catch (err) {
            return reply.status(500).send({ error: "Erro ao carregar logs" });
        }
    });
}