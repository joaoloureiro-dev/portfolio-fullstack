// routes/analytics.js
import { getGA4Data } from '../services/analytics.js';

export default async function (fastify, opts) {
    fastify.get('/analytics', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const data = await getGA4Data();
            return data;
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: 'Failed to fetch GA4 data' });
        }
    });
}