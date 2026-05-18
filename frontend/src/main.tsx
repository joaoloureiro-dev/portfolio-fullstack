import React from "react";
import ReactDOM from "react-dom/client";
import './styles/global.css'

import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import "./styles/global.css";

import { AuthProvider } from "./contexts/AuthContext";
import ReactGA from "react-ga4";

// Inicializa uma única vez fora do componente ou no início da app
ReactGA.initialize(import.meta.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX"); // Substitui pelo teu ID de Medição do GA4

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);