"use client";

import { useEffect, useState } from "react";

/**
 * Whether the server has Google OAuth configured.
 * Returns null while loading so callers can avoid hiding the button prematurely.
 */
export function useGoogleAuthEnabled(): boolean | null {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/config-status", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { googleConfigured?: boolean } | null) => {
        setEnabled(data ? Boolean(data.googleConfigured) : true);
      })
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") setEnabled(true);
      });
    return () => controller.abort();
  }, []);

  return enabled;
}
