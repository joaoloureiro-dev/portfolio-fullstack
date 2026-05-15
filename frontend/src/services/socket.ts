// Configuração do WebSocket Nativo com Reconexão Automática
const SOCKET_URL = "ws://localhost:3000/ws";

class SocketService {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectInterval = 3000; // 3 segundos

    constructor() {
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(SOCKET_URL);

        this.socket.onopen = () => {
            console.log("⚡ [WebSocket] Conectado com sucesso");
            this.reconnectAttempts = 0;
        };

        this.socket.onclose = (event) => {
            console.warn(`❌ [WebSocket] Conexão fechada: ${event.reason}`);
            this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
            console.error("🚨 [WebSocket] Erro detetado:", error);
        };
    }

    private attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 [WebSocket] Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error("💀 [WebSocket] Falha total na reconexão. Recarrega a página.");
        }
    }

    // Método para adicionar listeners de forma limpa
    public onMessage(callback: (data: any) => void) {
        if (!this.socket) return;

        const listener = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                callback(data);
            } catch (err) {
                // Se não for JSON, envia o texto puro
                callback(event.data);
            }
        };

        this.socket.addEventListener("message", listener);
        // Retorna uma função para remover o listener (limpeza de memória)
        return () => this.socket?.removeEventListener("message", listener);
    }

    // Método para enviar dados para o backend se necessário
    public send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }
}

// Exporta uma instância única (Singleton)
export const socketService = new SocketService();