import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socket";
import { Skeleton } from "./Skeleton";

interface Log {
    id: number;
    username: string;
    details: string;
    created_at: string;
    action: string;
}

export function ActivityLog() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:3000/logs", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) throw new Error("Failed to fetch logs");

            const data = await response.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("🚨 Error loading activity logs:", err);
            setLogs([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();

        // Guardamos o retorno (que pode ser a função de limpeza ou undefined)
        const unsubscribe = socketService.onMessage((payload) => {
            if (payload.type === "NEW_LOG" || payload.type === "UPDATE_LIST") {
                fetchLogs();
            }
        });

        // Verificamos se unsubscribe existe antes de invocar (corrige o erro de TS)
        return () => {
            if (typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, [fetchLogs]);

    return (
        <div className="bg-(--color-bg-secondary) border border-(--color-border) rounded-2xl p-6 h-full flex flex-col">
            <header className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-sm flex items-center gap-2 uppercase tracking-tighter">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Recent Activity
                </h3>
                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Live Stream</span>
            </header>

            {/* max-h-150 substitui o valor fixo em px */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-150">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="pl-4 py-1 space-y-2">
                            <Skeleton className="w-3/4 h-3" />
                            <Skeleton className="w-1/4 h-2" />
                        </div>
                    ))
                ) : logs.length > 0 ? (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="border-l-2 border-orange-500/10 pl-4 py-1 group hover:border-orange-500 transition-all duration-300"
                        >
                            <p className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-200 transition-colors">
                                <span className="font-bold text-orange-400/80 group-hover:text-orange-500">
                                    @{log.username?.toLowerCase() || 'admin'}
                                </span>{" "}
                                {log.details}
                            </p>
                            <time className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1 block">
                                {new Date(log.created_at).toLocaleString('pt-PT', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </time>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                        <p className="text-zinc-600 text-[10px] uppercase font-bold italic">
                            No activity recorded yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}