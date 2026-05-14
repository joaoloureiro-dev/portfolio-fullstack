import Sidebar from "../components/home/Sidebar";
import About from "../components/home/About";
import Stack from "../components/home/Stack";
import Projects from "../components/home/Projects";
import Contact from "../components/home/Contact";
import { useEffect } from "react";

export default function Home() {
    // Efeito para o cursor customizado (opcional, se quiseres manter do JS antigo)
    useEffect(() => {
        const cursor = document.querySelector('.cursor') as HTMLElement;
        const glow = document.querySelector('.cursor-glow') as HTMLElement;

        const moveCursor = (e: MouseEvent) => {
            if (cursor && glow) {
                cursor.style.left = `${e.clientX}px`;
                cursor.style.top = `${e.clientY}px`;
                glow.style.left = `${e.clientX}px`;
                glow.style.top = `${e.clientY}px`;
            }
        };

        window.addEventListener('mousemove', moveCursor);
        return () => window.removeEventListener('mousemove', moveCursor);
    }, []);

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-(--color-bg) selection:bg-(--color-primary)/30">
            {/* Cursor Elements */}
            <div className="cursor hidden lg:block"></div>
            <div className="cursor-glow hidden lg:block"></div>

            {/* LEFT SIDE - STATIC */}
            <Sidebar />

            {/* RIGHT SIDE - SCROLLABLE */}
            <main className="lg:w-1/2 ml-auto p-6 lg:p-24 space-y-32">
                <About />
                <Stack />
                <Projects />
                <Contact />

                <footer className="text-zinc-600 text-[10px] font-black uppercase tracking-widest pb-12">
                    © 2026 João Loureiro • Built with React & Tailwind
                </footer>
            </main>
        </div>
    );
}