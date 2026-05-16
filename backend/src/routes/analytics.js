// routes/analytics.js
import { getGA4Data } from '../services/analytics.js';

export default async function (fastify, opts) {
    fastify.get('/analytics', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        // Captura o período (7d, 30d, 90d) que o React vai enviar na URL
        const { period } = request.query;

        try {
            // Passa o período para a função que comunica com a Google
            const data = await getGA4Data(period);
            return reply.send(data);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch GA4 data' });
        }
    });
}