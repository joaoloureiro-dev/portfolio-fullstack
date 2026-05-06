import pool from "../db/index.js";

export default async function dashboardRoutes(app) {

    // 📌 GET ALL REQUESTS
    app.get("/admin/requests", { preHandler: app.authenticate }, async () => {
        const result = await pool.query(
            "SELECT * FROM requests ORDER BY created_at DESC"
        );

        return result.rows;
    });

}