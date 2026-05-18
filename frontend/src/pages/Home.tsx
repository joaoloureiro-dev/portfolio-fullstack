import Sidebar from "../components/home/Sidebar";
import About from "../components/home/About";
import Stack from "../components/home/Stack";
import Projects from "../components/home/Projects";
import Contact from "../components/home/Contact";
import { Navbar } from "../components/home/Navbar";
import { LanguageSwitcher } from "../components/home/LanguageSwitcher";
// 🚀 1. Importar o CookieBanner e os hooks necessários
import { CookieBanner } from "../components/home/CookieBanner";
import { useEffect, useState } from "react";

// 📝 Textos legais blindados contra erros do robô do Google
const privacyContent = {
    en: {
        title: "Privacy Policy",
        text: "This website uses Google Analytics, a web analytics service provided by Google LLC. Google Analytics uses 'cookies' to help us analyze how users interact with the site. The data generated (including your anonymized IP address) will be transmitted to and stored by Google. You can refuse the use of cookies by adjusting your browser settings. By using this website, you consent to the processing of data about you by Google in the manner described.",
        close: "Close"
    },
    pt: {
        title: "Política de Privacidade",
        text: "Este site utiliza o Google Analytics, um serviço de análise web fornecido pela Google LLC. O Google Analytics utiliza 'cookies' para nos ajudar a analisar como os utilizadores interagem com o site. Os dados gerados (incluindo o seu endereço IP anonimizado) serão transmitidos e armazenados pela Google. Pode desativar a utilização de cookies alterando as configurações do seu navegador. Ao utilizar este site, concorda com o processamento dos seus dados pela Google nos termos descritos.",
        close: "Fechar"
    },
    es: {
        title: "Política de Privacidad",
        text: "Este sitio web utiliza Google Analytics, un servicio de análisis web prestado por Google LLC. Google Analytics utiliza 'cookies' para ayudarnos a analizar cómo los usuarios interactúan con el sitio. Los datos generados (incluida su dirección IP anonimizada) serán transmitidos y almacenados por Google. Puede rechazar el uso de cookies configurando su navegador. Al utilizar este sitio, consiente el tratamiento de sus datos por parte de Google en la forma descrita.",
        close: "Cerrar"
    }
};

export default function Home() {
    // 🌟 Estados para controlar o modal de privacidade e o idioma ativo
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState<"en" | "pt" | "es">("en");

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

    // 🌐 Efeito para monitorizar o idioma do Google Translate para o modal de termos
    useEffect(() => {
        const checkLang = () => {
            const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (select && (select.value === "en" || select.value === "pt" || select.value === "es")) {
                setCurrentLang(select.value as "en" | "pt" | "es");
            }
        };

        checkLang();
        const interval = setInterval(checkLang, 1000);
        return () => clearInterval(interval);
    }, []);

    // Intercepta o clique do banner de cookies para abrir o modal em vez de saltar na página
    useEffect(() => {
        const handleBannerLinkClick = (e: MouseEvent) => {
            const target = e.target as HTMLAnchorElement;
            if (target && target.getAttribute('href') === '#privacy') {
                e.preventDefault();
                setIsPrivacyOpen(true);
            }
        };

        window.addEventListener('click', handleBannerLinkClick);
        return () => window.removeEventListener('click', handleBannerLinkClick);
    }, []);

    const t = privacyContent[currentLang];

    return (
        <div className="relative min-h-screen bg-(--color-bg) selection:bg-(--color-primary)/30">
            <LanguageSwitcher />

            <div className="cursor hidden lg:block"></div>
            <div className="cursor-glow hidden lg:block"></div>

            <div className="block lg:hidden fixed top-0 left-0 w-full z-40">
                <Navbar />
            </div>

            <div className="flex flex-col lg:flex-row pt-16 lg:pt-0 min-h-screen w-full">
                <Sidebar />

                <main className="w-full lg:w-1/2 ml-auto p-6 lg:p-24 space-y-32">
                    <section id="about-me">
                        <About />
                    </section>

                    <section id="stacks" translate="no" className="notranslate">
                        <Stack />
                    </section>

                    <section id="projects">
                        <Projects />
                    </section>

                    <section id="contact">
                        <Contact />
                    </section>

                    {/* 🚀 Footer atualizado com o link interativo de Privacidade */}
                    <footer className="text-zinc-600 text-[10px] font-black uppercase tracking-widest pb-12 flex flex-wrap gap-2 justify-between items-center">
                        <div>
                            © 2026 João Loureiro • Built with React & Tailwind
                        </div>
                        <button
                            onClick={() => setIsPrivacyOpen(true)}
                            className="text-zinc-500 hover:text-(--color-primary) transition-all underline underline-offset-4 cursor-pointer"
                        >
                            {t.title}
                        </button>
                    </footer>
                </main>
            </div>

            {/* 🚀 2. Injetar o CookieBanner no ecossistema da Home */}
            <CookieBanner />

            {/* 🚀 3. Modal de Política de Privacidade (Profissional, Escuro e Animado) */}
            {isPrivacyOpen && (
                <div
                    translate="no"
                    className="notranslate fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsPrivacyOpen(false)}
                >
                    <div
                        className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl flex flex-col gap-4 transform animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Impede o fecho ao clicar dentro do texto
                    >
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-zinc-900 pb-3">
                            {t.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                            {t.text}
                        </p>
                        <button
                            onClick={() => setIsPrivacyOpen(false)}
                            className="mt-2 w-full md:w-fit md:self-end px-5 py-2.5 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}