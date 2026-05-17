import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function logsRoutes(app) {
    // 1. LISTAR LOGS (Existente)
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

            return result.rows || [];

        } catch (err) {
            console.error("Database Error logsRoutes (GET):", err);
            return reply.status(500).send({
                error: "Erro ao carregar logs",
                details: err.message
            });
        }
    });

    app.delete("/requests/:id", adminAuth, async (req, reply) => {
        try {
            const { id } = req.params;

            // Executa a query SQL direta para apagar pelo ID
            const result = await pool.query("DELETE FROM requests WHERE id = $1", [id]);

            return { success: true, message: "Request deleted successfully" };
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Failed to delete request from database" });
        }
    });

    // 🧹 2. LIMPAR LOGS DE ATIVIDADE (Nova Rota)
    app.delete("/logs", { preHandler: authenticate }, async (request, reply) => {
        try {
            // Nota: Se a tua rota usa 'authenticate' em vez de 'adminAuth', garante que 
            // no teu frontend o utilizador também passa o token de admin para estar seguro.
            await pool.query("DELETE FROM activity_logs");

            return { success: true, message: "Todos os logs foram limpos com sucesso" };

        } catch (err) {
            console.error("Database Error logsRoutes (DELETE):", err);
            return reply.status(500).send({
                error: "Erro ao limpar os logs de atividade",
                details: err.message
            });
        }
    });
}