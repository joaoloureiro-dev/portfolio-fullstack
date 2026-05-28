import { useState, useRef } from "react";
import { toast } from "sonner";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function Contact() {

    const [loading, setLoading] = useState(false);

    // 🌟 Token do Turnstile
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // 🔄 Referência do widget
    const turnstileRef = useRef<TurnstileInstance>(null);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {

        e.preventDefault();

        // 🛑 Segurança extra
        if (!turnstileToken) {

            toast.error(
                "Please complete the security verification."
            );

            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);

        const data = Object.fromEntries(formData);

        // 🚀 Payload final
        const payload = {
            ...data,
            token: turnstileToken,
        };

        try {

            const PRIMARY_API =
                import.meta.env.VITE_API_URL_PRIMARY;

            const FALLBACK_API =
                import.meta.env.VITE_API_URL_BACKUP;

            let response;

            try {

                // 🚀 Tenta Railway primeiro
                response = await fetch(
                    `${PRIMARY_API}/requests`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(payload),
                    }
                );

                // 🔥 Se Railway responder com erro
                if (!response.ok) {

                    throw new Error(
                        "Primary API failed"
                    );
                }

            } catch (primaryError) {

                console.warn(
                    "⚠️ Primary API offline. Switching to fallback..."
                );

                // 🚀 Fallback Render
                response = await fetch(
                    `${FALLBACK_API}/requests`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(payload),
                    }
                );
            }

            // ✅ SUCESSO
            if (response.ok) {

                toast.success(
                    "Request sent successfully! I'll contact you soon."
                );

                (e.target as HTMLFormElement).reset();

                // 🔄 Reset captcha
                setTurnstileToken(null);

                turnstileRef.current?.reset();

            } else {

                throw new Error(
                    "Request failed"
                );
            }

        } catch (error) {

            console.error(
                "❌ CONTACT ERROR:",
                error
            );

            toast.error(
                "Failed to send request. Please try again."
            );

            // 🔄 Força novo token
            setTurnstileToken(null);

            turnstileRef.current?.reset();

        } finally {

            setLoading(false);
        }
    }

    return (

        <section className="scroll-mt-24 pb-20">

            {/* 🚀 TURNSTILE */}
            <div className="flex justify-start mb-6">

                <Turnstile
                    key="contact-turnstile"
                    ref={turnstileRef}

                    siteKey={
                        import.meta.env
                            .VITE_TURNSTILE_SITE_KEY
                    }

                    options={{
                        theme: "dark",
                        size: "normal",
                    }}

                    onSuccess={(token) => {

                        console.log(
                            "✅ TURNSTILE SUCCESS"
                        );

                        setTurnstileToken(token);
                    }}

                    onExpire={() => {

                        console.warn(
                            "⚠️ TURNSTILE EXPIRED"
                        );

                        setTurnstileToken(null);

                        turnstileRef.current?.reset();
                    }}

                    onError={(error) => {

                        console.error(
                            "❌ TURNSTILE ERROR:",
                            error
                        );

                        setTurnstileToken(null);
                    }}
                />

            </div>

            {/* 🚀 TITLE */}
            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4">

                Get In Touch

                <span className="h-px flex-1 bg-zinc-800"></span>

            </h2>

            {/* 🚀 FORM */}
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                {/* NAME + EMAIL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="space-y-1">

                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">

                            Name

                        </label>

                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold"
                        />

                    </div>

                    <div className="space-y-1">

                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">

                            Email

                        </label>

                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold"
                        />

                    </div>

                </div>

                {/* SERVICE + MESSAGE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="space-y-1">

                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">

                            Service

                        </label>

                        <select
                            name="service"
                            required
                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold cursor-pointer"
                        >

                            <option value="website_dev">
                                Development
                            </option>

                            <option value="bug_fix">
                                Bug Fix
                            </option>

                            <option value="maintenance">
                                Maintenance
                            </option>

                        </select>

                    </div>

                    <div className="space-y-1 md:col-span-2">

                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">

                            Project Details

                        </label>

                        <textarea
                            name="message"
                            rows={1}
                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold"
                        />

                    </div>

                </div>

                {/* 🚀 BUTTON */}
                <button
                    type="submit"
                    disabled={
                        loading ||
                        !turnstileToken
                    }
                    className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-(--color-primary) hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black cursor-pointer"
                >

                    {
                        loading
                            ? "Sending..."
                            : "Send Project Request"
                    }

                </button>

            </form>

        </section>
    );
}