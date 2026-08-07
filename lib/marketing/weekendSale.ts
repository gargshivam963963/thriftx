// ─────────────────────────────────────────────────────────────────────────────
// THRIFTX — Weekend Sale System (dynamic, configurable, no hardcoded dates)
//
// The weekend sale auto-activates every Saturday & Sunday. The window is
// computed entirely from the current time so it never goes stale and requires
// no manual date configuration. All sale parameters are configurable via the
// exported `WEEKEND_SALE_CONFIG`.
// ─────────────────────────────────────────────────────────────────────────────

export interface WeekendSaleConfig {
  /** Name shown in the section heading. */
  title: string;
  /** Marketing line shown under the title. */
  subtitle: string;
  /** Badge label, e.g. "🔥 Weekend Sale". */
  badge: string;
  /** Discount display, e.g. "Up to 40% OFF". */
  discountLabel: string;
  /** Coupon code surfaced during the sale. */
  couponCode: string;
  /** Sale starts on Saturday (day 6) at this hour (0-23). */
  startDay: number;
  startHour: number;
  /** Sale ends on Sunday (day 0) at this hour (0-23). */
  endDay: number;
  endHour: number;
  /** Featured product slugs displayed in the section. */
  featuredSlugs: string[];
  /** Shop link target. */
  shopHref: string;
}

export const WEEKEND_SALE_CONFIG: WeekendSaleConfig = {
  title: "Weekend Sale",
  subtitle: "Every Saturday & Sunday — exclusive drops at unbeatable prices.",
  badge: "🔥 Weekend Sale",
  discountLabel: "Up to 40% OFF",
  couponCode: "WEEKEND40",
  startDay: 6, // Saturday
  startHour: 0,
  endDay: 0, // Sunday
  endHour: 23,
  featuredSlugs: [],
  shopHref: "/shop?sort=sale",
};

export interface WeekendSaleWindow {
  /** True when `now` falls inside the active weekend window. */
  active: boolean;
  /** ISO timestamp of the next sale start (for countdown). */
  nextStart: string;
  /** ISO timestamp of the sale end (only meaningful when active). */
  end: string;
  /** Human label for the next window, e.g. "This Weekend". */
  label: string;
}

/**
 * Compute the current/next weekend sale window from a given `now` date.
 * Pure function — safe on both server and client.
 */
export function getWeekendSaleWindow(
  now: Date = new Date(),
  config: WeekendSaleConfig = WEEKEND_SALE_CONFIG,
): WeekendSaleWindow {
  const day = now.getDay(); // 0 = Sunday … 6 = Saturday
  const hour = now.getHours();

  // Build a date for the upcoming start day. We search forward from today
  // (and up to 7 days ahead) for the first occurrence of `startDay`.
  const start = new Date(now);
  let offset = 0;
  while (true) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    if (candidate.getDay() === config.startDay) {
      candidate.setHours(config.startHour, 0, 0, 0);
      start.setTime(candidate.getTime());
      break;
    }
    offset += 1;
    if (offset > 7) {
      // Safety fallback — should never happen (7 days covers all weekdays).
      start.setDate(now.getDate() + ((7 - day + config.startDay) % 7 || 7));
      start.setHours(config.startHour, 0, 0, 0);
      break;
    }
  }

  // End = the endDay that follows the next start. Compute by walking forward
  // from `start` to the next occurrence of `endDay`.
  const end = new Date(start);
  let endOffset = 1;
  while (true) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + endOffset);
    if (candidate.getDay() === config.endDay) {
      candidate.setHours(config.endHour, 59, 59, 999);
      end.setTime(candidate.getTime());
      break;
    }
    endOffset += 1;
    if (endOffset > 7) {
      end.setDate(start.getDate() + 1);
      end.setHours(config.endHour, 59, 59, 999);
      break;
    }
  }

  const active = now >= start && now <= end;

  if (active) {
    return {
      active: true,
      nextStart: start.toISOString(),
      end: end.toISOString(),
      label: "This Weekend",
    };
  }

  // Not active — show countdown to the next start.
  const daysUntil = Math.round(
    (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const label =
    daysUntil <= 1
      ? "Tomorrow"
      : daysUntil <= 7
        ? "This Weekend"
        : "Next Weekend";

  return {
    active: false,
    nextStart: start.toISOString(),
    end: end.toISOString(),
    label,
  };
}

/**
 * Countdown breakdown from a target ISO timestamp.
 */
export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getCountdownParts(targetIso: string): CountdownParts {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
