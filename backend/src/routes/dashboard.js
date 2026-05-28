// routes/dashboard.js

import pool from "../db/index.js";
import { checkRole } from "../middleware/roles.js";
import { broadcast } from "../services/socket.js";
import { getGA4Data } from "../services/analytics.js";

export default async function dashboardRoutes(app) {

    // ============================================
    // AUTH ADMIN
    // ============================================
    const adminAuth = {
        preHandler: [
            app.authenticate,
            checkRole("admin")
        ]
    };

    // ============================================
    // HELPERS
    // ============================================
    const allowedPeriods = [
        "24h",
        "7d",
        "30d",
        "90d"
    ];

    const emptyAnalyticsData = {
        success: false,

        totals: {
            pageViews: 0,
            visitors: 0,
            avgDuration: 0,
            bounceRate: 0
        },

        chartData: [],

        countries: []
    };

    // ============================================
    // 1. LISTAR TODOS OS PEDIDOS ADMIN
    // ============================================
    app.get(
        "/admin/requests",
        adminAuth,
        async (request, reply) => {

            try {

                const result = await pool.query(
                    `
                    SELECT *
                    FROM requests
                    ORDER BY created_at DESC
                    `
                );

                return reply.send(
                    result.rows || []
                );

            } catch (error) {

                app.log.error(
                    { err: error },
                    "Failed to fetch admin requests"
                );

                return reply.status(500).send({
                    error: "Failed to fetch requests from database",
                    details: error.message
                });
            }
        }
    );

    // ============================================
    // 2. OBTER PEDIDO ESPECÍFICO ADMIN
    // ============================================
    app.get(
        "/admin/requests/:id",
        adminAuth,
        async (request, reply) => {

            const id =
                Number(request.params.id);

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return reply.status(400).send({
                    error: "Invalid request ID"
                });
            }

            try {

                const result = await pool.query(
                    `
                    SELECT *
                    FROM requests
                    WHERE id = $1
                    `,
                    [id]
                );

                if (result.rowCount === 0) {

                    return reply.status(404).send({
                        error: "Request not found"
                    });
                }

                return reply.send(
                    result.rows[0]
                );

            } catch (error) {

                app.log.error(
                    {
                        err: error,
                        requestId: id
                    },
                    "Failed to fetch request details"
                );

                return reply.status(500).send({
                    error: "Database error",
                    details: error.message
                });
            }
        }
    );

    // ============================================
    // 3. ATUALIZAR STATUS ADMIN
    // ============================================
    app.patch(
        "/admin/requests/:id/status",
        adminAuth,
        async (request, reply) => {

            const id =
                Number(request.params.id);

            const {
                status
            } = request.body || {};

            const allowedStatuses = [
                "pending",
                "in_progress",
                "done"
            ];

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return reply.status(400).send({
                    error: "Invalid request ID"
                });
            }

            if (
                !status ||
                !allowedStatuses.includes(status)
            ) {

                return reply.status(400).send({
                    error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
                });
            }

            try {

                const result = await pool.query(
                    `
                    UPDATE requests
                    SET status = $1
                    WHERE id = $2
                    RETURNING *
                    `,
                    [
                        status,
                        id
                    ]
                );

                if (result.rowCount === 0) {

                    return reply.status(404).send({
                        error: "Request not found"
                    });
                }

                const updatedRequest =
                    result.rows[0];

                broadcast({
                    type: "REQUEST_UPDATED",
                    payload: updatedRequest
                });

                return reply.send({
                    success: true,
                    message: "Status updated successfully",
                    request: updatedRequest
                });

            } catch (error) {

                app.log.error(
                    {
                        err: error,
                        requestId: id
                    },
                    "Failed to update request status"
                );

                return reply.status(500).send({
                    error: "Internal server error during update",
                    details: error.message
                });
            }
        }
    );

    // ============================================
    // 4. GOOGLE ANALYTICS GA4 ADMIN DASHBOARD
    // ============================================
    app.get(
        "/admin/analytics",
        adminAuth,
        async (request, reply) => {

            const requestedPeriod =
                String(request.query?.period || "7d");

            const period =
                allowedPeriods.includes(requestedPeriod)
                    ? requestedPeriod
                    : "7d";

            try {

                /*
                 * Não aplicar fallback silencioso aqui.
                 * Se o utilizador seleciona 24h, deve ver 24h.
                 */
                const ga4Data =
                    await getGA4Data(period);

                const responseData = {
                    success:
                        ga4Data?.success !== false,

                    period,

                    totals: {
                        pageViews:
                            Number(ga4Data?.totals?.pageViews) || 0,

                        visitors:
                            Number(ga4Data?.totals?.visitors) || 0,

                        avgDuration:
                            Number(ga4Data?.totals?.avgDuration) || 0,

                        bounceRate:
                            Number(ga4Data?.totals?.bounceRate) || 0
                    },

                    chartData:
                        Array.isArray(ga4Data?.chartData)
                            ? ga4Data.chartData
                            : [],

                    countries:
                        Array.isArray(ga4Data?.countries)
                            ? ga4Data.countries
                            : []
                };

                app.log.info(
                    {
                        requestedPeriod,
                        appliedPeriod: period,
                        chartRows: responseData.chartData.length,
                        countryRows: responseData.countries.length,
                        totals: responseData.totals
                    },
                    "GA4 analytics response prepared"
                );

                /*
                 * Evita respostas antigas durante os testes.
                 */
                return reply
                    .header(
                        "Cache-Control",
                        "no-store, no-cache, must-revalidate, proxy-revalidate"
                    )
                    .send(responseData);

            } catch (error) {

                app.log.error(
                    {
                        err: error,
                        requestedPeriod,
                        appliedPeriod: period
                    },
                    "Failed to fetch GA4 analytics data"
                );

                return reply
                    .header(
                        "Cache-Control",
                        "no-store, no-cache, must-revalidate, proxy-revalidate"
                    )
                    .status(200)
                    .send({
                        ...emptyAnalyticsData,
                        period
                    });
            }
        }
    );
}