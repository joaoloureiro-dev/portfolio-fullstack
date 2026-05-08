import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Login failed");
            return;
        }

        login(data.token);

        navigate("/dashboard");
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">

            <form
                onSubmit={handleLogin}
                className="bg-zinc-900 p-10 rounded-2xl w-full max-w-md space-y-4"
            >
                <h1 className="text-3xl font-bold">
                    Admin Login
                </h1>

                <input
                    className="w-full p-3 rounded bg-zinc-800"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    className="w-full p-3 rounded bg-zinc-800"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    type="submit"
                    className="w-full bg-white text-black p-3 rounded font-bold"
                >
                    Login
                </button>
            </form>

        </div>
    );
}