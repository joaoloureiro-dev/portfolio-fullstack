import { useState, type ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react"; // npm install lucide-react se ainda não tiveres

interface LayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
    // Estado para controlar se a sidebar está visível no telemóvel
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-(--color-bg) text-white flex">

            {/* SIDEBAR COMPONENT */}
            {/* Passamos o estado e a função de fechar para dentro da Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

                {/* HEADER MOBILE - Só aparece em ecrãs pequenos (md:hidden) */}
                <header className="md:hidden flex items-center justify-between p-4 bg-(--color-bg-secondary) border-b border-(--color-border)">
                    <h2 className="text-xl font-black text-white italic tracking-tighter">
                        ADMIN<span className="text-(--color-primary)">.</span>
                    </h2>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* ÁREA DE CONTEÚDO COM SCROLL */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto p-4 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}