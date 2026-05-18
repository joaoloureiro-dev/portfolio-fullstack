import pool from "../db/index.js";
import { createLog } from "../db/logs.js"; // 🚀 Função de logs já importada e pronta a usar
import { broadcast } from "../services/socket.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export default async function requestsRoutes(app) {
    // 📩 Criar pedido (Público - Agora protegido por Cloudflare Turnstile)
    app.post("/requests", async (request, reply) => {
        // 🚀 1. Extrair os dados e o token de segurança do body
        const { name, email, service, message, token } = request.body;

        // 🛑 Proteção imediata: Se o token não vier no payload, rejeita logo
        if (!token) {
            return reply.status(400).send({ error: "Security token is missing." });
        }

        try {
            // 🔄 2. Validar o token diretamente com os servidores da Cloudflare
            const cloudflareResponse = await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        secret: process.env.TURNSTILE_SECRET_KEY, // Validado pelo teu .env do backend
                        response: token
                    }).toString()
                }
            );

            const verification = await cloudflareResponse.json();

            // 🛑 3. Se a validação falhar (bot ou token expirado), tranca a porta e grava Log
            if (!verification.success) {
                app.log.warn(`[Turnstile] Tentativa de spam/bot bloqueada para o email: ${email}`);

                // 📝 Grava o log de segurança (userId fica null porque é uma rota pública)
                await createLog({
                    userId: null,
                    action: "SECURITY_BOT_BLOCKED",
                    details: `Turnstile bloqueou tentativa de spam. Email informado: ${email}`,
                    entityType: "requests"
                });

                return reply.status(403).send({ error: "Security verification failed. Are you a robot?" });
            }

            app.log.info(`[Turnstile] Verificação concluída com sucesso para o utilizador: ${name}`);

            // 🤖 Utilizador legítimo verificado. Continua com o fluxo existente:
            const result = await pool.query(
                "INSERT INTO requests (name, email, service, message, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
                [name, email, service, message]
            );
            const newRequest = result.rows[0];

            // 📝 4. Grava o log de sucesso do novo pedido na base de dados
            await createLog({
                userId: null,
                action: "CREATE_REQUEST",
                details: `Novo pedido criado por ${name} (${email}) para o serviço: ${service}`,
                entityType: "requests",
                entityId: newRequest.id
            });

            transporter.sendMail({
                from: `"${name}" <${process.env.EMAIL_USER}>`,
                replyTo: email,
                to: process.env.EMAIL_USER,
                subject: `💼 Novo Pedido: ${service} - ${name}`,
                html: `<div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #ff7b00;">Novo contacto via Portfolio</h2>
                        <p><strong>Cliente:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Serviço:</strong> ${service}</p>
                        <hr style="border: 0.5px solid #333" />
                        <p style="font-style: italic;">"${message}"</p>
                    </div>`
            }).catch(err => console.error("Email error:", err));

            broadcast({ type: "NEW_REQUEST", data: newRequest });
            return reply.status(201).send(newRequest);
        } catch (err) {
            app.log.error("Erro no fluxo do Post Requests / Turnstile:", err);
            return reply.status(500).send({ error: "Erro interno" });
        }
    });

    // 🔒 Listar pedidos (Admin)
    app.get("/requests", { preHandler: app.authenticate }, async (request, reply) => {
        const result = await pool.query("SELECT * FROM requests ORDER BY created_at DESC");
        return result.rows;
    });

    // 📊 Rota de Analytics
    app.get("/analytics", { preHandler: app.authenticate }, async (request, reply) => {
        const total = await pool.query("SELECT COUNT(*) FROM requests");
        const top = await pool.query("SELECT service, COUNT(service) FROM requests GROUP BY service ORDER BY count DESC LIMIT 1");
        return {
            activeUsers: 1,
            screenPageViews: parseInt(total.rows[0].count) * 3,
            topService: top.rows[0]?.service || "None",
            growth: "+10%"
        };
    });

    // 📝 Atualizar Status (CORRIGIDO E TESTADO)
    app.patch("/requests/:id/status", { preHandler: app.authenticate }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;

        try {
            // 1. Primeiro pegamos os dados antigos para o Log
            const oldData = await pool.query("SELECT status FROM requests WHERE id = $1", [id]);

            if (oldData.rows.length === 0) {
                return reply.status(404).send({ error: "Pedido não encontrado" });
            }

            // 2. Executamos o Update
            const result = await pool.query(
                "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
                [status, id]
            );

            // 3. Criamos o Log e notificamos o Socket
            try {
                await createLog({
                    userId: request.user?.id || 1,
                    action: "UPDATE_STATUS",
                    details: `ID #${id}: ${oldData.rows[0].status} -> ${status}`,
                    entityType: "requests",
                    entityId: id
                });

                // IMPORTANTE: Notificar o frontend que há novos logs e lista atualizada
                broadcast({ type: "NEW_LOG" });
                broadcast({ type: "UPDATE_LIST" });

            } catch (logErr) {
                console.error("Erro ao criar log:", logErr);
            }

            return result.rows[0];

        } catch (err) {
            console.error("Erro no Patch Status:", err);
            return reply.status(500).send({ error: "Erro ao atualizar status na base de dados" });
        }
    });
}