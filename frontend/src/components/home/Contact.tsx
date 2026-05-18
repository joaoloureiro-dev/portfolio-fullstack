import { useState, useRef } from "react";
import { toast } from "sonner";
// 🚀 Importar o Turnstile e a sua tipagem de instância
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

export default function Contact() {
    const [loading, setLoading] = useState(false);
    // 🌟 Estado para armazenar o token de validação do Turnstile
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // 🔄 Referência para conseguir limpar/resetar o Turnstile programmaticamente
    const turnstileRef = useRef<TurnstileInstance>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // 🛑 Validação de segurança extra no front-end
        if (!turnstileToken) {
            toast.error("Please complete the security verification.");
            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        // 🚀 Injetar o token gerado no objeto final enviado para o backend
        const payload = {
            ...data,
            token: turnstileToken
        };

        try {
            const response = await fetch("http://localhost:3000/requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload), // Envia os dados + token
            });

            if (response.ok) {
                toast.success("Request sent successfully! I'll contact you soon.");
                (e.target as HTMLFormElement).reset();

                // 🔄 Limpar o token e fazer reset ao widget após sucesso
                setTurnstileToken(null);
                turnstileRef.current?.reset();
            } else {
                throw new Error();
            }
        } catch (err) {
            toast.error("Failed to send request. Please try again.");
            // 🔄 Forçar o reset do Turnstile se a submissão falhar (obriga a novo token)
            setTurnstileToken(null);
            turnstileRef.current?.reset();
        } finally {
            setLoading(false);
        }
    }

    return (
        <section id="contact" className="scroll-mt-24 pb-20">
            {/* 🚀 Widget do Cloudflare Turnstile reposicionado para ficar POR CIMA do Get In Touch */}
            <div className="flex justify-start mb-6">
                <Turnstile
                    ref={turnstileRef}
                    // 🔑 Substitui pela tua Sitekey gerada no painel da Cloudflare
                    siteKey="0x4AAAAAADJDr5u815mGOWa0"
                    options={{
                        theme: "dark", // Combina com o teu tema escuro
                    }}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                />
            </div>

            <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                Get In Touch <span className="h-px flex-1 bg-zinc-800"></span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Name</label>
                        <input name="name" type="text" required className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Email</label>
                        <input name="email" type="email" required className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Service</label>
                        <select name="service" required className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold cursor-pointer">
                            <option value="website_dev">Development</option>
                            <option value="bug_fix">Bug Fix</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-1">Project Details</label>
                        <textarea name="message" rows={1} className="w-full bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-(--color-primary) transition-all text-sm font-bold" />
                    </div>
                </div>

                {/* 🚀 O botão permanece desativado até o Turnstile gerar o token com sucesso no topo */}
                <button
                    type="submit"
                    disabled={loading || !turnstileToken}
                    className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-(--color-primary) hover:text-white transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black cursor-pointer"
                >
                    {loading ? "Sending..." : "Send Project Request"}
                </button>
            </form>
        </section>
    );
}