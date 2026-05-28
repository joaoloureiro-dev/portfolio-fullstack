// routes/analytics.js
import { getGA4Data } from '../services/analytics.js';

export default async function (fastify, opts) {
    fastify.get('/analytics', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        // Captura o período (24h, 7d, 30d, 90d) e define "7d" como fallback de segurança
        const period = request.query.period || '7d';

        try {
            // Passa o período validado para a função que comunica com a Google
            const data = await getGA4Data(period);
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch GA4 data' });
        }
    });
}