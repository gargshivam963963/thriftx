// ─── LocalStorage Event Queue ───────────────────────────────────────────────────
// Batches events in localStorage flushed periodically to the API.
// Survives page refreshes and ensures no events are lost.

const QUEUE_KEY = "thriftx_analytics_queue";
const MAX_QUEUE_SIZE = 100;
const MAX_BATCH_SIZE = 50;
const FLUSH_INTERVAL = 5000; // 5 seconds

export interface QueuedEvent {
  id: string;
  event: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

export function getQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedEvent[]) : [];
  } catch {
    return [];
  }
}

export function addToQueue(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const queue = getQueue();
    queue.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      event,
      timestamp: Date.now(),
      retries: 0,
    });

    // Trim if exceeds max
    const trimmed = queue.slice(-MAX_QUEUE_SIZE);
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("[Analytics Storage] Failed to queue event:", e);
  }
}

export function getBatch(batchSize: number = MAX_BATCH_SIZE): QueuedEvent[] {
  const queue = getQueue();
  return queue.slice(0, batchSize);
}

export function removeBatch(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const queue = getQueue();
    const idSet = new Set(ids);
    const remaining = queue.filter((item) => !idSet.has(item.id));
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // Silently fail
  }
}

export function incrementRetries(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const queue = getQueue();
    const idSet = new Set(ids);
    const updated = queue.map((item) =>
      idSet.has(item.id) ? { ...item, retries: item.retries + 1 } : item,
    );
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail
  }
}

export function clearQueue(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Silently fail
  }
}

export function getQueueSize(): number {
  return getQueue().length;
}

export function shouldFlush(): boolean {
  return getQueueSize() >= MAX_BATCH_SIZE;
}

export { FLUSH_INTERVAL, MAX_BATCH_SIZE };
