const API = "http://localhost:3000";

export async function getRequests(token: string) {
    const res = await fetch(`${API}/admin/requests`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch requests");
    }

    return res.json();
}

export async function updateRequestStatus(
    id: number,
    status: string,
    token: string
) {
    const res = await fetch(`http://localhost:3000/admin/requests/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });

    if (!res.ok) {
        throw new Error("Failed to update status");
    }

    return res.json();
}