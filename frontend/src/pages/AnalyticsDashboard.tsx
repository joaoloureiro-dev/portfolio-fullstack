import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar
} from "recharts";

import { getAnalytics } from "../services/api";

type Period = "24h" | "7d" | "30d" | "90d";

interface AnalyticsData {
    totals: {
        pageViews: number;
        visitors: number;
        avgDuration: number;
        bounceRate: number;
    };

    chartData: Array<{
        date: string;
        visitors: number;
        pageViews: number;
    }>;

    countries: Array<{
        country: string;
        visitors: number;
    }>;
}

const emptyAnalyticsData: AnalyticsData = {
    totals: {
        pageViews: 0,
        visitors: 0,
        avgDuration: 0,
        bounceRate: 0
    },
    chartData: [],
    countries: []
};

export default function AnalyticsDashboard() {
    const navigate = useNavigate();

    const {
        token,
        loading: authLoading,
        logout
    } = useAuth();

    const [period, setPeriod] =
        useState<Period>("7d");

    const [data, setData] =
        useState<AnalyticsData>(emptyAnalyticsData);

    const [loading, setLoading] =
        useState(true);

    const fetchIdRef =
        useRef(0);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!token) {
            setLoading(false);
            return;
        }

        const controller =
            new AbortController();

        const currentFetchId =
            ++fetchIdRef.current;

        async function fetchAnalytics() {
            setLoading(true);

            try {
                console.log("📊 Fetch GA4 Analytics:", period);

                const result = await getAnalytics(
                    period,
                    controller.signal
                );

                if (currentFetchId !== fetchIdRef.current) {
                    return;
                }

                console.log("📊 GA4 Response:", result);

                const normalizedData: AnalyticsData = {
                    totals: {
                        pageViews:
                            Number(result?.totals?.pageViews) || 0,

                        visitors:
                            Number(result?.totals?.visitors) || 0,

                        avgDuration:
                            Number(result?.totals?.avgDuration) || 0,

                        bounceRate:
                            Number(result?.totals?.bounceRate) || 0
                    },

                    chartData:
                        Array.isArray(result?.chartData)
                            ? result.chartData
                            : [],

                    countries:
                        Array.isArray(result?.countries)
                            ? result.countries
                            : []
                };

                setData(normalizedData);

            } catch (error: any) {
                if (error?.name === "AbortError") {
                    return;
                }

                if (error?.message === "UNAUTHORIZED") {
                    console.warn("⚠️ Sessão expirada.");

                    logout();
                    navigate("/login");

                    return;
                }

                console.error("❌ Erro Analytics:", error);

                setData(emptyAnalyticsData);

            } finally {
                if (currentFetchId === fetchIdRef.current) {
                    setLoading(false);
                }
            }
        }

        fetchAnalytics();

        return () => {
            controller.abort();
        };

    }, [
        period,
        token,
        authLoading,
        logout,
        navigate
    ]);

    function formatDuration(seconds: number) {
        const safeSeconds =
            Math.max(0, Math.round(seconds));

        const mins =
            Math.floor(safeSeconds / 60);

        const secs =
            safeSeconds % 60;

        return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    }

    return (
        <div className="min-h-screen bg-(--color-bg) text-white p-6 md:p-10">

            {/* BACK */}
            <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-zinc-500 hover:text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-6 transition-all cursor-pointer group"
            >
                <ArrowLeft
                    size={14}
                    className="transition-transform group-hover:-translate-x-1"
                />

                Back to Dashboard
            </button>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 border-b border-(--color-border) pb-6">

                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Google Analytics
                        <span className="text-(--color-primary)">.</span>
                    </h1>

                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">
                        Traffic and user behavior monitoring
                    </p>
                </div>

                {/* PERIODS */}
                <div className="flex bg-(--color-bg-secondary) border border-(--color-border) p-1 rounded-xl overflow-x-auto">
                    {(["24h", "7d", "30d", "90d"] as const).map((item) => (
                        <button
                            key={item}
                            onClick={() => setPeriod(item)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap ${period === item
                                ? "bg-(--color-primary) text-white"
                                : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            {item === "24h"
                                ? "24 Hours"
                                : item === "7d"
                                    ? "7 Days"
                                    : item === "30d"
                                        ? "30 Days"
                                        : "90 Days"}
                        </button>
                    ))}
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 w-full">

                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        Page Views
                    </p>

                    <h3 className="text-3xl font-black mt-2 tracking-tight">
                        {loading
                            ? "--"
                            : data.totals.pageViews.toLocaleString()}
                    </h3>
                </div>

                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        Unique Visitors
                    </p>

                    <h3 className="text-3xl font-black mt-2 tracking-tight">
                        {loading
                            ? "--"
                            : data.totals.visitors.toLocaleString()}
                    </h3>
                </div>

                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        Avg. Engagement Time
                    </p>

                    <h3 className="text-3xl font-black mt-2 tracking-tight">
                        {loading
                            ? "--"
                            : formatDuration(data.totals.avgDuration)}
                    </h3>
                </div>

                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        Bounce Rate
                    </p>

                    <h3 className="text-3xl font-black mt-2 tracking-tight">
                        {loading
                            ? "--"
                            : `${data.totals.bounceRate}%`}
                    </h3>
                </div>
            </div>

            {/* MAIN TRAFFIC CHART */}
            <section className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-3xl min-w-0">

                <div className="mb-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">
                        Traffic Overview
                    </h2>

                    <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">
                        Page views and visitors over time
                    </p>
                </div>

                <div className="w-full h-[75] min-h-[75] min-w-0">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                Loading Analytics...
                            </p>
                        </div>
                    ) : data.chartData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                                No data available
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data.chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0
                                }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorViews"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-primary)"
                                            stopOpacity={0.25}
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-primary)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>

                                    <linearGradient
                                        id="colorVisitors"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#22c55e"
                                            stopOpacity={0.2}
                                        />

                                        <stop
                                            offset="95%"
                                            stopColor="#22c55e"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#27272a"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="date"
                                    stroke="#71717a"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />

                                <YAxis
                                    stroke="#71717a"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#09090b",
                                        border: "1px solid #27272a",
                                        borderRadius: "12px",
                                        color: "#ffffff",
                                        fontSize: "12px"
                                    }}
                                    labelStyle={{
                                        color: "#a1a1aa",
                                        fontWeight: 700
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="pageViews"
                                    name="Page Views"
                                    stroke="var(--color-primary)"
                                    fill="url(#colorViews)"
                                    strokeWidth={2}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="visitors"
                                    name="Visitors"
                                    stroke="#22c55e"
                                    fill="url(#colorVisitors)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>

            {/* COUNTRIES */}
            <section className="bg-(--color-bg-secondary) border border-(--color-border) p-8 rounded-3xl mt-8 min-w-0">

                <div className="mb-8">
                    <h2 className="text-base font-black uppercase tracking-widest text-white">
                        Top Countries
                    </h2>

                    <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">
                        Visitors by country
                    </p>
                </div>

                <div
                    className="w-full min-w-0"
                    style={{
                        height: `${Math.max(520, (data.countries.length || 1) * 46)}px`
                    }}
                >
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                                Loading Countries...
                            </p>
                        </div>
                    ) : data.countries.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                                No country data
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.countries}
                                layout="vertical"
                                margin={{
                                    top: 0,
                                    right: 40,
                                    left: 45,
                                    bottom: 10
                                }}
                                barCategoryGap="28%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#27272a"
                                    horizontal={false}
                                    vertical={true}
                                />

                                <XAxis
                                    type="number"
                                    stroke="#71717a"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    allowDecimals={false}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="country"
                                    stroke="#71717a"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={145}
                                    interval={0}
                                    tick={{
                                        fill: "#a1a1aa",
                                        fontSize: 12,
                                        fontWeight: 600
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "#27272a",
                                        opacity: 0.25
                                    }}
                                    contentStyle={{
                                        backgroundColor: "#09090b",
                                        border: "1px solid #27272a",
                                        borderRadius: "12px",
                                        color: "#ffffff",
                                        fontSize: "12px"
                                    }}
                                    formatter={(value) => [
                                        Number(value).toLocaleString(),
                                        "Visitors"
                                    ]}
                                />

                                <Bar
                                    dataKey="visitors"
                                    name="Visitors"
                                    fill="var(--color-primary)"
                                    radius={[0, 8, 8, 0]}
                                    barSize={26}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </section>
        </div>
    );
}