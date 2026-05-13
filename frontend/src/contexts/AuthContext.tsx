import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    token: string | null;
    role: string | null;
    loading: boolean; // Adicionado
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Começa como true

    // 🔁 RECARREGAR SESSION
    useEffect(() => {
        const saved = localStorage.getItem("token");

        if (saved) {
            try {
                setToken(saved);
                const decoded: any = jwtDecode(saved);
                setRole(decoded.role);

                // Opcional: Verificar se o token já expirou aqui
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    logout();
                }
            } catch (err) {
                console.error("Invalid token on load");
                logout();
            }
        }

        // Finaliza o carregamento após verificar o localStorage
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
        // Se quiseres podes forçar um redirecionamento aqui: window.location.href = "/";
    }

    return (
        <AuthContext.Provider value={{ token, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);