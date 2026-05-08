import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white flex">

            {/* SIDEBAR */}
            <aside className="w-64 bg-zinc-900 p-6">
                <h1 className="text-xl font-bold mb-8">
                    Admin Panel
                </h1>

                <nav className="space-y-4 text-sm">
                    <p className="text-zinc-400">Dashboard</p>
                    <p className="text-zinc-400">Requests</p>
                </nav>
            </aside>

            {/* CONTENT */}
            <main className="flex-1 p-8">
                {children}
            </main>

        </div>
    );
}