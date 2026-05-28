// ================================
// BACKENDS
// ================================
const PRIMARY_URL =
    import.meta.env.VITE_API_URL_PRIMARY ||
    "https://portfolio-fullstack-production-729a.up.railway.app";

const BACKUP_URL =
    import.meta.env.VITE_API_URL_BACKUP ||
    "https://portfolio-fullstack-xdwl.onrender.com";

// backend ativo
let activeBackend: "railway" | "render" =
    "railway";

// ================================
// BUILD WS URL
// ================================
function buildSocketUrl(url: string) {

    const protocol =
        url.startsWith("https")
            ? "wss"
            : "ws";

    const cleanUrl =
        url.replace(/^https?:\/\//, "");

    return `${protocol}://${cleanUrl}/ws`;
}

// ================================
// SOCKET SERVICE
// ================================
class SocketService {

    private socket: WebSocket | null = null;

    private listeners:
        ((data: any) => void)[] = [];

    constructor() {

        if (typeof window !== "undefined") {
            this.connect();
        }
    }

    private connect() {

        // evita múltiplas conexões
        if (
            this.socket?.readyState === WebSocket.OPEN ||
            this.socket?.readyState === WebSocket.CONNECTING
        ) {
            return;
        }

        // escolhe backend ativo
        const backendUrl =
            activeBackend === "railway"
                ? PRIMARY_URL
                : BACKUP_URL;

        const socketUrl =
            buildSocketUrl(backendUrl);

        console.log(
            "🔌 WS CONNECT:",
            socketUrl
        );

        this.socket =
            new WebSocket(socketUrl);

        // ================================
        // OPEN
        // ================================
        this.socket.onopen = () => {

            console.log(
                `⚡ [WebSocket] Conectado (${activeBackend})`
            );
        };

        // ================================
        // MESSAGE
        // ================================
        this.socket.onmessage = (event) => {

            try {

                const data =
                    JSON.parse(event.data);

                this.listeners.forEach(
                    cb => cb(data)
                );

            } catch {

                this.listeners.forEach(
                    cb => cb(event.data)
                );
            }
        };

        // ================================
        // ERROR
        // ================================
        this.socket.onerror = (err) => {

            console.error(
                "❌ [WebSocket] Erro:",
                err
            );
        };

        // ================================
        // CLOSE + FAILOVER
        // ================================
        this.socket.onclose = () => {

            console.warn(
                `🔄 [WebSocket] Fechado (${activeBackend})`
            );

            // FAILOVER
            if (activeBackend === "railway") {

                console.log(
                    "🟠 WS FAILOVER -> Render"
                );

                activeBackend = "render";

            } else {

                console.log(
                    "🟢 WS FAILOVER -> Railway"
                );

                activeBackend = "railway";
            }

            // reconnect
            setTimeout(() => {
                this.connect();
            }, 3000);
        };
    }

    // ================================
    // LISTENERS
    // ================================
    public onMessage(
        callback: (data: any) => void
    ) {

        this.listeners.push(callback);

        return () => {

            this.listeners =
                this.listeners.filter(
                    cb => cb !== callback
                );
        };
    }
}

// singleton
export const socketService =
    new SocketService();