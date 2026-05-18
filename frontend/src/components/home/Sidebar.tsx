import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { LogIn, LayoutDashboard } from "lucide-react"; // Ícones limpos para o rodapé

export default function Sidebar() {
    const { token } = useAuth();

    // Sincronizado perfeitamente com os IDs do Home.tsx e os nomes visuais
    const menuItems = [
        { id: "about-me", label: "About Me" },
        { id: "stacks", label: "Stacks" },
        { id: "projects", label: "Projects" },
        { id: "contact", label: "Contact" }
    ];

    return (
        // 🚀 Adicionado 'hidden lg:flex' para não colidir com a Navbar no mobile
        <header className="hidden lg:flex lg:fixed lg:w-1/2 lg:h-screen p-24 flex-col justify-between border-r border-zinc-900/50 bg-(--color-bg) z-20">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter ml-40 italic uppercase leading-[0.8] notranslate">
                            João<br />Loureiro
                        </h1>
                        <h2 className="text-(--color-primary) text-lg font-black uppercase tracking-widest mt-4 ml-40 italic">
                            Junior Fullstack Developer
                        </h2>
                    </div>
                </div>

                {/* MENU DE NAVEGAÇÃO DESKTOP */}
                <nav className="mt-20 ml-40 hidden lg:block">
                    <ul className="space-y-4">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <a href={`#${item.id}`} className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all">
                                    <span className="h-px w-8 bg-zinc-800 group-hover:w-16 group-hover:bg-white transition-all"></span>

                                    {/* AQUI ESTÁ A MUDANÇA: */}
                                    <span
                                        className={`text-xs font-black uppercase tracking-widest ${item.label === 'Stacks' ? 'notranslate' : ''}`}
                                        translate={item.label === 'Stacks' ? 'no' : 'yes'}
                                    >
                                        {item.label}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* 🔚 RODAPÉ DA SIDEBAR (Redes Sociais + Botão Admin alinhado abaixo) */}
            <div className="space-y-6">
                {/* ICONES SOCIAIS */}
                <div className="relative flex gap-6 pb-60 ml-40 text-2xl text-zinc-500">
                    <a href="https://github.com/joaoloureiro-dev" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        <i className="fa-brands fa-github"></i>
                    </a>
                    <a href="https://linkedin.com/in/joaoloureiro" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        <i className="fa-brands fa-linkedin"></i>
                    </a>
                    <a href="https://x.com/joaoloureiro" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                        <i className="fa-brands fa-x-twitter"></i>
                    </a>
                </div>

                {/* 🔒 BOTÃO DE ADMIN - DESKTOP */}
                <div className="absolute bottom-70 pt-4 ml-40 border-t border-zinc-900/60 w-fit">
                    <Link
                        to={token ? "/dashboard" : "/login"}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all group"
                    >
                        {token ? (
                            <>
                                <LayoutDashboard size={14} className="text-zinc-600 group-hover:text-(--color-primary) transition-colors" />
                                Go to Dashboard
                            </>
                        ) : (
                            <>
                                <LogIn size={14} className="text-zinc-600 group-hover:text-(--color-primary) transition-colors" />
                                Admin Login
                            </>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}