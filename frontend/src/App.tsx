import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from 'sonner';
import ReactGA from "react-ga4";

import Home from "./pages/Home"; // Nova página da Fase 2
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";

// 📡 Componente interno para gerir as rotas e o rastreamento do Google Analytics
function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    // Envia a mudança de página para o Google Analytics 4
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return (
    <Routes>
      {/* 🏠 ROTA PÚBLICA PRINCIPAL (Landing Page Migrada) */}
      <Route path="/" element={<Home />} />

      {/* 🔑 AUTENTICAÇÃO */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* 📊 ÁREA ADMINISTRATIVA (Protegida) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🚀 ROTA 404 - Estilo Profissional */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-(--color-bg) flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-black text-(--color-primary) opacity-20 italic tracking-tighter">
              404
            </h1>
            <div className="-mt-10">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                Lost in Space?
              </h2>
              <p className="text-zinc-500 mt-2 mb-6 text-sm">
                The page you are looking for doesn't exist.
              </p>
              <a
                href="/"
                className="px-6 py-3 bg-(--color-bg-secondary) border border-(--color-border) text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-(--color-primary) transition-all"
              >
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
      {/* Notificações globais */}
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
      />

      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}