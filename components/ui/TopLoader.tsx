"use client";

import NextTopLoader from "nextjs-toploader";

export default function TopLoader() {
    return (
        <NextTopLoader
            color="#000000"
            initialPosition={0.08}
            crawl
            crawlSpeed={200}
            height={3}
            easing="ease"
            speed={200}
            shadow="0 0 10px rgba(0,0,0,.25)"
            showSpinner={false}
        />
    );
}