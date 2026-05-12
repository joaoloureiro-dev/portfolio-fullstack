import { useEffect, useState } from "react";

interface Log {
    id: number;
    username: string;
    details: string;
    created_at: string;
    action: string;
}

export function ActivityLog() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch("http://localhost:3000/logs", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await response.json();
                // SEGURANÇA: Só faz set se data for um array
                if (Array.isArray(data)) {
                    setLogs(data);
                } else {
                    setLogs([]);
                }
            } catch (err) {
                console.error("Erro ao carregar logs", err);
                setLogs([]); // Evita que fique undefined
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-full">
            <h3 className="text-white font-black text-sm mb-6 flex items-center gap-2 uppercase tracking-tighter">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Recent Activity
            </h3>

            <div className="space-y-6 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                {/* O ? garante que não quebra se for null */}
                {logs?.map((log) => (
                    <div key={log.id} className="border-l-2 border-orange-500/20 pl-4 py-1 group hover:border-orange-500 transition-colors">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            <span className="font-bold text-orange-400">@{log.username?.toLowerCase() || 'system'}</span> {log.details}
                        </p>
                        <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1 block">
                            {new Date(log.created_at).toLocaleString('pt-PT')}
                        </span>
                    </div>
                ))}

                {(!logs || logs.length === 0) && (
                    <p className="text-zinc-600 text-[10px] uppercase font-bold italic text-center py-10">
                        No activity recorded yet.
                    </p>
                )}
            </div>
        </div>
    );
}