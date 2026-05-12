// db/logs.js
import pool from "./index.js"; // Importa o pool que me mostraste

export async function createLog({ userId, action, details, entityType = null, entityId = null }) {
    const query = `
        INSERT INTO activity_logs (user_id, action, details, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [userId, action, details, entityType, entityId];

    try {
        await pool.query(query, values);
    } catch (err) {
        console.error("Erro ao gravar log de atividade:", err);
        // Não lançamos erro (throw) para não interromper a ação principal do utilizador
    }
}