import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-059988cbda3e4e14840e5d023c91d7c5.r2.dev",
      },
    ],
  },
};

export default nextConfig;
