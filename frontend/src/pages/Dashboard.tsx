import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getRequests, updateRequestStatus, getAnalytics } from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import { ActivityLog } from "../components/ActivityLog";
import { Skeleton } from "../components/Skeleton";
import { toast } from "sonner";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";

type Request = {
    id: number;
    name: string;
    email: string;
    service: string;
    message: string;
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
            setLoading(true);
            try {
                const requestsData = await getRequests(token as string).catch(() => []);
                const analyticsData = await getAnalytics(token as string).catch(() => null);

                setRequests(Array.isArray(requestsData) ? requestsData : []);
                setAnalytics(analyticsData);
            } catch (err) {
                console.error("Dashboard error:", err);
                toast.error("Error loading some data");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [token]);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesSearch =
                req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.service.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === "all" || req.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, filterStatus]);

    const stats = useMemo(() => {
        const p = requests.filter(r => r.status === "pending").length;
        const i = requests.filter(r => r.status === "in_progress").length;
        const d = requests.filter(r => r.status === "done").length;
        return {
            pending: p, inProgress: i, done: d,
            chart: [
                { name: "Pending", value: p, color: "#3f3f46" },
                { name: "In Progress", value: i, color: "#f97316" },
                { name: "Done", value: d, color: "#22c55e" }
            ]
        };
    }, [requests]);

    const handleExportCSV = (scope: "all" | "filtered") => {
        const dataToExport = scope === "all" ? requests : filteredRequests;
        if (!dataToExport || dataToExport.length === 0) {
            toast.error("No data to export");
            return;
        }
        const headers = ["ID", "Client", "Email", "Service", "Message", "Status", "Date"];
        const csvRows = dataToExport.map(req => [
            req.id, `"${req.name}"`, req.email, `"${req.service}"`, `"${req.message}"`, req.status.toUpperCase(),
            req.created_at ? new Date(req.created_at).toLocaleDateString('pt-PT') : "N/A"
        ].join(","));

        const csvContent = [headers.join(","), ...csvRows].join("\n");
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `export_${scope}_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Export (${scope}) successful!`);
    };

    async function handleStatusChange(id: number, status: string) {
        if (!token) return;
        const promise = updateRequestStatus(id, status, token).then((updated) => {
            setRequests((prev) =>
                prev.map((r) => r.id === id ? { ...r, status: updated.status || status } : r)
            );
            return updated;
        });

        toast.promise(promise, {
            loading: 'Updating status...',
            success: 'Status updated successfully',
            error: 'Could not update status.',
        });
    }

    if (!loading && role !== "admin") {
        return (
            <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">
                <div className="text-center p-8 bg-(--color-bg-secondary) rounded-2xl border border-red-500/30 max-w-sm">
                    <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-zinc-500 text-sm">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>
            {/* STAT CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading ? (
                    <>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) h-24">
                                <Skeleton className="w-16 h-3 mb-3" />
                                <Skeleton className="w-24 h-8" />
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        <StatCard title="Total Requests" value={requests.length} />
                        <StatCard title="Active Users" value={analytics?.activeUsers || 0} growth={analytics?.growth} />
                        <StatCard title="Page Views" value={analytics?.screenPageViews || 0} />
                        <StatCard title="Top Service" value={analytics?.topService || "N/A"} isSmall />
                    </>
                )}
            </div>

            {/* CHART SECTION - UPDATED PROFESSIONAL VERSION */}
            <div className="h-80 w-full bg-(--color-bg-secondary)/50 border border-(--color-border) rounded-2xl p-6 flex flex-col mb-8">
                <header className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-black text-[10px] uppercase tracking-tighter flex items-center gap-2 opacity-50">
                        <span className="w-1 h-3 bg-orange-500 rounded-full"></span>
                        Inquiry Volume
                    </h2>
                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Last 7 Days</span>
                </header>

                <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-2 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">Fetching Analytics...</p>
                        </div>
                    ) : stats.chart.some(d => d.value > 0) ? (
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={stats.chart} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" opacity={0.4} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 9, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 9 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#27272a', opacity: 0.3 }}
                                    contentStyle={{
                                        backgroundColor: '#09090b',
                                        border: '1px solid #27272a',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        textTransform: 'uppercase'
                                    }}
                                    itemStyle={{ color: '#f97316' }}
                                    labelStyle={{ color: '#fff', marginBottom: '4px' }}
                                />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={40}>
                                    {stats.chart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === "In Progress" ? "url(#barGradient)" : entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] italic opacity-40">No data detected</p>
                    )}
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button onClick={() => handleExportCSV("all")} className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase hover:border-white hover:text-white transition-all cursor-pointer">All</button>
                            <button onClick={() => handleExportCSV("filtered")} className="px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all cursor-pointer">Filtered</button>
                            <input
                                type="text"
                                placeholder="Search client or service..."
                                className="flex-1 md:w-64 bg-(--color-bg-secondary) border border-(--color-border) p-2.5 rounded-xl text-xs text-white focus:border-(--color-primary) outline-none font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {["all", "pending", "in_progress", "done"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer whitespace-nowrap ${filterStatus === status ? "bg-(--color-primary) text-white border-(--color-primary)" : "bg-transparent text-zinc-500 border-(--color-border)"}`}
                                >
                                    {status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) h-32">
                                        <Skeleton className="w-48 h-5 mb-4" />
                                        <Skeleton className="w-full h-12 rounded-lg" />
                                    </div>
                                ))}
                            </>
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <div key={req.id} className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) flex flex-col gap-4 transition-all hover:bg-zinc-900/30 group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-white text-lg">{req.name}</h3>
                                                <StatusBadge status={req.status} />
                                            </div>
                                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                                {req.email} • <span className="text-(--color-primary)">{req.service}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <select
                                                value={req.status}
                                                onChange={(e) => handleStatusChange(req.id, e.target.value)}
                                                className="bg-(--color-bg) text-[10px] text-white font-black uppercase p-2 rounded-lg border border-zinc-800 outline-none cursor-pointer focus:border-(--color-primary)"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="done">Done</option>
                                            </select>

                                            <a
                                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${req.email}&su=${encodeURIComponent(`Regarding your request for ${req.service}`)}&body=${encodeURIComponent(`Hello ${req.name},\n\nRegarding your message: "${req.message}"\n\n`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 bg-white text-black rounded-lg hover:bg-(--color-primary) hover:text-white transition-all group"
                                                title="Reply via Gmail"
                                            >
                                                <i className="fa-solid fa-paper-plane text-xs"></i>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            "{req.message || "No message provided."}"
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                                            Received on: {req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 border border-dashed border-(--color-border) rounded-2xl text-zinc-500 text-xs font-bold uppercase">
                                No matches found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ActivityLog />
                </div>
            </div>
        </DashboardLayout>
    );
}

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