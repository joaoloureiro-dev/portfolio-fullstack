import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Link } from "react-router-dom"; // Garante que usas o Link do router

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        document.body.style.overflow = !isOpen ? 'hidden' : 'unset';
    };

    const handleLinkClick = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    return (
        <nav className="bg-(--color-bg-secondary) border-b border-(--color-border) h-16 w-full flex items-center justify-between px-6 z-50">
            <div>
                <span className="text-white font-black text-lg tracking-tighter uppercase">
                    João Loureiro<span className="text-(--color-primary)">.</span>
                </span>
            </div>

            <button onClick={toggleMenu} className="text-zinc-400 hover:text-white p-2 z-50 outline-none cursor-pointer">
                {isOpen ? <X size={26} strokeWidth={2.5} /> : <Menu size={26} strokeWidth={2.5} />}
            </button>

            <div className={`fixed inset-0 bg-(--color-bg) z-40 flex flex-col justify-center items-center gap-8 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}>
                <a href="#about-me" onClick={handleLinkClick} className="text-zinc-400 hover:text-white text-xl font-black uppercase tracking-widest">About Me</a>
                <a href="#stacks" onClick={handleLinkClick} className="text-zinc-400 hover:text-white text-xl font-black uppercase tracking-widest">Stacks</a>
                <a href="#projects" onClick={handleLinkClick} className="text-zinc-400 hover:text-white text-xl font-black uppercase tracking-widest">Projects</a>
                <a href="#contact" onClick={handleLinkClick} className="text-zinc-400 hover:text-white text-xl font-black uppercase tracking-widest">Contact</a>

                {/* 📱 ICONES SOCIAIS (Igual à Sidebar, adicionados ao menu mobile) */}
                <div className="flex gap-6 text-2xl text-zinc-500 my-2">
                    <a href="https://github.com/joaoloureiro-dev" target="_blank" rel="noreferrer" onClick={handleLinkClick} className="hover:text-white transition-colors">
                        <i className="fa-brands fa-github"></i>
                    </a>
                    <a href="https://linkedin.com/in/joaoloureiro" target="_blank" rel="noreferrer" onClick={handleLinkClick} className="hover:text-white transition-colors">
                        <i className="fa-brands fa-linkedin"></i>
                    </a>
                    <a href="https://x.com/joaoloureiro" target="_blank" rel="noreferrer" onClick={handleLinkClick} className="hover:text-white transition-colors">
                        <i className="fa-brands fa-x-twitter"></i>
                    </a>
                </div>

                {/* 🔒 BOTÃO ADMIN LOGIN - Mobile (Dentro do menu hambúrguer) */}
                <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all shadow-lg"
                >
                    <LogIn size={16} className="text-(--color-primary)" />
                    Admin Login
                </Link>
            </div>
        </nav>
    );
}