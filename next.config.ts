import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // @ts-ignore
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;
