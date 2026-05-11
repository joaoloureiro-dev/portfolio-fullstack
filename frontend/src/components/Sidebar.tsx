// src/components/Sidebar.tsx
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        // Mudámos a ordem: primeiro como ele se comporta em mobile (hidden) 
        // e depois em desktop (md:flex)
        <aside className="hidden md:flex w-64 flex-col bg-(--color-bg-secondary) border-r border-(--color-border) shrink-0">

            <div className="p-8">
                <h2 className="text-2xl font-black text-white italic tracking-tighter">
                    ADMIN<span className="text-(--color-primary)">.</span>
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                <button
                    onClick={() => navigate("/dashboard")}
                    className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer transition-all ${location.pathname === "/dashboard"
                            ? "bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"
                        }`}
                >
                    Dashboard
                </button>
            </nav>

            <div className="p-6 border-t border-(--color-border)">
                <h3 className="text-(--color-primary) text-[10px] font-black uppercase tracking-widest mb-4 italic">
                    Management
                </h3>
                <button
                    onClick={() => { localStorage.clear(); navigate("/"); }}
                    className="w-full text-left text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-all cursor-pointer"
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
}