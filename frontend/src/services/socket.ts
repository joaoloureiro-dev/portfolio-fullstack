// 1. Vai buscar o URL base (Railway em produção ou localhost em desenvolvimento)
const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 2. Transforma o protocolo: Se a API for https://, o WS tem de ser wss://. Se for http://, usa ws://
const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";

// 3. Remove o "http://" ou "https://" do link para construir o URL final do WebSocket
const cleanUrl = backendUrl.replace(/^https?:\/\//, "");
const SOCKET_URL = `${wsProtocol}://${cleanUrl}/ws`;

class SocketService {
    private socket: WebSocket | null = null;
    private listeners: ((data: any) => void)[] = [];

    constructor() {
        if (typeof window !== "undefined") {
            this.connect();
        }
    }

    private connect() {
        // Se já estiver aberto ou a conectar, não faz nada
        if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) return;

        this.socket = new WebSocket(SOCKET_URL);

        this.socket.onopen = () => console.log("⚡ [WebSocket] Conectado");

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach(cb => cb(data));
            } catch (e) {
                this.listeners.forEach(cb => cb(event.data));
            }
        };

        this.socket.onclose = () => {
            console.warn("🔄 [WebSocket] Fechado. Tentando reconectar...");
            setTimeout(() => this.connect(), 3000);
        };
    }

    public onMessage(callback: (data: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
}

// GARANTE O SINGLETON: Exporta apenas uma instância
export const socketService = new SocketService();