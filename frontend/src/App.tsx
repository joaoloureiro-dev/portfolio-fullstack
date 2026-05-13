import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        closeButton
      />

      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rota Protegida - Apenas para Admins */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota 404 - Fallback com estilo Tailwind */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-(--color-bg) flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-9xl font-black text-(--color-primary) opacity-20 italic tracking-tighter">
                  404
                </h1>
                <div className="-mt-10"> {/* Alterado aqui */}
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
      </BrowserRouter>
    </>
  );
}