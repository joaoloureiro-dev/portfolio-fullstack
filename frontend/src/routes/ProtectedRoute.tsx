import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "../components/Skeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Ex: ['admin']
}

export default function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { token, role, loading } = useAuth();
    const location = useLocation();

    // 1. Enquanto o AuthContext verifica o localStorage
    if (loading) {
        return (
            <div className="min-h-screen bg-(--color-bg) p-8">
                <Skeleton className="w-full h-screen rounded-2xl opacity-20" />
            </div>
        );
    }

    // 2. SE NÃO HÁ TOKEN: Manda para o Login (e não para a Home ou Unauthorized)
    if (!token) {
        // Se a pessoa já estiver na rota de login, não redireciona para evitar loop
        if (location.pathname === "/login") {
            return <>{children}</>;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. SE HÁ TOKEN MAS A ROLE É INVÁLIDA: Manda para o Unauthorized
    // Garantimos que a string da role existe antes de validar
    const userRole = role || "user";
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 4. Tudo ok? Renderiza a página protegida
    return <>{children}</>;
}