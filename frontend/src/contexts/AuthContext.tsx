import {
    createContext,
    useContext,
    useState,
    useEffect
} from "react";

import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    token: string | null;
    role: string | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext =
    createContext<AuthContextType>(null!);

export function AuthProvider({
    children
}: {
    children: React.ReactNode;
}) {

    const [token, setToken] =
        useState<string | null>(null);

    const [role, setRole] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    // ========================================
    // INIT AUTH
    // ========================================
    useEffect(() => {

        try {

            const saved =
                localStorage.getItem("token");

            if (!saved) {

                setLoading(false);

                return;
            }

            const decoded: any =
                jwtDecode(saved);

            const currentTime =
                Date.now() / 1000;

            // token expirado
            if (
                decoded.exp &&
                decoded.exp < currentTime
            ) {

                console.warn(
                    "⚠️ Token expirado."
                );

                localStorage.removeItem("token");

                setToken(null);

                setRole(null);

                setLoading(false);

                return;
            }

            setToken(saved);

            setRole(decoded.role || null);

        } catch (err) {

            console.error(
                "❌ Erro Auth:",
                err
            );

            localStorage.removeItem("token");

            setToken(null);

            setRole(null);

        } finally {

            setLoading(false);
        }

    }, []);

    // ========================================
    // LOGIN
    // ========================================
    function login(token: string) {

        try {

            const decoded: any =
                jwtDecode(token);

            localStorage.setItem(
                "token",
                token
            );

            setToken(token);

            setRole(decoded.role || null);

        } catch (err) {

            console.error(
                "❌ Login Error:",
                err
            );
        }
    }

    // ========================================
    // LOGOUT
    // ========================================
    function logout() {

        localStorage.removeItem("token");

        setToken(null);

        setRole(null);
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used within AuthProvider"
        );
    }

    return context;
};