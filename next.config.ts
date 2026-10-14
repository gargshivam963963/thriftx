import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: isProduction ? ".next" : ".next-dev",

  async headers() {
    return [
      {
        // Hashed/static imagery in /public rarely changes — cache aggressively.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },

  images: {
    // R2 product images are served through presigned URLs whose
    // X-Amz-Date / X-Amz-Signature query params change on every presign. That
    // makes each render a unique `/_next/image?url=...` value, so Vercel's
    // optimizer cache can never hit — which burned through the image
    // optimization quota and returned `402 (Payment Required)` for every image.
    //
    // R2 already stores every uploaded product image as WebP, so the optimizer
    // was adding little value at a very high cost. Serve the R2 objects
    // directly instead.
    unoptimized: true,
    // Keep optimized derivatives around for a day so repeat views hit cache.
    minimumCacheTTL: 86400,
    // Serve the smallest modern format the browser supports (AVIF > WebP).
    formats: ["image/avif", "image/webp"],
    // Only generate the quality levels actually used across the app.
    qualities: [70, 75, 82, 85],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 320, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sgp.cloud.appwrite.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  output: "standalone",

  transpilePackages: ["motion"],

  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === "true") {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    return config;
  },
};

export default nextConfig;
