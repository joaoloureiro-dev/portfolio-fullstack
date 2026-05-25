import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
// 1. IMPORTA A FUNÇÃO DO TEU FICHEIRO DE SERVIÇOS
import { getAnalytics } from "../services/api";

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
}

export default function AnalyticsDashboard() {
    const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAnalytics() {
            setLoading(true);
            try {
                // 1. Puxa apenas o token do localStorage
                const token = localStorage.getItem("token") || "";

                // 2. Passa o token E o período atual (estado) para a função
                const result = await getAnalytics(token, period);

                // 3. Guarda o resultado no estado se ele existir
                if (result) {
                    setData(result);
                }
            } catch (error) {
                console.error("Erro ao carregar dados do Analytics:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, [period]); // Executa sempre que o período mudar

    // Formata os segundos vindos do GA4 para um formato legível (ex: 75s -> 1m 15s)
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    };

    return (
        <div className="min-h-screen bg-(--color-bg) text-white p-6 md:p-10">

            {/* 🔙 BOTÃO VOLTAR */}
            <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-zinc-500 hover:text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-6 transition-all cursor-pointer group"
            >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </button>

            {/* HEADER DA PÁGINA */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 border-b border-(--color-border) pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Google Analytics<span className="text-(--color-primary)">.</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">
                        Real-time monitoring of traffic and user behavior
                    </p>
                </div>

                {/* FILTRO DE PERÍODO */}
                <div className="flex bg-(--color-bg-secondary) border border-(--color-border) p-1 rounded-xl">
                    {(["7d", "30d", "90d"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setPeriod(t)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${period === t
                                ? "bg-(--color-primary) text-white"
                                : "text-zinc-500 hover:text-white"
                                }`}
                        >
                            {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "90 Days"}
                        </button>
                    ))}
                </div>
            </div>

            {/* 📊 GRID DE CARDS PRINCIPAIS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 w-full">

                {/* CARD 1: Visualizações */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-32">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Page Views</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tight">
                            {loading ? "--" : (data?.totals?.pageViews ?? 0).toLocaleString()}
                        </h3>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold mt-2 inline-block">Total do período</span>
                </div>

                {/* CARD 2: Utilizadores Únicos */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-32">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Unique Visitors</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tight">
                            {loading ? "--" : (data?.totals?.visitors ?? 0).toLocaleString()}
                        </h3>
                    </div>
                    <span className="text-emerald-500 text-[10px] font-bold mt-2 inline-block">Dados em tempo real</span>
                </div>

                {/* CARD 3: Tempo Médio */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-32">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Avg. Engagement Time</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tight">
                            {loading ? "--s" : formatDuration(data?.totals?.avgDuration || 0)}
                        </h3>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold mt-2 inline-block">Média por sessão</span>
                </div>

                {/* CARD 4: Bounce Rate */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-32">
                    <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Bounce Rate</p>
                        <h3 className="text-3xl font-black mt-2 tracking-tight">
                            {loading ? "--%" : `${data?.totals?.bounceRate ?? 0}%`}
                        </h3>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold mt-2 inline-block">Taxa de rejeição</span>
                </div>

            </div>

            {/* 📈 ÁREA DO GRÁFICO PRINCIPAL */}
            <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-3xl h-[100] flex flex-col justify-between">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                            A carregar métricas reais do Google Analytics...
                        </p>
                    </div>
                ) : !data || !data.chartData || data.chartData.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                            Sem dados disponíveis para este período
                        </p>
                    </div>
                ) : (
                    <div className="w-full h-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} dy={10} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dx={5} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#18181b", borderColor: "var(--color-border)", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                                    labelStyle={{ fontWeight: "bold", color: "#a1a1aa", marginBottom: "4px" }}
                                />
                                <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="var(--color-primary, #6366f1)" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                                <Area type="monotone" dataKey="visitors" name="Unique Visitors" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

        </div>
    );
}