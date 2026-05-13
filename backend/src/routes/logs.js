import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function logsRoutes(app) {
    app.get("/logs", { preHandler: authenticate }, async (request, reply) => {
        try {
            const result = await pool.query(`
                SELECT 
                    al.id, 
                    al.action, 
                    al.details, 
                    al.created_at, 
                    u.username as user_name
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                ORDER BY al.created_at DESC
                LIMIT 50
            `);

            // Garantir que devolvemos sempre um array, mesmo que vazio
            return result.rows || [];

        } catch (err) {
            // Log do erro real no terminal do servidor para poderes depurar
            console.error("Database Error logsRoutes:", err);

            return reply.status(500).send({
                error: "Erro ao carregar logs",
                details: err.message // Útil para desenvolvimento, remove em produção
            });
        }
    });
}