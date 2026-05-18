import { useState, useEffect } from "react";

// 🚀 Definimos uma interface estrita para evitar erros de indexação no TypeScript
interface TranslationContent {
    text: string;
    link: string;
    button: string;
}

const translations: Record<"en" | "pt" | "es", TranslationContent> = {
    en: {
        text: "This website uses analytics tools to improve your experience. By browsing, you agree to our ",
        link: "Privacy Policy",
        button: "Accept"
    },
    pt: {
        text: "Este site utiliza ferramentas de análise para melhorar a tua experiência. Ao navegar, concordas com a nossa ",
        link: "Política de Privacidade",
        button: "Aceitar"
    },
    es: {
        text: "Este sitio utiliza herramientas de análisis para mejorar tu experiencia. Al navegar, aceptas nuestra ",
        link: "Política de Privacidad",
        button: "Aceptar"
    }
};

export function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentLang, setCurrentLang] = useState<"en" | "pt" | "es">("en");

    useEffect(() => {
        // 1. Verifica se o consentimento já existe
        const consent = localStorage.getItem("cookie-consent");
        if (!consent) {
            setIsVisible(true);
        }

        // 2. Tenta capturar o idioma de forma imediata (evita o delay de 1s inicial)
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (select && (select.value === "en" || select.value === "pt" || select.value === "es")) {
            setCurrentLang(select.value as "en" | "pt" | "es");
        }

        // 3. Sincronização contínua com a escolha do utilizador
        const interval = setInterval(() => {
            const currentSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
            if (currentSelect && (currentSelect.value === "en" || currentSelect.value === "pt" || currentSelect.value === "es")) {
                setCurrentLang(currentSelect.value as "en" | "pt" | "es");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie-consent", "accepted");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const t = translations[currentLang];

    return (
        <div
            translate="no"
            className="notranslate fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md bg-zinc-950/95 backdrop-blur-md border border-zinc-900 p-4 rounded-xl shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {t.text}
                <a
                    href="#privacy" // Âncora para a tua secção de termos na Home
                    className="text-(--color-primary) underline underline-offset-2 hover:text-white transition-all font-bold"
                >
                    {t.link}
                </a>
                .
            </p>
            <button
                onClick={handleAccept}
                className="w-full md:w-fit md:self-end px-4 py-2 bg-white text-black font-black uppercase text-[10px] tracking-wider rounded-lg hover:bg-(--color-primary) hover:text-white transition-all cursor-pointer"
            >
                {t.button}
            </button>
        </div>
    );
}