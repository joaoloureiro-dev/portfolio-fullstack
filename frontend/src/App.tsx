import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized"; // Importa a nova página

import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rota para utilizadores sem permissão */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Opcional: Rota 404 para quando a página não existe */}
        <Route path="*" element={<div style={{ textAlign: 'center', marginTop: '50px' }}>404 - Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  );
}