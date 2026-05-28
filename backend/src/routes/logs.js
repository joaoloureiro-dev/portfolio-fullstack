// routes/logs.js

import pool from "../db/index.js";
import { authenticate } from "../middleware/auth.js";

async function getValidLogUserId(request) {
    const candidateId =
        request.user?.id ??
        request.user?.userId ??
        null;

    if (!candidateId) {
        return null;
    }

    try {
        const result = await pool.query(
            "SELECT id FROM users WHERE id = $1 LIMIT 1",
            [candidateId]
        );

        return result.rowCount > 0
            ? candidateId
            : null;

    } catch (error) {
        console.error("Erro ao validar user_id para log:", error);
        return null;
    }
}

export default async function logsRoutes(app) {

    // =========================================
    // 1. LISTAR LOGS
    // =========================================
    app.get(
        "/logs",
        { preHandler: authenticate },
        async (request, reply) => {
            try {
                const result = await pool.query(`
                    SELECT
                        al.id,
                        al.action,
                        al.details,
                        al.created_at,
                        u.username AS user_name
                    FROM activity_logs al
                    LEFT JOIN users u
                        ON al.user_id = u.id
                    ORDER BY al.created_at DESC
                    LIMIT 50
                `);

                return result.rows || [];

            } catch (error) {
                console.error("Database Error logsRoutes (GET):", error);

                return reply.status(500).send({
                    error: "Erro ao carregar logs",
                    details: error.message
                });
            }
        }
    );

    // =========================================
    // 2. DELETE REQUEST
    // =========================================
    app.delete(
        "/requests/:id",
        { preHandler: authenticate },
        async (request, reply) => {
            const id = Number(request.params.id);

            if (!Number.isInteger(id) || id <= 0) {
                return reply.status(400).send({
                    error: "Invalid request id"
                });
            }

            try {
                /*
                 * DELETE ... RETURNING elimina o pedido e devolve
                 * os dados necessários para o log numa única query.
                 */
                const deletedRequest = await pool.query(
                    `
                    DELETE FROM requests
                    WHERE id = $1
                    RETURNING id, name, service
                    `,
                    [id]
                );

                if (deletedRequest.rowCount === 0) {
                    return reply.status(404).send({
                        error: "Pedido não encontrado"
                    });
                }

                const {
                    name,
                    service
                } = deletedRequest.rows[0];

                /*
                 * O log não deve impedir o delete de ser considerado sucesso.
                 * Caso o log falhe, o request continua corretamente eliminado.
                 */
                try {
                    const userId = await getValidLogUserId(request);

                    await pool.query(
                        `
                        INSERT INTO activity_logs (
                            user_id,
                            action,
                            details,
                            created_at
                        )
                        VALUES ($1, $2, $3, NOW())
                        `,
                        [
                            userId,
                            "REQUEST_DELETED",
                            `Apagou o pedido de ${name} (${service})`
                        ]
                    );
                } catch (logError) {
                    app.log.warn(
                        { err: logError, requestId: id },
                        "Request deleted, but deletion log could not be created"
                    );
                }

                return reply.send({
                    success: true,
                    message: "Request deleted successfully"
                });

            } catch (error) {
                app.log.error(
                    { err: error, requestId: id },
                    "Failed to delete request"
                );

                return reply.status(500).send({
                    error: "DELETE_FAILED",
                    details: error.message
                });
            }
        }
    );

    // =========================================
    // 3. CLEAR LOGS
    // =========================================
    app.delete(
        "/logs",
        { preHandler: authenticate },
        async (request, reply) => {
            try {
                const result = await pool.query(
                    "DELETE FROM activity_logs"
                );

                return reply.send({
                    success: true,
                    deletedCount: result.rowCount || 0,
                    message: "Todos os logs foram limpos com sucesso"
                });

            } catch (error) {
                console.error("Database Error logsRoutes (DELETE):", error);

                return reply.status(500).send({
                    error: "Erro ao limpar os logs de atividade",
                    details: error.message
                });
            }
        }
    );

    // =========================================
    // 4. EMAIL LOG
    // =========================================
    app.post(
        "/logs/email",
        { preHandler: authenticate },
        async (request, reply) => {
            try {
                const {
                    clientName,
                    service
                } = request.body || {};

                if (!clientName || !service) {
                    return reply.status(400).send({
                        error: "clientName and service are required"
                    });
                }

                const userId = await getValidLogUserId(request);

                await pool.query(
                    `
                    INSERT INTO activity_logs (
                        user_id,
                        action,
                        details,
                        created_at
                    )
                    VALUES ($1, $2, $3, NOW())
                    `,
                    [
                        userId,
                        "EMAIL_SENT",
                        `Enviou e-mail para ${clientName} sobre o serviço: ${service}`
                    ]
                );

                return reply.send({
                    success: true
                });

            } catch (error) {
                console.error("Erro ao criar log de email:", error);

                return reply.status(500).send({
                    error: "Erro ao registar log de email",
                    details: error.message
                });
            }
        }
    );
}