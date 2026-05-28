import "./config/env.js";
import Fastify from "fastify";
import pool from "./db/index.js";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";

import authRoutes from "./routes/auth.js";
import requestsRoutes from "./routes/requests.js";
import dashboardRoutes from "./routes/dashboard.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import logsRoutes from "./routes/logs.js";
import { broadcast, addClient, removeClient } from "./services/socket.js";

const app = Fastify({
    logger: true
});

// --------------------
// 🔐 JWT
// --------------------
await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    sign: { expiresIn: '1h' }
});

// Altera a tua decoração authenticate para isto:
app.decorate("authenticate", async function (request, reply) {
    try {
        // Tenta ler do header, ou do query string, ou de um cookie (se usares)
        const token = request.headers.authorization?.replace("Bearer ", "") || request.query.token;

        if (!token) throw new Error("No token provided");

        // Valida o token manualmente com a chave
        request.user = app.jwt.verify(token);
    } catch (err) {
        return reply.status(401).send({ error: "Unauthorized", details: err.message });
    }
});

// --------------------
// 🌐 CORS (Configuração robusta)
// --------------------
// Substitui a tua configuração de CORS atual por esta:
await app.register(cors, {
    origin: (origin, cb) => {
        // Permite qualquer origem (ou podes definir o teu domínio específico)
        cb(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["*"], // Permite tudo
    exposedHeaders: ["Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
});

// --------------------
// ⚡ WEBSOCKETS
// --------------------
await app.register(websocket, {
    options: { maxPayload: 1048576 }
});

app.get("/ws", { websocket: true }, (connection, req) => {
    const socket = connection?.socket || connection;
    if (!socket || typeof socket.on !== 'function') return;

    addClient(socket);
    socket.on("close", () => removeClient(socket));
});

// --------------------
// 🚀 ROTAS
// --------------------
app.register(authRoutes);
app.register(requestsRoutes);
app.register(logsRoutes);
app.register(googleAuthRoutes);
app.register(dashboardRoutes);

app.ready(() => {
    console.log("ROTAS REGISTADAS:");
    console.log(app.printRoutes());
});

// Health Check que garante resposta JSON
app.get("/", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
});

// Handler para rotas inexistentes (previne HTML de erro 404)
app.setNotFoundHandler((request, reply) => {
    reply.status(404).type('application/json').send({ error: "Route not found" });
});

// --------------------
// 🏁 START SERVER
// --------------------
const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        await app.listen({
            port: port,
            host: "0.0.0.0"
        });
        app.log.info(`Servidor rodando em 0.0.0.0:${port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

export { broadcast };