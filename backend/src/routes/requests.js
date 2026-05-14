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

            // Enviar Email em background (não trava a resposta ao cliente)
            transporter.sendMail({
                from: `"${name}" <${process.env.EMAIL_USER}>`, // Gmail exige que o 'from' seja o auth user
                replyTo: email,
                to: process.env.EMAIL_USER,
                subject: `💼 Novo Pedido: ${service} - ${name}`,
                html: `
                    <div style="font-family: sans-serif; background: #000; color: #fff; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #ff7b00;">Novo contacto via Portfolio</h2>
                        <p><strong>Cliente:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Serviço:</strong> ${service}</p>
                        <hr style="border: 0.5px solid #333" />
                        <p style="font-style: italic;">"${message}"</p>
                    </div>
                `
            }).catch(err => console.error("Email error:", err));

            broadcast({ type: "NEW_REQUEST", data: newRequest });

            return reply.status(201).send({ success: true });
        } catch (err) {
            app.log.error(err);
            return reply.status(500).send({ error: "Erro interno ao processar pedido" });
        }
    });

    // 🔒 Listar pedidos (Admin)
    app.get("/requests", { preHandler: app.authenticate }, async (request, reply) => {
        try {
            const result = await pool.query("SELECT * FROM requests ORDER BY created_at DESC");
            return result.rows;
        } catch (err) {
            return reply.status(500).send({ error: "Erro ao buscar pedidos" });
        }
    });

    // 📝 Atualizar Status
    app.patch("/requests/:id/status", { preHandler: app.authenticate }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        const adminId = request.user.id;

        try {
            const oldData = await pool.query("SELECT status FROM requests WHERE id = $1", [id]);
            if (oldData.rows.length === 0) return reply.status(404).send({ error: "Pedido não encontrado" });

            const result = await pool.query(
                "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
                [status, id]
            );

            await createLog({
                userId: adminId,
                action: "UPDATE_STATUS",
                details: `Status ID #${id}: ${oldData.rows[0].status} -> ${status}`,
                entityType: "requests",
                entityId: id
            });

            broadcast({ type: "UPDATE_LIST" });
            return result.rows[0];
        } catch (err) {
            return reply.status(500).send({ error: "Falha ao atualizar status" });
        }
    });
}