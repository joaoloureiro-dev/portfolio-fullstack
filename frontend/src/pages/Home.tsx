import Sidebar from "../components/home/Sidebar";
import About from "../components/home/About";
import Stack from "../components/home/Stack";
import Projects from "../components/home/Projects";
import Contact from "../components/home/Contact";
import { Navbar } from "../components/home/Navbar"; // 🚀 Import da tua Navbar mobile
import { useEffect } from "react";

export default function Home() {
    // Efeito para o cursor customizado
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
        <div className="relative min-h-screen bg-(--color-bg) selection:bg-(--color-primary)/30">
            {/* Cursor Elements */}
            <div className="cursor hidden lg:block"></div>
            <div className="cursor-glow hidden lg:block"></div>

            {/* 📱 NAVBAR MOBILE (Fixa no topo, aparece apenas abaixo de lg) */}
            <div className="block lg:hidden fixed top-0 left-0 w-full z-50">
                <Navbar />
            </div>

            {/* 📦 LAYOUT WRAPPER */}
            {/* pt-16 no mobile garante que a Navbar fixa não tape o início do About */}
            <div className="flex flex-col lg:flex-row pt-16 lg:pt-0 min-h-screen w-full">

                {/* 🖥️ LEFT SIDE - STATIC */}
                <Sidebar />

                {/* RIGHT SIDE - SCROLLABLE */}
                {/* w-full impede que o flex esmague os teus cards de projetos no mobile */}
                <main className="w-full lg:w-1/2 ml-auto p-6 lg:p-24 space-y-32">
                    <section id="about-me">
                        <About />
                    </section>

                    <section id="stacks">
                        <Stack />
                    </section>

                    <section id="projects">
                        <Projects />
                    </section>

                    <section id="contact">
                        <Contact />
                    </section>

                    <footer className="text-zinc-600 text-[10px] font-black uppercase tracking-widest pb-12">
                        © 2026 João Loureiro • Built with React & Tailwind
                    </footer>
                </main>
            </div>
        </div>
    );
}