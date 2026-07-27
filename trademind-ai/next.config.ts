import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js/Turbopack from trying to bundle Prisma client.
  // The frontend never talks to the DB directly — it calls the Express API.
  // Without this, first-load compilation hangs for 20-30s on "filesystem cache compaction".
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Empty turbopack config — suppresses the "webpack config with Turbopack" warning
  // in Next.js 16 where Turbopack is enabled by default.
  turbopack: {},
};

export default nextConfig;

