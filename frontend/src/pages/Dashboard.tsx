import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

import {
    getRequests,
    updateRequestStatus,
    getDashboardAnalytics,
    deleteRequest,
    clearActivityLogs,
    logEmailSent
} from "../services/api";

import DashboardLayout from "../layouts/DashboardLayout";
import { ActivityLog } from "../components/ActivityLog";
import { Skeleton } from "../components/Skeleton";

import { toast } from "sonner";
import { Mail, Trash2, LogOut } from "lucide-react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    CartesianGrid
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

const emptyAnalytics: Analytics = {
    activeUsers: 0,
    screenPageViews: 0,
    topService: "N/A",
    growth: "0%"
};

export default function Dashboard() {
    const { token, role } = useAuth();

    const [requests, setRequests] = useState<Request[]>([]);
    const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [refreshLogs, setRefreshLogs] = useState(0);

    const [confirmDeleteId, setConfirmDeleteId] =
        useState<number | null>(null);

    const [confirmClearLogs, setConfirmClearLogs] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    const [clearingLogs, setClearingLogs] =
        useState(false);

    // ============================================
    // LOAD DASHBOARD DATA
    // ============================================
    const loadDashboardData = useCallback(async (showLoading = true) => {
        if (!token) {
            return;
        }

        if (showLoading) {
            setLoading(true);
        }

        try {
            const [requestsData, analyticsData] = await Promise.all([
                getRequests(),
                getDashboardAnalytics()
            ]);

            setRequests(
                Array.isArray(requestsData)
                    ? requestsData
                    : []
            );

            setAnalytics({
                activeUsers:
                    Number(analyticsData?.activeUsers) || 0,

                screenPageViews:
                    Number(analyticsData?.screenPageViews) || 0,

                topService:
                    analyticsData?.topService || "N/A",

                growth:
                    analyticsData?.growth || "0%"
            });

        } catch (error) {
            console.error("Dashboard error:", error);
            toast.error("Error loading dashboard data");
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, [token]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // ============================================
    // FILTERED REQUESTS
    // ============================================
    const filteredRequests = useMemo(() => {
        const normalizedSearch = searchTerm.toLowerCase();

        return requests.filter((req) => {
            const matchesSearch =
                req.name.toLowerCase().includes(normalizedSearch) ||
                req.email.toLowerCase().includes(normalizedSearch) ||
                req.service.toLowerCase().includes(normalizedSearch);

            const matchesStatus =
                filterStatus === "all" ||
                req.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, filterStatus]);

    // ============================================
    // REQUEST STATUS CHART
    // ============================================
    const stats = useMemo(() => {
        const pending =
            requests.filter((request) => request.status === "pending").length;

        const inProgress =
            requests.filter((request) => request.status === "in_progress").length;

        const done =
            requests.filter((request) => request.status === "done").length;

        return {
            chart: [
                {
                    name: "Pending",
                    value: pending,
                    color: "#3f3f46"
                },
                {
                    name: "In Progress",
                    value: inProgress,
                    color: "#f97316"
                },
                {
                    name: "Done",
                    value: done,
                    color: "#22c55e"
                }
            ]
        };
    }, [requests]);

    // ============================================
    // EXPORT CSV
    // ============================================
    function handleExportCSV(scope: "all" | "filtered") {
        const dataToExport =
            scope === "all"
                ? requests
                : filteredRequests;

        if (!dataToExport.length) {
            toast.error("No data to export");
            return;
        }

        const escapeValue = (value: unknown) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`;

        const headers = [
            "ID",
            "Client",
            "Email",
            "Service",
            "Message",
            "Status",
            "Date"
        ];

        const csvRows = dataToExport.map((request) => [
            request.id,
            escapeValue(request.name),
            escapeValue(request.email),
            escapeValue(request.service),
            escapeValue(request.message),
            escapeValue(request.status.toUpperCase()),
            escapeValue(
                request.created_at
                    ? new Date(request.created_at).toLocaleDateString("pt-PT")
                    : "N/A"
            )
        ].join(","));

        const csvContent =
            [headers.join(","), ...csvRows].join("\n");

        const blob = new Blob(
            ["\ufeff" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download =
            `export_${scope}_${new Date().toISOString().split("T")[0]}.csv`;

        link.click();

        URL.revokeObjectURL(url);

        toast.success(`Export (${scope}) successful!`);
    }

    // ============================================
    // STATUS CHANGE
    // ============================================
    async function handleStatusChange(id: number, status: string) {
        try {
            await toast.promise(
                updateRequestStatus(id, status),
                {
                    loading: "Updating status...",
                    success: "Status updated successfully",
                    error: "Could not update status."
                }
            );

            await loadDashboardData(false);
            setRefreshLogs((previous) => previous + 1);

        } catch (error) {
            console.error("Status update error:", error);
        }
    }

    // ============================================
    // EMAIL
    // ============================================
    async function handleEmailClick(request: Request) {
        try {
            await logEmailSent(
                request.name,
                request.service
            );

            setRefreshLogs((previous) => previous + 1);

        } catch (error) {
            console.error("Email log error:", error);
            toast.error("Could not register email activity");
        }

        const gmailUrl =
            `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.email)}&su=${encodeURIComponent(
                `Regarding your request for ${request.service}`
            )}&body=${encodeURIComponent(
                `Hello ${request.name},\n\nRegarding your message: "${request.message}"\n\n`
            )}`;

        window.open(
            gmailUrl,
            "_blank",
            "noopener,noreferrer"
        );
    }

    // ============================================
    // DELETE REQUEST
    // ============================================
    async function handleDeleteRequest(id: number) {
        setDeletingId(id);

        try {
            await deleteRequest(id);

            setRequests((previous) =>
                previous.filter((request) => request.id !== id)
            );

            setConfirmDeleteId(null);
            setRefreshLogs((previous) => previous + 1);

            toast.success("Request deleted successfully");

            await loadDashboardData(false);

        } catch (error) {
            console.error("Delete request error:", error);
            toast.error("Failed to delete request");
        } finally {
            setDeletingId(null);
        }
    }

    // ============================================
    // CLEAR LOGS
    // ============================================
    async function handleClearLogs() {
        setClearingLogs(true);

        try {
            await clearActivityLogs();

            setConfirmClearLogs(false);
            setRefreshLogs((previous) => previous + 1);

            toast.success("Activity log cleared");

        } catch (error) {
            console.error("Clear logs error:", error);
            toast.error("Failed to clear activity log");
        } finally {
            setClearingLogs(false);
        }
    }

    // ============================================
    // ACCESS DENIED
    // ============================================
    if (!loading && role !== "admin") {
        return (
            <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">
                <div className="text-center p-8 bg-(--color-bg-secondary) rounded-2xl border border-red-500/30 max-w-sm">
                    <h1 className="text-xl font-bold text-white mb-2">
                        Access Denied
                    </h1>

                    <p className="text-zinc-500 text-sm">
                        You don't have permission to view this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <DashboardLayout>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {loading ? (
                    [...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) h-24"
                        >
                            <Skeleton className="w-16 h-3 mb-3" />
                            <Skeleton className="w-24 h-8" />
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Total Requests"
                            value={requests.length}
                        />

                        <StatCard
                            title="Active Users"
                            value={analytics.activeUsers}
                            growth={analytics.growth}
                        />

                        <StatCard
                            title="Page Views"
                            value={analytics.screenPageViews}
                        />

                        <StatCard
                            title="Top Service"
                            value={analytics.topService}
                            isSmall
                        />
                    </>
                )}
            </div>

            {/* CHART */}
            <div className="w-full bg-(--color-bg-secondary)/50 border border-(--color-border) rounded-2xl p-6 mb-8 min-w-0">
                <header className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-black text-[10px] uppercase tracking-tighter flex items-center gap-2 opacity-50">
                        <span className="w-1 h-3 bg-orange-500 rounded-full" />
                        Inquiry Volume
                    </h2>

                    <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">
                        Current Requests
                    </span>
                </header>

                <div className="w-full h-[100] min-h-[100] min-w-0">
                    {loading ? (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-8 h-8 border-2 border-orange-500/10 border-t-orange-500 rounded-full animate-spin" />

                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] animate-pulse">
                                Fetching Analytics...
                            </p>
                        </div>
                    ) : stats.chart.some((item) => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={stats.chart}
                                margin={{
                                    top: 0,
                                    right: 0,
                                    left: -25,
                                    bottom: 0
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="barGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#f97316"
                                            stopOpacity={0.8}
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#f97316"
                                            stopOpacity={0.05}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#27272a"
                                    opacity={0.4}
                                />

                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#71717a",
                                        fontSize: 9,
                                        fontWeight: 800
                                    }}
                                    dy={10}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#71717a",
                                        fontSize: 9
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "#27272a",
                                        opacity: 0.3
                                    }}
                                    contentStyle={{
                                        backgroundColor: "#09090b",
                                        border: "1px solid #27272a",
                                        borderRadius: "8px",
                                        fontSize: "10px",
                                        fontWeight: 900,
                                        textTransform: "uppercase"
                                    }}
                                    itemStyle={{
                                        color: "#f97316"
                                    }}
                                    labelStyle={{
                                        color: "#fff",
                                        marginBottom: "4px"
                                    }}
                                />

                                <Bar
                                    dataKey="value"
                                    fill="url(#barGradient)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                >
                                    {stats.chart.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={
                                                entry.name === "In Progress"
                                                    ? "url(#barGradient)"
                                                    : entry.color
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] italic opacity-40">
                                No data detected
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* REQUESTS + LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* REQUESTS */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <input
                                type="text"
                                placeholder="Search client or service..."
                                className="w-full sm:flex-1 bg-(--color-bg-secondary) border border-(--color-border) p-2.5 rounded-xl text-xs text-white focus:border-(--color-primary) outline-none font-bold"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />

                            <div className="flex gap-2 self-end sm:self-auto">
                                <button
                                    onClick={() => handleExportCSV("all")}
                                    className="px-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-[10px] font-black uppercase hover:border-white hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                    All
                                </button>

                                <button
                                    onClick={() => handleExportCSV("filtered")}
                                    className="px-3 py-2 rounded-xl border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all cursor-pointer whitespace-nowrap"
                                >
                                    Filtered
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto w-full pb-2 scrollbar-none snap-x flex-nowrap">
                            {["all", "pending", "in_progress", "done"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer snap-start whitespace-nowrap ${filterStatus === status
                                        ? "bg-(--color-primary) text-white border-(--color-primary)"
                                        : "bg-transparent text-zinc-500 border-(--color-border)"
                                        }`}
                                >
                                    {status.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            [...Array(3)].map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) h-32"
                                >
                                    <Skeleton className="w-48 h-5 mb-4" />
                                    <Skeleton className="w-full h-12 rounded-lg" />
                                </div>
                            ))
                        ) : filteredRequests.length > 0 ? (
                            filteredRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) flex flex-col gap-4 transition-all hover:bg-zinc-900/30 group relative"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <h3 className="font-bold text-white text-lg">
                                                    {request.name}
                                                </h3>

                                                <StatusBadge status={request.status} />
                                            </div>

                                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest break-all">
                                                {request.email}
                                                {" • "}
                                                <span className="text-(--color-primary)">
                                                    {request.service}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 self-start sm:self-auto">
                                            <select
                                                value={request.status}
                                                onChange={(event) =>
                                                    handleStatusChange(
                                                        request.id,
                                                        event.target.value
                                                    )
                                                }
                                                className="bg-(--color-bg) text-[10px] text-white font-black uppercase p-2.5 rounded-xl border border-zinc-800 outline-none cursor-pointer focus:border-(--color-primary) h-9"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="done">Done</option>
                                            </select>

                                            <button
                                                onClick={() => handleEmailClick(request)}
                                                className="p-2.5 bg-white text-black rounded-xl hover:bg-(--color-primary) hover:text-white transition-all flex items-center justify-center w-9 h-9 cursor-pointer"
                                                title="Reply via Gmail"
                                            >
                                                <Mail size={14} strokeWidth={2.5} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setConfirmDeleteId(request.id)
                                                }
                                                className="p-2.5 bg-zinc-800/80 text-zinc-400 rounded-xl hover:bg-red-500/20 hover:text-red-500 border border-zinc-700/50 hover:border-red-500/30 transition-all flex items-center justify-center w-9 h-9 cursor-pointer"
                                                title="Delete Request"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                                        <p className="text-zinc-400 text-sm italic leading-relaxed">
                                            "{request.message || "No message provided."}"
                                        </p>
                                    </div>

                                    <div className="flex justify-end">
                                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">
                                            Received on:{" "}
                                            {request.created_at
                                                ? new Date(request.created_at).toLocaleString()
                                                : "N/A"}
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

                {/* LOGS */}
                <div className="lg:col-span-1 bg-(--color-bg-secondary)/30 p-4 rounded-2xl border border-(--color-border) flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                            Live Activity Log
                        </h4>

                        <button
                            onClick={() => setConfirmClearLogs(true)}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-red-400 transition-all cursor-pointer bg-zinc-800/40 px-2 py-1 rounded-md border border-zinc-700/30"
                        >
                            <LogOut size={10} className="rotate-90" />
                            Clear Logs
                        </button>
                    </div>

                    <ActivityLog key={refreshLogs} />
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-(--color-bg-secondary) border border-red-500/20 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-xl font-black text-white mb-2">
                            Delete Request
                        </h2>

                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            Are you sure you want to permanently delete this request?
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDeleteId(null)}
                                disabled={deletingId !== null}
                                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-black uppercase hover:text-white transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() =>
                                    handleDeleteRequest(confirmDeleteId)
                                }
                                disabled={deletingId !== null}
                                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase transition-all cursor-pointer disabled:opacity-50"
                            >
                                {deletingId !== null ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CLEAR LOGS CONFIRMATION MODAL */}
            {confirmClearLogs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-(--color-bg-secondary) border border-orange-500/20 rounded-3xl p-6 shadow-2xl">
                        <h2 className="text-xl font-black text-white mb-2">
                            Clear Activity Logs
                        </h2>

                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            This will permanently remove all activity history.
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmClearLogs(false)}
                                disabled={clearingLogs}
                                className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-black uppercase hover:text-white transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleClearLogs}
                                disabled={clearingLogs}
                                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase transition-all cursor-pointer disabled:opacity-50"
                            >
                                {clearingLogs ? "Clearing..." : "Clear Logs"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
}

function StatCard({
    title,
    value,
    growth,
    isSmall
}: {
    title: string;
    value: string | number;
    growth?: string;
    isSmall?: boolean;
}) {
    return (
        <div className="bg-(--color-bg-secondary) p-5 rounded-2xl border border-(--color-border) transition-all hover:border-(--color-primary)/30">
            <p className="text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                {title}
            </p>

            <div className="flex items-baseline gap-2">
                <h2 className={`${isSmall ? "text-lg" : "text-3xl"} font-black text-white tracking-tighter`}>
                    {value}
                </h2>

                {growth && (
                    <span className="text-green-500 text-xs font-bold">
                        {growth}
                    </span>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-zinc-800 text-zinc-400",
        in_progress: "bg-(--color-primary)/10 text-(--color-primary)",
        done: "bg-green-500/10 text-green-500"
    };

    return (
        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded tracking-tighter ${styles[status] || styles.pending}`}>
            {status.replace("_", " ")}
        </span>
    );
}