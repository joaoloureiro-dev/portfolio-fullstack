import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    token: string | null;
    role: string | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Inicializa corretamente a true

    // 🔁 RECARREGAR SESSION
    useEffect(() => {
        const saved = localStorage.getItem("token");

        if (saved) {
            try {
                const decoded: any = jwtDecode(saved);
                const currentTime = Date.now() / 1000;

                // Verificar se o token expirou
                if (decoded.exp < currentTime) {
                    console.warn("⚠️ Token expirado no arranque.");
                    logout();
                } else {
                    // Só ativa se o token for 100% válido
                    setToken(saved);
                    setRole(decoded.role);
                }
            } catch (err) {
                console.error("❌ Token inválido ao carregar a página.");
                logout();
            }
        }

        // ✅ GARANTE que o loading termina sempre, prevenindo ecrãs em branco no mobile
        setLoading(false);
    }, []);

    function login(token: string) {
        setToken(token);
        localStorage.setItem("token", token);

        const decoded: any = jwtDecode(token);
        setRole(decoded.role);
    }

    function logout() {
        setToken(null);
        setRole(null);
        localStorage.removeItem("token");
    }

    return (
        <AuthContext.Provider value={{ token, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);