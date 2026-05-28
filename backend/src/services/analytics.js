// services/analytics.js

import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ============================================
// PERIOD
// ============================================
function getDateRange(period = "7d") {
    switch (period) {
        case "24h":
            return {
                startDate: "yesterday",
                endDate: "today"
            };

            return {
                startDate: "3daysAgo",
                endDate: "today"
            };

        case "30d":
            return {
                startDate: "30daysAgo",
                endDate: "today"
            };

        case "90d":
            return {
                startDate: "90daysAgo",
                endDate: "today"
            };

        case "7d":
        default:
            return {
                startDate: "7daysAgo",
                endDate: "today"
            };
    }
}

// ============================================
// EMPTY RESPONSE
// ============================================
function createEmptyResponse(success = false) {
    return {
        success,

        totals: {
            pageViews: 0,
            visitors: 0,
            avgDuration: 0,
            bounceRate: 0
        },

        chartData: [],

        countries: []
    };
}

// ============================================
// HELPERS
// ============================================
function toNumber(value) {
    const parsedValue = Number(value ?? 0);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
}

function formatDate(rawDate = "") {
    if (rawDate.length !== 8) {
        return rawDate;
    }

    return `${rawDate.substring(6, 8)}/${rawDate.substring(4, 6)}`;
}

// ============================================
// GA4 DATA
// ============================================
export async function getGA4Data(period = "7d") {
    const {
        startDate,
        endDate
    } = getDateRange(period);

    // ============================================
    // ENV - OAuth2 QUE JÁ TINHAS CONFIGURADO
    // ============================================
    const clientID =
        process.env.GOOGLE_CLIENT_ID;

    const clientSecret =
        process.env.GA_CLIENT_SECRET ||
        process.env.GOOGLE_CLIENT_SECRET;

    const refreshToken =
        process.env.GA_REFRESH_TOKEN;

    const propertyId =
        process.env.GA_PROPERTY_ID;

    console.log("📊 GA4 REQUEST:", {
        period,
        startDate,
        endDate,
        propertyId,
        hasClientID: Boolean(clientID),
        hasClientSecret: Boolean(clientSecret),
        hasRefreshToken: Boolean(refreshToken)
    });

    if (
        !clientID ||
        !clientSecret ||
        !refreshToken ||
        !propertyId
    ) {
        console.error("🚨 GA4 CONFIG ERROR:", {
            missingClientID: !clientID,
            missingClientSecret: !clientSecret,
            missingRefreshToken: !refreshToken,
            missingPropertyId: !propertyId
        });

        return createEmptyResponse(false);
    }

    try {
        // ============================================
        // CLIENT
        // ============================================
        const analyticsDataClient =
            new BetaAnalyticsDataClient({
                credentials: {
                    type: "authorized_user",
                    client_id: clientID,
                    client_secret: clientSecret,
                    refresh_token: refreshToken
                }
            });

        console.log("✅ GA4 CLIENT CREATED");

        // ============================================
        // MAIN REPORT
        // Query reposta para o formato que já devolveu dados.
        // ============================================
        const [response] =
            await analyticsDataClient.runReport({
                property: `properties/${propertyId}`,

                dateRanges: [
                    {
                        startDate,
                        endDate
                    }
                ],

                dimensions: [
                    {
                        name: "date"
                    }
                ],

                metrics: [
                    {
                        name: "activeUsers"
                    },
                    {
                        name: "screenPageViews"
                    },
                    {
                        name: "averageSessionDuration"
                    },
                    {
                        name: "bounceRate"
                    }
                ],

                orderBys: [
                    {
                        dimension: {
                            dimensionName: "date"
                        },

                        desc: false
                    }
                ]
            });

        const rows =
            Array.isArray(response?.rows)
                ? response.rows
                : [];

        console.log("✅ GA4 MAIN REPORT ROWS:", {
            period,
            rows: rows.length
        });

        if (rows.length === 0) {
            console.warn("⚠️ GA4 SEM LINHAS PARA O PERÍODO:", {
                period,
                startDate,
                endDate
            });

            /*
             * A consulta funcionou, mas não devolveu tráfego.
             */
            return createEmptyResponse(true);
        }

        // ============================================
        // CHART DATA
        // ============================================
        const chartData =
            rows.map((row) => ({
                date:
                    formatDate(
                        row.dimensionValues?.[0]?.value || ""
                    ),

                visitors:
                    toNumber(
                        row.metricValues?.[0]?.value
                    ),

                pageViews:
                    toNumber(
                        row.metricValues?.[1]?.value
                    )
            }));

        // ============================================
        // TOTALS
        // Mantido como na versão que apresentava dados.
        // Depois de estabilizar, afinamos visitors únicos.
        // ============================================
        let totalPageViews = 0;
        let totalVisitors = 0;
        let sumDuration = 0;
        let sumBounceRate = 0;

        rows.forEach((row) => {
            totalVisitors +=
                toNumber(
                    row.metricValues?.[0]?.value
                );

            totalPageViews +=
                toNumber(
                    row.metricValues?.[1]?.value
                );

            sumDuration +=
                toNumber(
                    row.metricValues?.[2]?.value
                );

            sumBounceRate +=
                toNumber(
                    row.metricValues?.[3]?.value
                );
        });

        const totals = {
            pageViews:
                totalPageViews,

            visitors:
                totalVisitors,

            avgDuration:
                Math.round(
                    sumDuration / rows.length
                ),

            bounceRate:
                Math.round(
                    (sumBounceRate / rows.length) * 100
                )
        };

        // ============================================
        // COUNTRY REPORT
        // Se falhar, o gráfico principal e os cards mantêm-se.
        // ============================================
        let countries = [];

        try {
            const [countryResponse] =
                await analyticsDataClient.runReport({
                    property: `properties/${propertyId}`,

                    dateRanges: [
                        {
                            startDate,
                            endDate
                        }
                    ],

                    dimensions: [
                        {
                            name: "country"
                        }
                    ],

                    metrics: [
                        {
                            name: "activeUsers"
                        }
                    ],

                    orderBys: [
                        {
                            metric: {
                                metricName: "activeUsers"
                            },

                            desc: true
                        }
                    ],

                    limit: 10
                });

            countries =
                (countryResponse?.rows || []).map((row) => ({
                    country:
                        row.dimensionValues?.[0]?.value ||
                        "Unknown",

                    visitors:
                        toNumber(
                            row.metricValues?.[0]?.value
                        )
                }));

            console.log("✅ GA4 COUNTRY REPORT ROWS:", {
                period,
                rows: countries.length
            });

        } catch (countryError) {
            console.error("⚠️ GA4 COUNTRY REPORT FAILED:", {
                period,
                message: countryError?.message,
                code: countryError?.code,
                details: countryError?.details
            });

            countries = [];
        }

        console.log("✅ GA4 RESPONSE READY:", {
            period,
            startDate,
            endDate,
            totals,
            chartRows: chartData.length,
            countryRows: countries.length
        });

        return {
            success: true,
            totals,
            chartData,
            countries
        };

    } catch (error) {
        console.error("🚨 GA4 MAIN REPORT FAILED:", {
            period,
            startDate,
            endDate,
            propertyId,
            message: error?.message,
            code: error?.code,
            details: error?.details
        });

        return createEmptyResponse(false);
    }
}