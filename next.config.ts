import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // This moves the setting to the correct location
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This moves the setting to the correct location
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};

export default nextConfig;