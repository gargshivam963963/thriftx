"use client";

import { Suspense } from "react";
import { AnalyticsProvider } from "@/lib/analytics/AnalyticsContext";

export default function AnalyticsProviderWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={null}>
            <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
    );
}
