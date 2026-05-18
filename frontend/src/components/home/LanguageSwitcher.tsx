import { useEffect, useState } from "react";

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

interface LanguageSwitcherProps {
    variant?: "desktop" | "mobile";
}

// 🎯 Atualizada a tipagem para suportar os três idiomas
type AllowedLanguages = 'en' | 'pt' | 'es';

export function LanguageSwitcher({ variant = "desktop" }: LanguageSwitcherProps) {
    // 🌟 Estado para saber qual idioma está ativo (começa em 'en' que é o teu padrão)
    const [currentLang, setCurrentLang] = useState<AllowedLanguages>('en');

    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,pt,es', // 🚀 Adicionado 'es' aqui para o Google carregar o Espanhol
                    autoDisplay: false,
                },
                'google_translate_element'
            );
        };

        if (!document.getElementById("google-translate-script")) {
            const addScript = document.createElement('script');
            addScript.id = "google-translate-script";
            addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
            document.body.appendChild(addScript);
        }
    }, []);

    const changeLanguage = (langCode: AllowedLanguages) => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = langCode;
            select.dispatchEvent(new Event('change'));
            setCurrentLang(langCode); // 🌟 Atualiza o estado visual
        }
    };

    // 🎯 Controla dinamicamente o posicionamento com base na variante escolhida
    const positionClasses =
        variant === "desktop"
            ? "hidden lg:flex absolute top-4 right-4 z-50" // Desktop: Canto superior direito e esconde no mobile
            : "flex lg:hidden mt-auto mb-6 justify-center w-full"; // Mobile: Fundo do menu hambúrguer e esconde no desktop

    return (
        /* 🚀 Aplicadas as classes dinâmicas para gerir o layout de forma inteligente */
        <div className={`gap-2 bg-zinc-950/80 backdrop-blur-md p-1.5 rounded-lg border border-zinc-900 shadow-xl w-fit ${positionClasses}`}>
            <div id="google_translate_element" className="hidden" />

            {/* Botão EN */}
            <button
                onClick={() => changeLanguage('en')}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all cursor-pointer ${currentLang === 'en'
                    ? 'text-(--color-primary) border border-(--color-primary)'
                    : 'text-zinc-500 border border-zinc-900 hover:text-(--color-primary) hover:border-(--color-primary)/30'
                    }`}
            >
                EN
            </button>

            {/* Botão PT */}
            <button
                onClick={() => changeLanguage('pt')}
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all cursor-pointer ${currentLang === 'pt'
                    ? 'text-(--color-primary) border border-(--color-primary)'
                    : 'text-zinc-500 border border-zinc-900 hover:text-(--color-primary) hover:border-(--color-primary)/30'
                    }`}
            >
                PT
            </button>

            {/* 🚀 Botão ES - Adicionada a blindagem para o Google não mudar para "IS" */}
            <button
                translate="no"
                onClick={() => changeLanguage('es')}
                className={`notranslate text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all cursor-pointer ${currentLang === 'es'
                    ? 'text-(--color-primary) border border-(--color-primary)'
                    : 'text-zinc-500 border border-zinc-900 hover:text-(--color-primary) hover:border-(--color-primary)/30'
                    }`}
            >
                ES
            </button>
        </div>
    );
}