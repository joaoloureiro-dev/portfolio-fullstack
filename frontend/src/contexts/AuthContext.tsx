import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
    token: string | null;
    role: string | null;
    login: (token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
    const [token, setToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);

    // 🔁 RECARREGAR SESSION
    useEffect(() => {
        const saved = localStorage.getItem("token");

        if (saved) {
            setToken(saved);
            const decoded: any = jwtDecode(saved);
            setRole(decoded.role);
        }
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
        <AuthContext.Provider value={{ token, role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);