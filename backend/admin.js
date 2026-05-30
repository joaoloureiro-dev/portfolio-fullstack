import 'dotenv/config'; // Isto carrega o DATABASE_URL do teu .env
import pool from "./src/db/index.js";

async function upgradeUser() {
    try {
        console.log("A verificar utilizadores...");

        // 1. Garante que a coluna role existe
        await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'");

        // 2. Atualiza o teu email e o utilizador 'admin'
        const res = await pool.query(
            "UPDATE users SET role = 'admin' WHERE username IN ($1, $2) RETURNING username, role",
            [process.env.ADMIN_EMAIL || "admin@exemplo.com", "admin"]
        );

        if (res.rowCount > 0) {
            console.log("Sucesso! Utilizadores atualizados:");
            console.table(res.rows);
        } else {
            console.log("Aviso: Nenhum utilizador encontrado. Verifica se os nomes estão corretos.");
        }

    } catch (err) {
        console.error("Erro ao atualizar base de dados:", err);
    } finally {
        process.exit();
    }
}

upgradeUser();