import pool from "../db/index.js";
import { checkRole } from "../middlewares/roles.js";

export default async function dashboardRoutes(app) {

    app.get(
        "/admin/requests",
        { preHandler: [app.authenticate, checkRole("admin")] },
        async () => {
            const result = await pool.query(
                "SELECT * FROM requests ORDER BY created_at DESC"
            );

            return result.rows;
        }
    );

    app.get("/admin/requests/:id", { preHandler: app.authenticate }, async (req, reply) => {
        const { id } = req.params;

        if (isNaN(id)) {
            return reply.status(400).send({ error: "Invalid ID" });
        }

        const result = await pool.query(
            "SELECT * FROM requests WHERE id = $1",
            [id]
        );

        return result.rows[0];
    });

    app.patch("/admin/requests/:id/status", { preHandler: app.authenticate }, async (req, reply) => {
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["pending", "in_progress", "done"];

        if (!status) {
            return reply.status(400).send({ error: "Status is required" });
        }

        if (!allowed.includes(status)) {
            return reply.status(400).send({ error: "Invalid status" });
        }

        const result = await pool.query(
            "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        return result.rows[0];
    });

}