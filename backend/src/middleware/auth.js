export async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        // Agora o log acontece ANTES do return
        console.error("🚨 FALHA NA AUTENTICAÇÃO JWT:", err.message);

        // E aqui enviamos a resposta para o frontend
        return reply.status(401).send({ error: "Unauthorized", details: err.message });
    }
}