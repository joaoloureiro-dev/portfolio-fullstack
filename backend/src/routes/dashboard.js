import pool from "../db/index.js";
import { checkRole } from "../middleware/roles.js";
import { broadcast } from "../services/socket.js";

export default async function dashboardRoutes(app) {

    // Grupo de segurança: Apenas admins autenticados passam daqui
    const adminAuth = { preHandler: [app.authenticate, checkRole("admin")] };

    // -----------------------------------------------------------
    // 1. LISTAR TODOS OS PEDIDOS
    // -----------------------------------------------------------
    app.get("/admin/requests", adminAuth, async (req, reply) => {
        try {
            const result = await pool.query(
                "SELECT * FROM requests ORDER BY created_at DESC"
            );
            return result.rows;
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch requests from database" });
        }
    });

    // -----------------------------------------------------------
    // 2. OBTER DETALHES DE UM PEDIDO ESPECÍFICO
    // -----------------------------------------------------------
    app.get("/admin/requests/:id", adminAuth, async (req, reply) => {
        const { id } = req.params;

        if (isNaN(id)) {
            return reply.status(400).send({ error: "Invalid request ID" });
        }

        try {
            const result = await pool.query(
                "SELECT * FROM requests WHERE id = $1",
                [id]
            );

            if (result.rows.length === 0) {
                return reply.status(404).send({ error: "Request not found" });
            }

            return result.rows[0];
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Database error" });
        }
    });

    // -----------------------------------------------------------
    // 3. ATUALIZAR STATUS (Realtime & Validation)
    // -----------------------------------------------------------
    app.patch("/admin/requests/:id/status", adminAuth, async (req, reply) => {
        const { id } = req.params;
        const { status } = req.body;

        // Lista rigorosa de estados permitidos
        const allowedStatuses = ["pending", "in_progress", "done"];

        if (!status || !allowedStatuses.includes(status)) {
            return reply.status(400).send({
                error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
            });
        }

        try {
            const result = await pool.query(
                "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
                [status, id]
            );

            if (result.rows.length === 0) {
                return reply.status(404).send({ error: "Request not found" });
            }

            const updatedRequest = result.rows[0];

            // 🔥 NOTIFICAÇÃO REALTIME via WebSocket
            broadcast({
                type: "REQUEST_UPDATED",
                payload: updatedRequest
            });

            return {
                message: "Status updated successfully",
                request: updatedRequest
            };
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Internal server error during update" });
        }
    });
}