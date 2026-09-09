import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger product image uploads through Server Actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
