import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests, updateRequestStatus, getAnalytics } from "../services/api";
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
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [token]);

    async function handleStatusChange(id: number, status: string) {
        if (!token) return;
        try {
            const updated = await updateRequestStatus(id, status, token);
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: updated.status } : r));
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update inquiry status.");
        }
    }

    const stats = useMemo(() => {
        const p = requests.filter(r => r.status === "pending").length;
        const i = requests.filter(r => r.status === "in_progress").length;
        const d = requests.filter(r => r.status === "done").length;
        return {
            pending: p,
            inProgress: i,
            done: d,
            chart: [
                { name: "Pending", value: p, color: "#3f3f46" },
                { name: "In Progress", value: "#ff7b00" }, // var(--color-primary) hex
                { name: "Done", value: "#22c55e" }
            ]
        };
    }, [requests]);

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
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Requests" value={requests.length} />
                <StatCard title="Active Users" value={analytics?.activeUsers || 0} growth={analytics?.growth} />
                <StatCard title="Page Views" value={analytics?.screenPageViews || 0} />
                <StatCard title="Top Service" value={analytics?.topService || "N/A"} isSmall />
            </div>

            {/* CHART SECTION */}
            <div className="bg-(--color-bg-secondary) p-6 rounded-2xl border border-(--color-border) mb-8">
                <h2 className="text-lg font-black mb-6 flex items-center gap-2 text-(--color-primary) italic tracking-tighter uppercase">
                    <span className="w-2 h-2 bg-(--color-primary) rounded-full shadow-[0_0_8px_var(--color-primary)]"></span>
                    Inquiry Volume
                </h2>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 11, fontWeight: 700 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#71717a', fontSize: 11 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{
                                    backgroundColor: '#0f0f0f',
                                    border: '1px solid #1f1f1f',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                                {stats.chart.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LIST OF INQUIRIES */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-(--color-primary) mb-4 italic tracking-tighter uppercase">
                    Recent Inquiries
                </h2>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-24 bg-zinc-900 rounded-2xl"></div>
                        <div className="h-24 bg-zinc-900 rounded-2xl"></div>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div key={req.id} className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-zinc-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-white tracking-tight">{req.name}</h3>
                                    <StatusBadge status={req.status} />
                                </div>
                                <p className="text-zinc-500 text-sm">{req.email}</p>
                                <p className="text-(--color-primary) text-xs font-black mt-1 uppercase tracking-widest">
                                    {req.service}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <select
                                    value={req.status}
                                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                    className="bg-(--color-bg) text-xs text-white font-bold p-3 rounded-xl border border-(--color-border) focus:border-(--color-primary) outline-none cursor-pointer uppercase tracking-tighter transition-colors"
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

function StatCard({ title, value, growth, isSmall }: any) {
    return (
        <div className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) transition-all hover:border-(--color-primary)/30 group">
            <p className="text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                {title}
            </p>
            <div className="flex items-baseline gap-2">
                <h2 className={`${isSmall ? 'text-lg' : 'text-3xl'} font-black text-white tracking-tighter`}>
                    {value}
                </h2>
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