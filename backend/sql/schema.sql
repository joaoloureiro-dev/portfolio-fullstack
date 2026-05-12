CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    budget TEXT,
    urgency TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabela de Logs de Atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    -- Ex: 'UPDATE_STATUS', 'DELETE_INQUIRY'
    details TEXT NOT NULL,
    -- Ex: 'Alterou status do pedido #12 para Concluído'
    entity_type VARCHAR(50),
    -- Ex: 'inquiries'
    entity_id INTEGER,
    -- ID do registo afetado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Se tiveres uma tabela de users/admins, podes adicionar esta FK:
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Index para performance (procurar logs de um pedido específico será rápido)
CREATE INDEX idx_logs_entity ON activity_logs(entity_type, entity_id);