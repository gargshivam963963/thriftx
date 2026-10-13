"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  Globe,
  Smartphone,
  Eye,
  Search,
  ShoppingBag,
  Heart,
  MousePointerClick,
  Loader2,
  CalendarDays,
  Timer,
  Layers,
  UserCheck,
  UserX,
} from "lucide-react";

import type {
  VisitorDetail,
  VisitorRow,
  AnalyticsApiResponse,
} from "@/lib/analytics/admin-types";
import { formatDuration } from "@/lib/analytics/utils";
import SegmentedControl from "@/components/ui/SegmentedControl";

type DetailTab = "journey" | "pages" | "products" | "searches";

function formatDateTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function eventIcon(type: string) {
  switch (type) {
    case "page_view":
      return <Eye size={13} />;
    case "product_view":
      return <ShoppingBag size={13} />;
    case "search":
    case "search_no_results":
      return <Search size={13} />;
    case "add_to_cart":
    case "remove_from_cart":
    case "checkout_start":
    case "checkout_complete":
    case "purchase":
      return <ShoppingBag size={13} />;
    case "wishlist_add":
    case "wishlist_remove":
      return <Heart size={13} />;
    case "click":
      return <MousePointerClick size={13} />;
    default:
      return <Layers size={13} />;
  }
}

const EVENT_BADGE: Record<string, string> = {
  page_view: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  product_view: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  search: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  search_no_results: "bg-red-500/10 text-red-600 dark:text-red-400",
  add_to_cart: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  purchase: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  checkout_start: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  checkout_complete: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  wishlist_add: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  click: "bg-muted text-muted-foreground",
};


function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

