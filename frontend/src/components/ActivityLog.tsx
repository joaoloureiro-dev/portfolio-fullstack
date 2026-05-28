import { useEffect, useState, useCallback } from "react";
import { socketService } from "../services/socket";
import { Skeleton } from "./Skeleton";
// 1. Importa a função autorizada do teu ficheiro central de API
import { authorizedFetch } from "../services/api";

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
            setIsLoading(true);

            // 2. Deixa o api.ts tratar dos URLs, Failover e validação de HTML de forma 100% segura
            // Passamos apenas o endpoint desejado. O token é apanhado automaticamente lá dentro!
            const data = await authorizedFetch("/logs");

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

        const unsubscribe = socketService.onMessage((payload) => {
            if (payload.type === "NEW_LOG" || payload.type === "UPDATE_LIST") {
                fetchLogs();
            }
        });

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