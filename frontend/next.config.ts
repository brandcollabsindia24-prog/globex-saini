import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.185.126.104",
    "localhost",
    "127.0.0.1",
  ],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
