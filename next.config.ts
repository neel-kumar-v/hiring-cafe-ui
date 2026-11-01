import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Allow the Tailscale IP so dev resources (RSC payload, HMR, chunks) load when
  // browsing from other devices on the tailnet instead of only via localhost.
  allowedDevOrigins: ["100.118.196.105"],
};

export default nextConfig;
