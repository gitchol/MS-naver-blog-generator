import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    // Disable type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Keep ESLint checking enabled
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
