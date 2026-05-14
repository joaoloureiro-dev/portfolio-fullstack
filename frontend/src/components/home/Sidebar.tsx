import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function Sidebar() {
    const { token } = useAuth();

    return (
        <header className="lg:fixed lg:w-1/2 lg:h-screen p-6 lg:p-24 flex flex-col justify-between border-r border-zinc-900/50">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter italic uppercase leading-none">
                            João<br />Loureiro
                        </h1>
                        <h2 className="text-(--color-primary) text-lg font-black uppercase tracking-widest mt-4 italic">
                            Junior Fullstack Developer
                        </h2>
                        <p className="text-zinc-500 font-bold mt-2 text-sm tracking-tight uppercase">
                            I build scalable web applications
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 items-end">
                        <button className="text-[10px] font-black border border-zinc-800 px-2 py-1 rounded hover:border-white transition-all text-zinc-500 hover:text-white uppercase cursor-pointer">
                            EN / PT
                        </button>
                        {/* Se logado, vai direto pro Dashboard. Se não, vai pro Login */}
                        <Link to={token ? "/dashboard" : "/login"} className="text-zinc-600 text-[10px] font-black border border-zinc-800 px-2 py-1 rounded hover:border-(--color-primary) hover:text-(--color-primary) transition-all uppercase">
                            {token ? "Dashboard" : "Admin Login"}
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

            <div className="flex gap-6 text-2xl text-zinc-500">
                <a href="https://github.com/joaoloureiro-dev" target="_blank" className="hover:text-white transition-colors"><i className="fa-brands fa-github"></i></a>
                <a href="https://linkedin.com/in/joaoloureiro" target="_blank" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin"></i></a>
                <a href="https://x.com/joaoloureiro" target="_blank" className="hover:text-white transition-colors"><i className="fa-brands fa-x-twitter"></i></a>
            </div>
        </header>
    );
}