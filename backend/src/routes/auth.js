import bcrypt from "bcrypt"; // Mantemos aqui caso queiras usar noutras rotas

export default async function authRoutes(app) {

    app.post("/login", async (request, reply) => {
        const { username, password } = request.body;

        // 1. Puxa as credenciais seguras do ficheiro .env
        const adminUser = process.env.DASHBOARD_USERNAME;
        const adminPass = process.env.DASHBOARD_PASSWORD;

        // 2. Validação direta contra as variáveis de ambiente
        const isValidUser = username === adminUser;
        const isValidPass = password === adminPass;

        if (!isValidUser || !isValidPass) {
            return reply.status(401).send({
                error: "Invalid credentials"
            });
        }

        // 3. ✅ TOKEN ESPELHADO COM DADOS ESTÁTICOS
        // Mantemos a estrutura exata que o teu frontend já esperava receber
        const token = app.jwt.sign({
            id: 999, // Um ID fictício já que não vem da BD
            username: adminUser,
            role: "admin" // Define o role que o teu frontend precisa para dar acesso
        });

        return { token };
    });
}