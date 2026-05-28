import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

// 🔥 API URL
const API_URL =
    import.meta.env.VITE_API_URL_PRIMARY ||
    "https://portfolio-fullstack-production-729a.up.railway.app";

export default function Login() {

    const navigate = useNavigate();

    const { login } = useAuth();

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);

    // =========================================
    // LOGIN NORMAL
    // =========================================
    async function handleLogin(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setLoading(true);

            console.log("🔐 LOGIN:", API_URL);

            const res = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username,
                        password,
                    }),
                }
            );

            const text = await res.text();

            let data: any = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                console.error("❌ JSON inválido:", text);
            }

            console.log("📡 LOGIN STATUS:", res.status);

            if (!res.ok) {

                alert(
                    data?.error || "Login failed"
                );

                return;
            }

            if (!data?.token) {

                alert("Token missing");

                return;
            }

            // 🔥 GUARDA TOKEN
            login(data.token);

            console.log(
                "✅ TOKEN GUARDADO"
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "❌ Login Error:",
                error
            );

            alert(
                "Could not connect to server."
            );

        } finally {

            setLoading(false);
        }
    }

    // =========================================
    // LOGIN GOOGLE
    // =========================================
    async function handleGoogleLogin(
        credentialResponse: any
    ) {

        try {

            setLoading(true);

            console.log("🟠 GOOGLE LOGIN");

            const res = await fetch(
                `${API_URL}/auth/google`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        token:
                            credentialResponse?.credential,
                    }),
                }
            );

            const text = await res.text();

            let data: any = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                console.error("❌ JSON inválido:", text);
            }

            console.log("📡 GOOGLE STATUS:", res.status);

            if (!res.ok) {

                alert(
                    data?.error ||
                    "Google login failed"
                );

                return;
            }

            if (!data?.token) {

                alert("Google token missing");

                return;
            }

            login(data.token);

            console.log(
                "✅ GOOGLE LOGIN OK"
            );

            navigate("/dashboard");

        } catch (error) {

            console.error(
                "❌ Google Auth Error:",
                error
            );

            alert(
                "Google authentication failed."
            );

        } finally {

            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-(--color-bg-secondary) border border-(--color-border) p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">

                {/* GLOW */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-(--color-primary)/10 blur-[80px]" />

                {/* HEADER */}
                <div className="text-center mb-10">

                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                        ADMIN
                        <span className="text-(--color-primary)">
                            .
                        </span>
                    </h1>

                    <p className="text-(--color-text-secondary) text-sm font-medium">
                        Management System Access
                    </p>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleLogin}
                    className="space-y-5 relative z-10"
                >

                    {/* USERNAME */}
                    <div>

                        <label className="block text-[10px] font-black text-(--color-text-secondary) uppercase mb-1.5 ml-1 tracking-widest">
                            Username
                        </label>

                        <input
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="admin_user"
                            required
                            className="w-full bg-(--color-bg) border border-(--color-border) p-4 rounded-2xl text-white focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all outline-none placeholder:text-zinc-700"
                        />

                    </div>

                    {/* PASSWORD */}
                    <div>

                        <label className="block text-[10px] font-black text-(--color-text-secondary) uppercase mb-1.5 ml-1 tracking-widest">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="••••••••"
                            required
                            className="w-full bg-(--color-bg) border border-(--color-border) p-4 rounded-2xl text-white focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) transition-all outline-none"
                        />

                    </div>

                    {/* BOTÃO LARANJA */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-black py-4 rounded-2xl shadow-xl shadow-(--color-primary)/20 transition-all transform active:scale-[0.98] uppercase text-xs tracking-widest mt-2 cursor-pointer disabled:opacity-50"
                    >
                        {
                            loading
                                ? "LOADING..."
                                : "SIGN IN"
                        }
                    </button>

                    {/* DIVIDER */}
                    <div className="flex items-center gap-4 py-2">

                        <div className="h-px flex-1 bg-(--color-border)" />

                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                            Or continue with
                        </span>

                        <div className="h-px flex-1 bg-(--color-border)" />

                    </div>

                    {/* GOOGLE LOGIN */}
                    <div className="w-full flex justify-center pt-2">

                        <div className="w-full max-w-sm flex justify-center [&_iframe]:w-full! [&_iframe]:min-w-full!">

                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() =>
                                    console.log(
                                        "Google Login Failed"
                                    )
                                }
                                theme="filled_black"
                                shape="pill"
                                text="signin_with"
                                logo_alignment="left"
                                width="320"
                            />

                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
}