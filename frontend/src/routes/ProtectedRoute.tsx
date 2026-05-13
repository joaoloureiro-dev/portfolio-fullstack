import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Skeleton } from "../components/Skeleton";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Opcional: lista de cargos permitidos (ex: ['admin'])
}

export default function ProtectedRoute({
    children,
    allowedRoles,
}: ProtectedRouteProps) {
    const { token, role, loading } = useAuth();
    const location = useLocation();

    // 1. Enquanto o AuthContext verifica o localStorage/validade do token
    if (loading) {
        return (
            <div className="min-h-screen bg-(--color-bg) p-8">
                <Skeleton className="w-full h-screen rounded-2xl opacity-20" />
            </div>
        );
    }

    // 2. Se não houver token, redireciona para o login (ou home)
    // Guardamos a 'location' atual para saber para onde voltar depois
    if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 3. Se a rota exigir um cargo específico (ex: admin) e o user não o tiver
    if (allowedRoles && !allowedRoles.includes(role || "")) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 4. Tudo ok? Renderiza a página protegida
    return <>{children}</>;
}