import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

// 🌐 Define o URL base de forma dinâmica usando a tua variável da Vercel
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            // ✅ Corrigido: Agora usa o BACKEND_URL dinâmico
            const res = await fetch(`${BACKEND_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert("Login failed");
                return;
            }

            login(data.token);
            navigate("/dashboard");
        } catch (error) {
            console.error("Request error:", error);
            alert("Could not connect to the server.");
        }
    }

    async function handleGoogleLogin(credentialResponse: any) {
        try {
            // ✅ Corrigido: Agora aponta para o Railway em produção
            const res = await fetch(`${BACKEND_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert("Google login failed");
                return;
            }

            login(data.token);
            navigate("/dashboard");
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("Error authenticating with Google.");
        }
    }

    return (
        <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-(--color-bg-secondary) border border-(--color-border) p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

                {/* Decorative Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-(--color-primary)/10 blur-[80px]"></div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                        ADMIN<span className="text-(--color-primary)">.</span>
                    </h1>
                    <p className="text-(--color-text-secondary) text-sm font-medium">
                        Management System Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                    <div>
                        <label className="block text-[10px] font-black text-(--color-text-secondary) uppercase mb-1.5 ml-1 tracking-widest">
                            Username
                        </label>
                        <input
                            className="w-full bg-(--color-bg) border border-(--color-border) p-4 rounded-2xl text-white focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all outline-none placeholder:text-zinc-700"
                            placeholder="admin_user"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-(--color-text-secondary) uppercase mb-1.5 ml-1 tracking-widest">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full bg-(--color-bg) border border-(--color-border) p-4 rounded-2xl text-white focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-black py-4 rounded-2xl shadow-xl shadow-(--color-primary)/20 transition-all transform active:scale-[0.98] uppercase text-xs tracking-widest mt-2 cursor-pointer"
                    >
                        Sign In
                    </button>

                    {/* DIVIDER with h-px */}
                    <div className="flex items-center gap-4 py-2">
                        <div className="h-px flex-1 bg-(--color-border)"></div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Or continue with</span>
                        <div className="h-px flex-1 bg-(--color-border)"></div>
                    </div>

                    {/* 🚀 ALINHAMENTO E LARGURA TOTAL DO GOOGLE LOGIN */}
                    <div className="w-full flex justify-center pl-10 pt-2">
                        <div className="w-full max-w-sm flex justify-center [&_iframe]:w-full! [&_iframe]:min-w-full!">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => console.log("Google Login Failed")}
                                theme="filled_black"
                                shape="pill"
                                text="signin_with"
                                logo_alignment="left"
                                width="100%"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}