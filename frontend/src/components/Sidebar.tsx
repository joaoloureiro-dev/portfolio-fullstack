// src/components/Sidebar.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react"; // Importa o X para fechar no mobile

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Overlay: Fundo escuro que aparece no mobile ao abrir */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside className={`
            fixed top-0 left-0 z-50 h-screen w-64 flex flex-col bg-(--color-bg-secondary) border-r border-(--color-border) shrink-0
            transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static md:h-screen md:flex
            `}>

                <div className="p-8 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">
                        ADMIN<span className="text-(--color-primary)">.</span>
                    </h2>
                    {/* Botão para fechar (apenas visível em mobile) */}
                    <button onClick={onClose} className="md:hidden text-zinc-500">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {/* Botão Geral Dashboard */}
                    <button
                        onClick={() => { navigate("/dashboard"); onClose(); }}
                        className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer transition-all ${location.pathname === "/dashboard"
                            ? "bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                            }`}
                    >
                        Dashboard
                    </button>

                    {/* 📈 Botão Google Analytics */}
                    <button
                        onClick={() => { navigate("/dashboard/analytics"); onClose(); }}
                        className={`w-full text-left p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer transition-all ${location.pathname === "/dashboard/analytics"
                            ? "bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                            }`}
                    >
                        Google Analytics
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
        </>
    );
}