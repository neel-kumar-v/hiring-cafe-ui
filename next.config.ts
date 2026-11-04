import type { NextConfig } from "next";

// Hosts (besides localhost, which Next always allows) that may load Next dev
// resources: JS chunks, RSC payloads, and the HMR socket. Anything not listed
// here gets a 403 for those requests, which means the browser never loads the
// client bundle and the page stays hydrated-less forever (e.g. a job board stuck
// on skeleton cards).
//
// Tailnet / LAN hostnames are machine-specific, so they come from
// ALLOWED_DEV_ORIGINS (comma-separated) in `.env.local`; the Tailscale IP below
// stays as the tracked default. Wildcards are supported, e.g.
// `*.tail2424be.ts.net`.
const extraDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["100.118.196.105", ...extraDevOrigins],
};

export default nextConfig;
