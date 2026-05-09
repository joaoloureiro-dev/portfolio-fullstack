export function checkRole(role) {
    return async function (request, reply) {
        try {
            await request.jwtVerify();

            if (request.user.role !== role) {
                return reply.status(403).send({
                    error: "Forbidden"
                });
            }

        } catch (err) {
            return reply.status(401).send({
                error: "Unauthorized"
            });
        }
    };
}