export default function VisitorDrawer({
  visitor,
  range,
  onClose,
}: {
  /** The clicked table row (null = drawer closed). */
  visitor: VisitorRow | null;
  range: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<VisitorDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<DetailTab>("journey");

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!visitor) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visitor]);

  useEffect(() => {
    if (!visitor) {
      setDetail(null);
      return;
    }
    setTab("journey");
    let cancelled = false;
    setLoading(true);
    fetch(
      `/api/analytics?action=visitor-detail&range=${range}&visitorId=${encodeURIComponent(visitor.id)}`,
    )
      .then((res) => res.json())
      .then((json: AnalyticsApiResponse<VisitorDetail>) => {
        if (!cancelled && json.success) setDetail(json.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visitor, range]);

  const shown = detail ?? null;

  return (
    <AnimatePresence>
      {visitor && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            role="dialog"
            aria-label={`Activity for ${visitor.displayName}`}
          >
            {/* Header */}
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                      visitor.identified
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {(visitor.displayName || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-foreground">
                      {visitor.displayName}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {visitor.identified ? (
                        <>
                          <UserCheck size={12} className="text-emerald-500" />
                          {visitor.email ?? "Signed-in customer"}
                        </>
                      ) : (
                        <>
                          <UserX size={12} />
                          Guest visitor
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close visitor details"
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {loading && !shown ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  Loading activity…
                </div>
              ) : shown ? (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Stat icon={<Eye size={11} />} label="Views" value={String(shown.pageViews)} />
                  <Stat icon={<Layers size={11} />} label="Visits" value={String(shown.sessions)} />
                  <Stat icon={<Timer size={11} />} label="Time" value={formatDuration(shown.timeOnSite)} />
                  <Stat icon={<Globe size={11} />} label="Source" value={shown.source || "direct"} />
                  <Stat
                    icon={<Smartphone size={11} />}
                    label="Device"
                    value={shown.device === "unknown" ? "—" : shown.device}
                  />
                  <Stat icon={<CalendarDays size={11} />} label="Last seen" value={formatDateTime(shown.lastSeen)} />
                </div>
              ) : null}

              {shown?.location && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {shown.location}
                </p>
              )}
            </div>

            {/* Tabs + Body — appended next */}
            <div className="border-b border-border px-5 pb-3 pt-3">
              <SegmentedControl
                options={[
                  { value: "journey", label: "Journey", icon: <Clock size={12} /> },
                  { value: "pages", label: "Pages", icon: <Eye size={12} /> },
                  { value: "products", label: "Items", icon: <ShoppingBag size={12} /> },
                  { value: "searches", label: "Search", icon: <Search size={12} /> },
                ]}
                value={tab}
                onChange={(v) => setTab(v as DetailTab)}
                size="sm"
                ariaLabel="Visitor activity tabs"
              />
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && !shown ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : !shown ? (
                <p className="text-center text-sm text-muted-foreground">
                  Could not load activity for this visitor.
                </p>
              ) : (
                <>
                  {tab === "journey" && <JourneyTab detail={shown} />}
                  {tab === "pages" && <PagesTab detail={shown} />}
                  {tab === "products" && <ProductsTab detail={shown} />}
                  {tab === "searches" && <SearchesTab detail={shown} />}
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}


function JourneyTab({ detail }: { detail: VisitorDetail }) {
  if (detail.timeline.length === 0) {
    return <EmptyState text="No activity recorded in this range." />;
  }
  return (
    <ol className="relative space-y-0 border-l border-border pl-0">
      {detail.timeline.map((entry, i) => (
        <li key={`${entry.timestamp}-${i}`} className="relative pb-4 pl-8 last:pb-0">
          <span
            className={`absolute left-0 top-0.5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full ${
              EVENT_BADGE[entry.eventType] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {eventIcon(entry.eventType)}
          </span>
          <p className="text-[13px] font-medium leading-snug text-foreground">
            {entry.summary}
          </p>
          <p className="mt-0.5 truncate text-2xs text-muted-foreground">
            {formatDateTime(entry.timestamp)}
            {entry.page && entry.eventType !== "page_view" ? ` · ${entry.page}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

function PagesTab({ detail }: { detail: VisitorDetail }) {
  if (detail.pages.length === 0) {
    return <EmptyState text="No page views in this range." />;
  }
  const max = Math.max(...detail.pages.map((p) => p.views));
  return (
    <ul className="space-y-2.5">
      {detail.pages.map((p) => (
        <li key={p.page}>
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="truncate font-medium text-foreground">{p.page}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {p.views} view{p.views === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(6, (p.views / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProductsTab({ detail }: { detail: VisitorDetail }) {
  if (detail.products.length === 0) {
    return <EmptyState text="No product activity in this range." />;
  }
  return (
    <ul className="space-y-2">
      {detail.products.map((p) => (
        <li key={p.productId} className="rounded-lg bg-muted/60 p-3">
          <p className="truncate text-[13px] font-medium text-foreground">
            {p.name ?? p.productId}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {p.views > 0 && <MiniBadge text={`${p.views} viewed`} />}
            {p.cartAdds > 0 && (
              <MiniBadge text={`${p.cartAdds} added to cart`} highlight />
            )}
            {p.wishlistAdds > 0 && <MiniBadge text={`${p.wishlistAdds} wishlisted`} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function SearchesTab({ detail }: { detail: VisitorDetail }) {
  if (detail.searches.length === 0) {
    return <EmptyState text="No searches in this range." />;
  }
  return (
    <ul className="space-y-2">
      {detail.searches.map((s, i) => (
        <li
          key={`${s.timestamp}-${i}`}
          className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2"
        >
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-foreground">
              “{s.query}”
            </span>
            <span className="block text-2xs text-muted-foreground">
              {formatDateTime(s.timestamp)}
            </span>
          </span>
          {s.noResults && (
            <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-2xs font-semibold text-red-600 dark:text-red-400">
              no results
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function MiniBadge({ text, highlight }: { text: string; highlight?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-2xs font-medium ${
        highlight
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-background text-muted-foreground"
      }`}
    >
      {text}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{text}</p>;
}

