// services/analytics.js
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function getGA4Data(period) {
    // 1. Define o intervalo de dias com base no filtro que vem da rota
    let daysAgo = '7';
    if (period === '30d') daysAgo = '30';
    if (period === '90d') daysAgo = '90';

    try {
        // 2. Inicialização segura usando o OAuth 2.0 Playground tokens salvos no .env
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: process.env.GA_REFRESH_TOKEN,
            },
        });

        // 3. Consulta à API do Google Analytics 4
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${process.env.GA_PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: `${daysAgo}daysAgo`,
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'date', // Essencial para agrupar dia a dia para o gráfico
                },
            ],
            metrics: [
                { name: 'activeUsers' },            // Utilizadores únicos
                { name: 'screenPageViews' },        // Visualizações de página
                { name: 'averageSessionDuration' }, // Tempo médio (em segundos)
                { name: 'bounceRate' },             // Taxa de rejeição (0 a 1)
            ],
            orderBys: [
                {
                    dimension: { dimensionName: 'date' },
                    desc: false, // Ordena cronologicamente para a curva do gráfico fazer sentido
                },
            ],
        });

        // Se a Google não devolver dados nenhumas, entregamos uma estrutura zerada padrão
        if (!response.rows || response.rows.length === 0) {
            return {
                success: true,
                totals: { pageViews: 0, visitors: 0, avgDuration: 0, bounceRate: 0 },
                chartData: []
            };
        }

        // 4. Processar e formatar os dados dia após dia para o Recharts
        const chartData = response.rows.map((row) => {
            const rawDate = row.dimensionValues[0].value || '';
            // Formata "20260517" para "17/05"
            const formattedDate = `${rawDate.substring(6, 8)}/${rawDate.substring(4, 6)}`;

            return {
                date: formattedDate,
                visitors: Number(row.metricValues[0].value ?? 0),
                pageViews: Number(row.metricValues[1].value ?? 0),
            };
        });

        // 5. Calcular os Totais Absolutos e Médias para preencher os Cards de cima
        let totalPageViews = 0;
        let totalVisitors = 0;
        let sumDuration = 0;
        let sumBounceRate = 0;
        const totalRows = response.rows.length;

        response.rows.forEach((row) => {
            totalVisitors += Number(row.metricValues[0].value ?? 0);
            totalPageViews += Number(row.metricValues[1].value ?? 0);
            sumDuration += Number(row.metricValues[2].value ?? 0);
            sumBounceRate += Number(row.metricValues[3].value ?? 0);
        });

        return {
            success: true,
            totals: {
                pageViews: totalPageViews,
                visitors: totalVisitors,
                avgDuration: Math.round(sumDuration / totalRows), // Média de tempo em segundos
                bounceRate: Math.round((sumBounceRate / totalRows) * 100), // Percentagem final
            },
            chartData,
        };

    } catch (error) {
        console.error("Erro ao procurar dados no GA4:", error);
        throw error;
    }
}