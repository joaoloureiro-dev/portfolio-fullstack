const BASE_URL = "http://localhost:3000";

export async function login(username, password) {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    return res.json();
}

export async function getRequests(token) {
    const res = await fetch(`${BASE_URL}/admin/requests`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    return res.json();
}

export async function updateStatus(id, status, token) {
    const res = await fetch(`${BASE_URL}/admin/requests/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    return res.json();
}