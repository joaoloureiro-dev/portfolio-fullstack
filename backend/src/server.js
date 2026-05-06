import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";

const app = Fastify({
    logger: true
});

app.get("/", async () => {
    return { status: "ok" };
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