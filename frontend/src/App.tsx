import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster, toast } from 'sonner'; // Importante: toast adicionado
import ReactGA from "react-ga4";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  // 🔔 Monitorização de falha total de rede
  useEffect(() => {
    const handleOffline = () => {
      toast.error("Ligação perdida. A tentar restaurar a conexão...", { duration: 5000 });
    };
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <div className="min-h-screen bg-(--color-bg) flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-black text-(--color-primary) opacity-20 italic tracking-tighter">404</h1>
            <div className="-mt-10">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">Lost in Space?</h2>
              <p className="text-zinc-500 mt-2 mb-6 text-sm">The page you are looking for doesn't exist.</p>
              <a href="/" className="px-6 py-3 bg-(--color-bg-secondary) border border-(--color-border) text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-(--color-primary) transition-all">
                Back to Safety
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}