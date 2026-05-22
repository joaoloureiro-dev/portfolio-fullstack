import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./styles/global.css"; // Mantivemos apenas um import do CSS
import { AuthProvider } from "./contexts/AuthContext";
import ReactGA from "react-ga4";

// Inicializa o GA4 com o teu ID real ou a variável de ambiente
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-P8HML5N8FG";
ReactGA.initialize(GA_ID);

// Envia o primeiro hit de visualização da página assim que o site carrega
ReactGA.send({ hitType: "pageview", page: window.location.pathname });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);