// src/services/api.ts

// ================================
// BACKEND URLS
// ================================
const PRIMARY_URL =
    import.meta.env.VITE_API_URL_PRIMARY ||
    "https://portfolio-fullstack-production-729a.up.railway.app";

const BACKUP_URL =
    import.meta.env.VITE_API_URL_BACKUP ||
    "https://portfolio-fullstack-xdwl.onrender.com";

// ================================
// BACKEND STATE
// ================================
let activeBackend: "railway" | "render" = "railway";
let lastFailover = 0;

const FAILOVER_RECOVERY_TIME = 60_000;

// ================================
// CUSTOM ERROR
// ================================
class ApiError extends Error {
    status?: number;
    body?: unknown;

    constructor(message: string, status?: number, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.body = body;
    }
}

// ================================
// HELPERS
// ================================
function getMethod(options: RequestInit): string {
    return (options.method || "GET").toUpperCase();
}

function isReadOnlyRequest(options: RequestInit): boolean {
    return getMethod(options) === "GET";
}

function canFailover(error: unknown, options: RequestInit): boolean {
    if (!isReadOnlyRequest(options)) {
        return false;
    }

    if (error instanceof ApiError) {
        return !!error.status && error.status >= 500;
    }

    return true;
}

async function parseResponseBody(response: Response): Promise<any> {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

// ================================
// AUTHORIZED FETCH
// ================================
export async function authorizedFetch(
    url: string,
    options: RequestInit = {}
): Promise<any> {
    const token = localStorage.getItem("token");

    const endpoint = url.startsWith("/") ? url : `/${url}`;

    /*
     * IMPORTANTE:
     * Não enviar Content-Type: application/json em GET/DELETE sem body.
     * Caso contrário, Fastify pode responder 400 por receber JSON vazio.
     */
    const headers = new Headers(options.headers);

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    async function makeRequest(baseUrl: string): Promise<any> {
        const cleanBase = baseUrl.replace(/\/$/, "");
        const fullUrl = `${cleanBase}${endpoint}`;

        console.log(`🚀 Request -> ${fullUrl}`);

        let response: Response;

        try {
            response = await fetch(fullUrl, {
                ...options,
                headers,
            });
        } catch (error) {
            console.error("❌ Network request failed:", error);
            throw error;
        }

        console.log("📡 STATUS:", response.status);

        const payload = await parseResponseBody(response);

        if (response.status === 401) {
            console.error("❌ Unauthorized:", payload);
            throw new ApiError("UNAUTHORIZED", response.status, payload);
        }

        if (response.status === 403) {
            console.error("❌ Forbidden:", payload);
            throw new ApiError("FORBIDDEN", response.status, payload);
        }

        if (!response.ok) {
            console.error("❌ HTTP ERROR BODY:", payload);
            throw new ApiError(
                `HTTP_${response.status}`,
                response.status,
                payload
            );
        }

        return payload;
    }

    // ================================
    // AUTO RECOVERY TO RAILWAY
    // ================================
    if (
        activeBackend === "render" &&
        Date.now() - lastFailover > FAILOVER_RECOVERY_TIME
    ) {
        console.log("♻️ Tentando recuperar Railway...");
        activeBackend = "railway";
    }

    try {
        const currentUrl =
            activeBackend === "railway"
                ? PRIMARY_URL
                : BACKUP_URL;

        return await makeRequest(currentUrl);

    } catch (error: any) {
        console.warn("⚠️ Backend ativo falhou:", error);

        if (
            error?.message === "UNAUTHORIZED" ||
            error?.message === "FORBIDDEN" ||
            error?.name === "AbortError"
        ) {
            throw error;
        }

        /*
         * Só fazemos failover automático em GET.
         * Nunca repetimos automaticamente DELETE/PATCH/POST,
         * para não criar ações duplicadas ou falsos sucessos.
         */
        if (
            activeBackend === "railway" &&
            canFailover(error, options)
        ) {
            console.log("🔄 Mudando para Render...");

            activeBackend = "render";
            lastFailover = Date.now();

            return await makeRequest(BACKUP_URL);
        }

        throw error;
    }
}

// ================================
// MAIN DASHBOARD API
// ================================

// Dashboard principal: lista simples de requests
export const getRequests = (signal?: AbortSignal) =>
    authorizedFetch("/requests", {
        signal,
    });

// Dashboard principal: cards Active Users / Page Views / Top Service
export const getDashboardAnalytics = (signal?: AbortSignal) =>
    authorizedFetch("/analytics", {
        signal,
    });

// Atualizar estado de um request
export const updateRequestStatus = (
    id: number,
    status: string
) =>
    authorizedFetch(`/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });

// Apagar request
export const deleteRequest = (id: number) =>
    authorizedFetch(`/requests/${id}`, {
        method: "DELETE",
    });

// Limpar activity logs
export const clearActivityLogs = () =>
    authorizedFetch("/logs", {
        method: "DELETE",
    });

// Criar log ao abrir resposta por email
export const logEmailSent = (
    clientName: string,
    service: string
) =>
    authorizedFetch("/logs/email", {
        method: "POST",
        body: JSON.stringify({
            clientName,
            service,
        }),
    });

// ================================
// GA4 ANALYTICS DASHBOARD API
// ================================

/*
 * Esta é a rota do Google Analytics real.
 * Não trocar para /analytics.
 */
export const getAnalytics = (
    period: string = "7d",
    signal?: AbortSignal
) =>
    authorizedFetch(
        `/admin/analytics?period=${encodeURIComponent(period)}`,
        {
            signal,
        }
    );