import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

export default async function requestsRoutes(app) {

    // 🔒 rota protegida
    app.get("/requests", { preHandler: authenticate }, async () => {
        const result = await pool.query(
            "SELECT * FROM requests ORDER BY created_at DESC"
        );

        return result.rows;
    });

}