import "./config/env.js";
import Fastify from "fastify";
import pool from "./db/index.js";


const app = Fastify({
    logger: true
});

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