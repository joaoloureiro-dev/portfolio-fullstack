import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests } from "../services/api";

type Request = {
    id: number;
    name: string;
    email: string;
    service: string;
    status: string;
    created_at: string;
};

export default function Dashboard() {
    const { token } = useAuth();

    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                if (!token) return;

                const data = await getRequests(token);
                setRequests(data);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-10">

            <h1 className="text-3xl font-bold mb-6">
                Dashboard
            </h1>

            <div className="space-y-4">

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="bg-zinc-900 p-4 rounded-lg"
                    >
                        <p><strong>{req.name}</strong></p>
                        <p>{req.email}</p>
                        <p>{req.service}</p>
                        <p>Status: {req.status}</p>
                    </div>
                ))}

            </div>

        </div>
    );
}