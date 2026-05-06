import "./config/env.js";
import Fastify from "fastify";
import pool from "./db/index.js";
import jwt from "@fastify/jwt";
import authRoutes from "./routes/auth.js";
import requestsRoutes from "./routes/requests.js";

const app = Fastify({
    logger: true
});

// plugins primeiro
await app.register(jwt, {
    secret: process.env.JWT_SECRET
});

// routes depois
app.register(authRoutes);
app.register(requestsRoutes);

// routes públicas
app.get("/", async () => {
    return { status: "ok" };
});

app.get("/db-test", async () => {
    const result = await pool.query("SELECT NOW()");
    return result.rows;
});

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