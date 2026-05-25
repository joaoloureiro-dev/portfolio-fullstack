// Definimos os dois URLs usando as variáveis de ambiente
const PRIMARY_URL = import.meta.env.VITE_API_URL_PRIMARY || import.meta.env.VITE_API_URL || "http://localhost:3000";
const BACKUP_URL = import.meta.env.VITE_API_URL_BACKUP || "https://portfolio-fullstack-xdwl.onrender.com";

async function authorizedFetch(url: string, options: RequestInit = {}, isRetry = false): Promise<any> {
    try {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                "Accept": "application/json",
            }
        });

        // Se o erro for do lado do servidor (Railway fora do ar ou em crash), faz o failover
        if (res.status >= 500 && !isRetry) {
            console.warn("⚠️ Servidor principal retornou erro 5xx. A tentar o Failover (Render)...");
            const backupUrl = url.replace(PRIMARY_URL, BACKUP_URL);
            return authorizedFetch(backupUrl, options, true);
        }

        if (res.status === 403) {
            window.location.href = "/unauthorized";
            return;
        }

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

        return data;

    } catch (error) {
        // Se houver um erro de rede total (ex: DNS do Railway não responde), entra aqui
        if (!isRetry) {
            console.warn("⚡ Falha de conexão com o Railway. A redirecionar para o Failover (Render)...");
            const backupUrl = url.replace(PRIMARY_URL, BACKUP_URL);
            return authorizedFetch(backupUrl, options, true);
        }

        // Se até o backup falhar, propaga o erro final
        throw error;
    }
}

// 1. LISTAR PEDIDOS
export async function getRequests(token: string) {
    return authorizedFetch(`${PRIMARY_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

// 2. ATUALIZAR STATUS
export async function updateRequestStatus(id: number, status: string, token: string) {
    return authorizedFetch(`${PRIMARY_URL}/requests/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}

// 3. OBTER ANALYTICS (Agora aceita o período dinamicamente)
export async function getAnalytics(token: string, period: "7d" | "30d" | "90d" = "7d") {
    return authorizedFetch(`${PRIMARY_URL}/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

// 🗑️ 4. ELIMINAR PEDIDO PERMANENTEMENTE
export async function deleteRequest(id: number, token: string) {
    return authorizedFetch(`${PRIMARY_URL}/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
}

// 🧹 5. LIMPAR LOGS DE ATIVIDADE
export async function clearActivityLogs(token: string) {
    return authorizedFetch(`${PRIMARY_URL}/logs`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
}

export async function logEmailSent(clientName: string, service: string, token: string) {
    return authorizedFetch(`${PRIMARY_URL}/logs/email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ clientName, service })
    });
}