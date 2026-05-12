import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* O Toaster fica fora do BrowserRouter para estar sempre disponível */}
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

          {/* Rota Protegida */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota 404 - Fallback */}
          <Route
            path="*"
            element={
              <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
                <h1>404</h1>
                <p>Page Not Found</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}