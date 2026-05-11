import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar"; // Agora vamos usar isto!

interface LayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-(--color-bg) text-white flex">

            {/* SIDEBAR COMPONENT */}
            {/* Chamamos o componente aqui para o import ser lido */}
            <Sidebar />

            {/* CONTENT AREA */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

        </div>
    );
}