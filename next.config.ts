import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.36dianping.com" },
      { protocol: "https", hostname: "img.36krcdn.com" }
    ]
  }
};

export default nextConfig;
