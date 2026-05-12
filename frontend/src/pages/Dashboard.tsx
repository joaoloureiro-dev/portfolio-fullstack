import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests, updateRequestStatus, getAnalytics } from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { toast } from "sonner"; // 1. Importar o toast
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ... Types (mantêm-se iguais) ...
type Request = {
    id: number;
    name: string;
    email: string;
    service: string;
    status: string;
    created_at?: string;
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
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        if (!token) return;

        async function loadData() {
            try {
                const [requestsData, analyticsData] = await Promise.all([
                    getRequests(token as string),
                    getAnalytics(token as string)
                ]);
                setRequests(requestsData);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error("Data loading error:", err);
                toast.error("Failed to load dashboard data"); // Toast de erro no load
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [token]);

    // ... Lógica de filteredRequests e stats (mantêm-se iguais) ...
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesSearch =
                req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || req.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, filterStatus]);

    // 2. Função handleStatusChange ATUALIZADA com Sonner
    async function handleStatusChange(id: number, status: string) {
        if (!token) return;

        // Criamos a promessa da API
        const promise = updateRequestStatus(id, status, token).then((updated) => {
            setRequests((prev) =>
                prev.map((r) => r.id === id ? { ...r, status: updated.status } : r)
            );
            return updated;
        });

        // Disparamos o toast profissional
        toast.promise(promise, {
            loading: 'Updating status...',
            success: () => `Inquiry marked as ${status.replace('_', ' ')}`,
            error: 'Could not update status.',
        });
    }

    const stats = useMemo(() => {
        const p = requests.filter(r => r.status === "pending").length;
        const i = requests.filter(r => r.status === "in_progress").length;
        const d = requests.filter(r => r.status === "done").length;
        return {
            pending: p, inProgress: i, done: d,
            chart: [
                { name: "Pending", value: p, color: "#3f3f46" },
                { name: "In Progress", value: i, color: "#ff7b00" },
                { name: "Done", value: d, color: "#22c55e" }
            ]
        };
    }, [requests]);

    // ... Restante do JSX (mantém-se igual) ...
    if (!loading && role !== "admin") {
        return (
            <div className="min-h-screen bg-(--color-bg) flex items-center justify-center">
                <div className="text-center p-8 bg-(--color-bg-secondary) rounded-2xl border border-red-500/30">
                    <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-zinc-500">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            {/* ... Todo o teu layout de cards, gráfico e filtros ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Requests" value={requests.length} />
                <StatCard title="Active Users" value={analytics?.activeUsers || 0} growth={analytics?.growth} />
                <StatCard title="Page Views" value={analytics?.screenPageViews || 0} />
                <StatCard title="Top Service" value={analytics?.topService || "N/A"} isSmall />
            </div>

            <div className="bg-(--color-bg-secondary) p-6 rounded-2xl border border-(--color-border) mb-8">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-(--color-primary) italic uppercase tracking-tighter">
                    Inquiry Volume
                </h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chart}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#0f0f0f', border: '1px solid #1f1f1f', borderRadius: '12px' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                                {stats.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                <input
                    type="text"
                    placeholder="Search inquiries..."
                    className="w-full md:w-96 bg-(--color-bg-secondary) border border-(--color-border) p-3 rounded-xl text-xs text-white focus:border-(--color-primary) outline-none font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["all", "pending", "in_progress", "done"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${filterStatus === status ? "bg-(--color-primary) text-white border-(--color-primary)" : "bg-transparent text-zinc-500 border-(--color-border)"
                                }`}
                        >
                            {status.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-white text-center">Loading inquiries...</p>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) flex justify-between items-center transition-all hover:bg-zinc-900/50">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-white">{req.name}</h3>
                                    <StatusBadge status={req.status} />
                                </div>
                                <p className="text-zinc-500 text-sm">{req.email}</p>
                            </div>
                            <select
                                value={req.status}
                                onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                className="bg-(--color-bg) text-xs text-white font-bold p-2 rounded-lg border border-(--color-border) outline-none cursor-pointer hover:border-(--color-primary)"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border border-dashed border-(--color-border) rounded-2xl text-zinc-500 text-xs font-bold uppercase">
                        No matches found.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

// ... StatCard e StatusBadge (mantêm-se iguais) ...
function StatCard({ title, value, growth, isSmall }: any) {
    return (
        <div className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) transition-all hover:border-(--color-primary)/30">
            <p className="text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">{title}</p>
            <div className="flex items-baseline gap-2">
                <h2 className={`${isSmall ? 'text-lg' : 'text-3xl'} font-black text-white tracking-tighter`}>{value}</h2>
                {growth && <span className="text-green-500 text-xs font-bold">{growth}</span>}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: "bg-zinc-800 text-zinc-400",
        in_progress: "bg-(--color-primary)/10 text-(--color-primary)",
        done: "bg-green-500/10 text-green-500"
    };
    return (
        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-tighter ${styles[status as keyof typeof styles] || styles.pending}`}>
            {status.replace('_', ' ')}
        </span>
    );
}