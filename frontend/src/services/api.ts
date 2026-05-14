const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function authorizedFetch(url: string, options: RequestInit = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Accept": "application/json",
        }
    });

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
}

// 1. LISTAR PEDIDOS
export async function getRequests(token: string) {
    return authorizedFetch(`${API_URL}/requests`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}

// 2. ATUALIZAR STATUS
export async function updateRequestStatus(id: number, status: string, token: string) {
    return authorizedFetch(`${API_URL}/requests/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}

// 3. OBTER ANALYTICS
export async function getAnalytics(token: string) {
    // Nota: Garante que tens esta rota /analytics configurada no backend
    return authorizedFetch(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
    });
}