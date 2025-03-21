import type { NextConfig } from "next";

const PLATFORM_URL = "https://brain-note-nextjs.vercel.app";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/api/",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/docs"
            : "/api/py/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/openapi.json"
            : "/api/py/openapi.json",
      },
      {
        source: `/api/:path*`,
        destination: `/api/:path*`,
      },
      {
        source: `/:path*`,
        destination: `${PLATFORM_URL}/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.ts",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-059988cbda3e4e14840e5d023c91d7c5.r2.dev",
      },
    ],
  },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
