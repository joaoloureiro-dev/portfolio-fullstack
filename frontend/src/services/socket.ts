const SOCKET_URL = "ws://localhost:3000/ws";

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