import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests } from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

type Request = {
    id: number;
    name: string;
    email: string;
    service: string;
    status: string;
};

export default function Dashboard() {
    const { token } = useAuth();

    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            if (!token) return;

            const data = await getRequests(token);
            setRequests(data);

            setLoading(false);
        }

        load();
    }, [token]);

    const total = requests.length;
    const pending = requests.filter(r => r.status === "pending").length;
    const done = requests.filter(r => r.status === "done").length;

    return (
        <DashboardLayout>

            {/* CARDS */}
            <div className="grid grid-cols-3 gap-4 mb-8">

                <div className="bg-zinc-900 p-4 rounded-xl">
                    <p className="text-zinc-400">Total</p>
                    <h2 className="text-2xl font-bold">{total}</h2>
                </div>

                <div className="bg-zinc-900 p-4 rounded-xl">
                    <p className="text-zinc-400">Pending</p>
                    <h2 className="text-2xl font-bold">{pending}</h2>
                </div>

                <div className="bg-zinc-900 p-4 rounded-xl">
                    <p className="text-zinc-400">Done</p>
                    <h2 className="text-2xl font-bold">{done}</h2>
                </div>

            </div>

            {/* LISTA */}
            <div className="space-y-4">

                {loading && (
                    <p className="text-zinc-400">Loading...</p>
                )}

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="bg-zinc-900 p-4 rounded-xl flex justify-between"
                    >

                        <div>
                            <p className="font-bold">{req.name}</p>
                            <p className="text-sm text-zinc-400">
                                {req.email}
                            </p>
                            <p className="text-sm text-zinc-400">
                                {req.service}
                            </p>
                        </div>

                        {/* STATUS BADGE */}
                        <div>
                            <span className={`
                                px-3 py-1 rounded-full text-xs
                                ${req.status === "pending" && "bg-yellow-500 text-black"}
                                ${req.status === "in_progress" && "bg-blue-500 text-black"}
                                ${req.status === "done" && "bg-green-500 text-black"}
                            `}>
                                {req.status}
                            </span>
                        </div>

                    </div>
                ))}

            </div>

        </DashboardLayout>
    );
}