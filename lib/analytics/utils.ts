// ─── Session Management ─────────────────────────────────────────────────────────

const SESSION_KEY = "thriftx_session_id";
const SESSION_START_KEY = "thriftx_session_start";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = window.sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
    window.sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
  }
  return sessionId;
}

export function getSessionStart(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.sessionStorage.getItem(SESSION_START_KEY)) || Date.now();
}

export function resetSession(): void {
  if (typeof window === "undefined") return;
  const newId = generateId();
  window.sessionStorage.setItem(SESSION_KEY, newId);
  window.sessionStorage.setItem(SESSION_START_KEY, String(Date.now()));
}

// ─── Device Detection ───────────────────────────────────────────────────────────

export function detectDevice(): {
  type: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
} {
  if (typeof window === "undefined") {
    return { type: "desktop", browser: "unknown", os: "unknown" };
  }

  const ua = navigator.userAgent;
  const mobile = /Mobile|Android|iP(ad|hone|od)/i.test(ua);
  const tablet = /Tablet|iPad/i.test(ua) || (/(Android)/i.test(ua) && !mobile);

  let os = "unknown";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "unknown";
  if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edge/i.test(ua)) browser = "Edge";

  return {
    type: tablet ? "tablet" : mobile ? "mobile" : "desktop",
    browser,
    os,
  };
}

// ─── ID Generation ──────────────────────────────────────────────────────────────

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

// ─── URL Utilities ──────────────────────────────────────────────────────────────

export function getPagePath(): string {
  if (typeof window === "undefined") return "";
  return window.location.pathname + window.location.search;
}

export function getReferrer(): string {
  if (typeof window === "undefined") return "";
  return document.referrer || "";
}

export function getUTMParams(): {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
} {
  if (typeof window === "undefined") {
    return { source: "", medium: "", campaign: "", term: "", content: "" };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
}

export function detectTrafficSource(): string {
  if (typeof window === "undefined") return "direct";

  const referrer = document.referrer;
  const utm = getUTMParams();

  if (utm.source) return utm.source;

  if (!referrer) return "direct";

  const url = new URL(referrer);
  const host = url.hostname.toLowerCase();

  if (host.includes("instagram") || host.includes("ig")) return "instagram";
  if (host.includes("google")) return "google";
  if (host.includes("facebook") || host.includes("fb")) return "facebook";
  if (host.includes("whatsapp")) return "whatsapp";
  if (host.includes("twitter") || host.includes("x.com")) return "twitter";
  if (host.includes("youtube") || host.includes("youtu.be")) return "youtube";
  if (
    host.includes("mail") ||
    host.includes("outlook") ||
    host.includes("gmail")
  )
    return "email";

  return "referral";
}

// ─── Debounce ───────────────────────────────────────────────────────────────────

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Throttle ───────────────────────────────────────────────────────────────────

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ─── Formatters ─────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString("en-IN");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function getDateRange(preset: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "30d":
      start.setDate(start.getDate() - 30);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "1y":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }

  return { start, end };
}

export function getDateRangeLabel(preset: string): string {
  const labels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    "90d": "Last 90 Days",
    "1y": "Last Year",
    custom: "Custom Range",
  };
  return labels[preset] || "Last 30 Days";
}
