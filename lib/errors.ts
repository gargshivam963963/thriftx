/**
 * THRIFTX Design System — Centralized Error Handling
 * Converts raw API / Appwrite errors into friendly, user-facing messages.
 * Never expose raw error internals to the UI.
 */

export type ErrorCode =
  | "UNAUTHORIZED" // 401
  | "FORBIDDEN" // 403
  | "NOT_FOUND" // 404
  | "CONFLICT" // 409
  | "VALIDATION" // 422
  | "RATE_LIMITED" // 429
  | "SERVER_ERROR" // 500
  | "OFFLINE"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

interface FriendlyError {
  code: ErrorCode;
  status?: number;
  message: string;
}

const STATUS_MAP: Record<number, ErrorCode> = {
  400: "VALIDATION",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION",
  429: "RATE_LIMITED",
  500: "SERVER_ERROR",
  502: "SERVER_ERROR",
  503: "SERVER_ERROR",
  504: "TIMEOUT",
};

const MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  CONFLICT: "This action conflicts with existing data. Please retry.",
  VALIDATION: "Please check your details and try again.",
  RATE_LIMITED: "You've made too many requests. Please wait a moment.",
  SERVER_ERROR: "Something went wrong on our end. Please try again.",
  OFFLINE: "You appear to be offline. Check your connection.",
  TIMEOUT: "The request took too long. Please try again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNKNOWN: "Something unexpected happened. Please try again.",
};

/**
 * Extract a normalized error object from any thrown value.
 */
export function normalizeError(error: unknown): FriendlyError {
  // Network / fetch errors
  if (error instanceof TypeError) {
    if (!navigator.onLine) {
      return { code: "OFFLINE", message: MESSAGES.OFFLINE };
    }
    return { code: "NETWORK_ERROR", message: MESSAGES.NETWORK_ERROR };
  }

  // DOMException timeout
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return { code: "TIMEOUT", message: MESSAGES.TIMEOUT };
  }

  // Handle objects that look like API errors
  if (typeof error === "object" && error !== null) {
    const e = error as Record<string, unknown>;

    // Appwrite-style errors
    if (typeof e.code === "number") {
      const code = STATUS_MAP[e.code] ?? "UNKNOWN";
      return {
        code,
        status: e.code as number,
        message:
          typeof e.message === "string" && e.message.trim()
            ? friendlyFromRaw(e.message)
            : MESSAGES[code],
      };
    }

    // Response object with status
    if (typeof e.status === "number") {
      const status = e.status as number;
      const code = STATUS_MAP[status] ?? "UNKNOWN";
      return {
        code,
        status,
        message:
          typeof e.message === "string" && e.message.trim()
            ? e.message
            : MESSAGES[code],
      };
    }

    // Plain Error
    if (e instanceof Error || typeof e.message === "string") {
      const raw = e.message as string;
      return { code: "UNKNOWN", message: friendlyFromRaw(raw) };
    }
  }

  return { code: "UNKNOWN", message: MESSAGES.UNKNOWN };
}

/**
 * Get a friendly user-facing message from any thrown error.
 */
export function getFriendlyError(error: unknown, fallback?: string): string {
  const normalized = normalizeError(error);
  return normalized.message || fallback || MESSAGES.UNKNOWN;
}

/**
 * Map a raw message to a friendly one for common Appwrite/backend patterns.
 */
function friendlyFromRaw(raw: string): string {
  const lower = raw.toLowerCase();

  if (lower.includes("already exists") || lower.includes("already in use")) {
    return "This account already exists. Please sign in instead.";
  }
  if (
    lower.includes("invalid credentials") ||
    lower.includes("invalid email")
  ) {
    return "Incorrect email or password.";
  }
  if (lower.includes("password") && lower.includes("8")) {
    return "Password must be at least 8 characters.";
  }
  if (lower.includes("user not found")) {
    return "No account found with these details.";
  }
  if (lower.includes("network request failed")) {
    return MESSAGES.NETWORK_ERROR;
  }
  if (lower.includes("unauthorized") || lower.includes("session")) {
    return MESSAGES.UNAUTHORIZED;
  }
  if (lower.includes("rate") && lower.includes("limit")) {
    return MESSAGES.RATE_LIMITED;
  }

  return raw;
}
