import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const { token } = useAuth();

    return (
        <header className="lg:fixed lg:w-1/2 lg:h-screen p-6 lg:p-24 flex flex-col justify-between border-r border-zinc-900/50 bg-(--color-bg) z-20">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
                            João<br />Loureiro
                        </h1>
                        <h2 className="text-(--color-primary) text-lg font-black uppercase tracking-widest mt-4 italic">
                            Junior Fullstack Developer
                        </h2>
                    </div>

                    <div className="flex flex-col gap-4 items-end">
                        <Link to={token ? "/dashboard" : "/login"} className="text-zinc-600 text-[10px] font-black border border-zinc-800 px-3 py-2 rounded hover:border-(--color-primary) hover:text-(--color-primary) transition-all uppercase">
                            {token ? "Go to Dashboard" : "Admin Login"}
                        </Link>
                    </div>
                </div>

                <nav className="mt-16 hidden lg:block">
                    <ul className="space-y-4">
                        {['about', 'stack', 'projects', 'contact'].map((item) => (
                            <li key={item}>
                                <a href={`#${item}`} className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all">
                                    <span className="h-px w-8 bg-zinc-800 group-hover:w-16 group-hover:bg-white transition-all"></span>
                                    <span className="text-xs font-black uppercase tracking-widest">{item}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* SOCIAL LINKS - Garantir que os icons aparecem */}
            <div className="flex gap-8 text-2xl text-zinc-500 mb-4">
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
        </header>
    );
}