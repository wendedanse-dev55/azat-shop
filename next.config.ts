import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger product image uploads through Server Actions
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    // Static buyers' guide lives in public/guide; serve it at /guide.
    return [{ source: "/guide", destination: "/guide/index.html" }];
  },
};

export default nextConfig;
