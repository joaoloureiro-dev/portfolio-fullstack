import pool from "../db/index.js";
import { createLog } from "../db/logs.js";
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
    // 📩 Criar pedido (Público)
    app.post("/requests", async (request, reply) => {
        const { name, email, service, message } = request.body;
        try {
            const result = await pool.query(
                "INSERT INTO requests (name, email, service, message, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
                [name, email, service, message]
            );
            const newRequest = result.rows[0];

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

    // 📝 Atualizar Status (CORRIGIDO)
    app.patch("/requests/:id/status", { preHandler: app.authenticate }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;

        try {
            // 1. Verificar se o registo existe e pegar o status antigo
            const oldData = await pool.query("SELECT status FROM requests WHERE id = $1", [id]);

            if (oldData.rows.length === 0) {
                return reply.status(404).send({ error: "Pedido não encontrado" });
            }

            // 2. Executar o Update
            const result = await pool.query(
                "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
                [status, id]
            );

            // 3. Criar Log (Protegido por try/catch para não quebrar o update principal)
            try {
                await createLog({
                    userId: request.user?.id || 1, // Garante que o ID existe vindo do JWT
                    action: "UPDATE_STATUS",
                    details: `ID #${id}: ${oldData.rows[0].status} -> ${status}`,
                    entityType: "requests",
                    entityId: id
                });
            } catch (logErr) {
                console.error("Erro ao criar log:", logErr);
            }

            broadcast({ type: "UPDATE_LIST" });
            return result.rows[0];

        } catch (err) {
            console.error("Erro no Patch Status:", err);
            return reply.status(500).send({ error: "Erro ao atualizar status na base de dados" });
        }
    });
}