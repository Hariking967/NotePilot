import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Temporarily disable turbopack until font issue is resolved
    turbo: false,
  },
};

export default nextConfig;
