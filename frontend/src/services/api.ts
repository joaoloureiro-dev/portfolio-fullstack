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