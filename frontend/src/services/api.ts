const API_URL = "http://localhost:3000";

// Função auxiliar para evitar repetir código e tratar erros globais
async function authorizedFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, options);

    if (res.status === 403) {
        window.location.href = "/unauthorized";
        return;
    }

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    return res.json();
}

// 1. LISTAR PEDIDOS
export async function getRequests(token: string) {
    return authorizedFetch(`${API_URL}/admin/requests`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

// 2. ATUALIZAR STATUS
export async function updateRequestStatus(id: number, status: string, token: string) {
    return authorizedFetch(`${API_URL}/admin/requests/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}

// 3. OBTER ANALYTICS (Agora usando o authorizedFetch corretamente)
export async function getAnalytics(token: string) {
    return authorizedFetch(`${API_URL}/admin/analytics`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
}