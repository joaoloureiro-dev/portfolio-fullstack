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

const app = Fastify({
    logger: true
});

// --------------------
// 🔥 WEBSOCKET CLIENTS (GLOBAL)
// --------------------
const clients = new Set();

// --------------------
// 📡 BROADCAST FUNCTION
// --------------------
function broadcast(data) {
    const message = JSON.stringify(data);

    for (const client of clients) {
        if (client.readyState === 1) {
            client.send(message);
        }
    }
}

// --------------------
// 🔐 JWT
// --------------------
await app.register(jwt, {
    secret: process.env.JWT_SECRET
});

app.decorate("authenticate", async function (request, reply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
});

// --------------------
// 🌐 CORS
// --------------------
await app.register(cors, {
    origin: "http://localhost:5173"
});

// --------------------
// ⚡ WEBSOCKETS
// --------------------
await app.register(websocket);

// WebSocket route
app.get("/ws", { websocket: true }, (connection) => {

    clients.add(connection.socket);

    connection.socket.on("close", () => {
        clients.delete(connection.socket);
    });
});

// --------------------
// 🚀 ROUTES
// --------------------
app.register(authRoutes);
app.register(requestsRoutes);
app.register(dashboardRoutes);
app.register(googleAuthRoutes);

// --------------------
// PUBLIC ROUTES
// --------------------
app.get("/", async () => {
    return { status: "ok" };
});

app.get("/db-test", async () => {
    const result = await pool.query("SELECT NOW()");
    return result.rows;
});

// --------------------
// START SERVER
// --------------------
const start = async () => {
    try {
        await app.listen({
            port: process.env.PORT || 3000,
            host: "0.0.0.0"
        });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

// --------------------
// EXPORT BROADCAST (IMPORTANT)
// --------------------
export { broadcast };