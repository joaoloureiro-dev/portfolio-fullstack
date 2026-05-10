// middleware/roles.js

export function checkRole(role) {
    return async function (request, reply) {
        // 1. O app.authenticate já correu antes, por isso o request.user já existe
        // 2. Verificamos se a role no token é a que a rota exige (ex: 'admin')

        if (!request.user) {
            return reply.status(401).send({
                error: "Unauthorized",
                message: "Token não encontrado ou inválido."
            });
        }

        if (request.user.role !== role) {
            console.log(`[AUTH] Bloqueio: Utilizador ${request.user.username} tentou aceder como ${request.user.role}, mas precisava de ${role}`);

            return reply.status(403).send({
                error: "Forbidden",
                message: "Acesso negado: não tens permissões de administrador."
            });
        }

        // Se passar as verificações, o Fastify continua para a rota
    };
}