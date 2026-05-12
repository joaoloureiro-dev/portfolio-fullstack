import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";
import { createLog } from "../db/logs.js";
import { broadcast } from "../server.js";

export default async function requestsRoutes(app) {

    // 🔒 Listar pedidos
    app.get("/requests", { preHandler: authenticate }, async (request, reply) => {
        try {
            const result = await pool.query(
                "SELECT * FROM requests ORDER BY created_at DESC"
            );
            return result.rows;
        } catch (err) {
            return reply.status(500).send({ error: "Erro ao buscar pedidos" });
        }
    });

    // 📝 Atualizar status e Logar
    app.patch("/requests/:id/status", { preHandler: authenticate }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        const adminId = request.user.id;

        try {
            // 1. Pegar status antigo usando o 'pool'
            const oldData = await pool.query("SELECT status FROM requests WHERE id = $1", [id]);
            const oldStatus = oldData.rows[0]?.status;

            // 2. Atualizar usando o 'pool'
            await pool.query("UPDATE requests SET status = $1 WHERE id = $2", [status, id]);

            // 3. REGISTAR O LOG
            await createLog({
                userId: adminId,
                action: "UPDATE_STATUS",
                details: `Alterou status do pedido #${id} de '${oldStatus}' para '${status}'`,
                entityType: "requests",
                entityId: id
            });

            // 4. WebSocket
            broadcast({ type: "UPDATE_LIST" });

            return { success: true };
        } catch (err) {
            console.error(err);
            return reply.status(500).send({ error: "Erro ao atualizar pedido" });
        }
    });
}