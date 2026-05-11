import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests, updateRequestStatus, getAnalytics } from "../services/api"; // Adicionei getAnalytics
import DashboardLayout from "../layouts/DashboardLayout";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

type Request = {
    id: number;
    name: string;
    email: string;
    service: string;
    status: string;
};

type Analytics = {
    activeUsers: number;
    screenPageViews: number;
    topService: string;
    growth: string;
};

export default function Dashboard() {
    const { token, role } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        async function loadData() {
            try {
                // Carrega ambos em paralelo para performance profissional
                const [requestsData, analyticsData] = await Promise.all([
                    getRequests(token as string),
                    getAnalytics(token as string) // Criar esta função no teu services/api.ts
                ]);
                setRequests(requestsData);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [token]);

    if (!loading && role !== "admin") {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center p-8 bg-zinc-900 rounded-2xl border border-red-500/50">
                    <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                    <p className="text-zinc-400">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    async function handleStatusChange(id: number, status: string) {
        if (!token) return;
        try {
            const updated = await updateRequestStatus(id, status, token);
            setRequests((prev) => prev.map((r) => r.id === id ? updated : r));
        } catch (err) {
            console.error(err);
        }
    }

    // Cálculos de métricas
    const pending = requests.filter(r => r.status === "pending").length;
    const inProgress = requests.filter(r => r.status === "in_progress").length;
    const done = requests.filter(r => r.status === "done").length;

    const chartData = [
        { name: "Pending", value: pending, color: "#eab308" }, // Amarelo
        { name: "In Progress", value: inProgress, color: "#3b82f6" }, // Azul
        { name: "Done", value: done, color: "#22c55e" } // Verde
    ];

    return (
        <DashboardLayout>
            {/* GRID DE CARDS - Responsivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Stats da BD Local */}
                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Total Requests</p>
                    <h2 className="text-3xl font-bold mt-1">{requests.length}</h2>
                </div>

                {/* Stats do "Google Analytics" */}
                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Active Users (7d)</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl font-bold mt-1">{analytics?.activeUsers || 0}</h2>
                        <span className="text-green-500 text-sm font-bold">{analytics?.growth}</span>
                    </div>
                </div>

                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Page Views</p>
                    <h2 className="text-3xl font-bold mt-1">{analytics?.screenPageViews || 0}</h2>
                </div>

                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Top Service</p>
                    <h2 className="text-lg font-bold mt-2 truncate">{analytics?.topService || "N/A"}</h2>
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Requests Overview
                </h2>

                {/* A solução está aqui: Definimos uma altura fixa de 300px na div pai 
       para o ResponsiveContainer não ficar "perdido" a tentar calcular o tamanho.
    */}
                <div className="h-[300px] w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #3f3f46',
                                    borderRadius: '12px'
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LISTA DE PEDIDOS - Mobile First */}
            <div className="grid gap-4">
                <h2 className="text-xl font-bold mb-2">Recent Inquiries</h2>
                {loading ? (
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-20 bg-zinc-800 rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-zinc-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg">{req.name}</h3>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${req.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                        req.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                                            'bg-green-500/10 text-green-500'
                                        }`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-zinc-400 text-sm">{req.email}</p>
                                <p className="text-blue-400 text-xs font-medium mt-1 uppercase tracking-tighter">{req.service}</p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <select
                                    value={req.status}
                                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                    className="bg-zinc-800 text-sm text-white font-medium p-2.5 rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}