// services/analytics.js
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// O ID da Propriedade (9 dígitos) encontras no GA4: 
// Administrador > Definições da Propriedade > ID da Propriedade
const propertyId = process.env.GA4_PROPERTY_ID;

// Inicializa o cliente. 
// O Google procura automaticamente pelo ficheiro definido em GOOGLE_APPLICATION_CREDENTIALS
// ou podes passar o caminho fixo como fizemos antes.
const analyticsDataClient = new BetaAnalyticsDataClient({
    keyFilename: './credentials.json',
});

export async function getGA4Data() {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            // Metrics são os números (utilizadores, views)
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' }
            ],
            // Dimensions são as categorias (ex: por nome do serviço/página)
            dimensions: [{ name: 'pageTitle' }],
        });

        // Se a Google não devolver linhas, retornamos valores zerados
        if (!response.rows || response.rows.length === 0) {
            return {
                activeUsers: 0,
                screenPageViews: 0,
                topService: "N/A",
                growth: "+0%"
            };
        }

        // Extração básica de dados
        const activeUsers = response.rows[0].metricValues[0].value;
        const screenPageViews = response.rows[0].metricValues[1].value;

        return {
            activeUsers: parseInt(activeUsers),
            screenPageViews: parseInt(screenPageViews),
            topService: response.rows[0].dimensionValues[0].value, // Exemplo: a página mais vista
            growth: "+12%" // Aqui poderias calcular a diferença vs mês anterior
        };
    } catch (error) {
        console.error("Erro ao procurar dados no GA4:", error);
        throw error;
    }
}