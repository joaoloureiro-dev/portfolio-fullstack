import { useState } from "react";

export default function AnalyticsDashboard() {
    // Estado falso para simular filtros de data futuros (Últimos 7 dias, 30 dias, etc.)
    const [period, setPeriod] = useState("7d");

    return (
        <div className="min-h-screen bg-(--color-bg) text-white p-6 md:p-10">

            {/* HEADER DA PÁGINA */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 border-b border-(--color-border) pb-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        Google Analytics<span className="text-(--color-primary)">.</span>
                    </h1>
                    <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mt-1">
                        Monitorização de tráfego e comportamento em tempo real
                    </p>
                </div>

                {/* FILTRO DE PERÍODO */}
                <div className="flex bg-(--color-bg-secondary) border border-(--color-border) p-1 rounded-xl">
                    {["7d", "30d", "90d"].map((t) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* CARD 1: Visualizações */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Page Views</p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight">--</h3>
                    <span className="text-emerald-500 text-[10px] font-bold mt-1 inline-block">A aguardar dados</span>
                </div>

                {/* CARD 2: Utilizadores Únicos */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Unique Visitors</p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight">--</h3>
                    <span className="text-emerald-500 text-[10px] font-bold mt-1 inline-block">A aguardar dados</span>
                </div>

                {/* CARD 3: Tempo Médio */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Avg. Engagement Time</p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight">--s</h3>
                    <span className="text-zinc-500 text-[10px] font-bold mt-1 inline-block">Tempo real</span>
                </div>

                {/* CARD 4: Bounce Rate */}
                <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Bounce Rate</p>
                    <h3 className="text-3xl font-black mt-2 tracking-tight">--%</h3>
                    <span className="text-zinc-500 text-[10px] font-bold mt-1 inline-block">Taxa de rejeição</span>
                </div>

            </div>

            {/* 📈 ÁREA DO GRÁFICO PRINCIPAL */}
            <div className="bg-(--color-bg-secondary) border border-(--color-border) p-6 rounded-3xl min-h-100 flex items-center justify-center">
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                    Espaço reservado para o gráfico de acessos
                </p>
            </div>

        </div>
    );
}