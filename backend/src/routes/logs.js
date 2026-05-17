import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function logsRoutes(app) {

    // 1. LISTAR LOGS (GET)
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

    // 🗑️ 2. ELIMINAR UM REQUEST INDIVIDUAL E GERAR LOG (DELETE)
    app.delete("/requests/:id", { preHandler: authenticate }, async (request, reply) => {
        try {
            const { id } = request.params;
            const userId = request.user.id; // Retirado do teu middleware 'authenticate'

            // A. Buscar os dados do pedido antes de o apagar para saber de quem era
            const requestData = await pool.query("SELECT name, service FROM requests WHERE id = $1", [id]);

            if (requestData.rowCount === 0) {
                return reply.status(404).send({ error: "Pedido não encontrado" });
            }

            const { name, service } = requestData.rows[0];

            // B. Apagar o pedido da tabela
            await pool.query("DELETE FROM requests WHERE id = $1", [id]);

            // C. Inserir o log de eliminação
            await pool.query(`
                INSERT INTO activity_logs (user_id, action, details, created_at)
                VALUES ($1, $2, $3, NOW())
            `, [userId, "REQUEST_DELETED", `Apagou o pedido de ${name} (${service})`]);

            return { success: true, message: "Request deleted successfully" };
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Failed to delete request from database" });
        }
    });

    // 🧹 3. LIMPAR TODOS OS LOGS DE ATIVIDADE (DELETE)
    app.delete("/logs", { preHandler: authenticate }, async (request, reply) => {
        try {
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

    // ✉️ 4. REGISTAR LOG DE ENVIO DE EMAIL (POST)
    app.post("/logs/email", { preHandler: authenticate }, async (request, reply) => {
        try {
            const { clientName, service } = request.body;
            const userId = request.user.id; // Retirado do teu middleware 'authenticate'

            await pool.query(`
                INSERT INTO activity_logs (user_id, action, details, created_at)
                VALUES ($1, $2, $3, NOW())
            `, [
                userId,
                "EMAIL_SENT",
                `Enviou e-mail para ${clientName} sobre o serviço: ${service}`
            ]);

            return { success: true };
        } catch (err) {
            console.error("Erro ao criar log de email:", err);
            return reply.status(500).send({ error: "Erro ao registar log de email" });
        }
    });
}