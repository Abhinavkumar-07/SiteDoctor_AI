import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * standalone: required for Cloud Run Docker builds — produces a
   * self-contained .next/standalone directory that doesn't need
   * node_modules at runtime. See ARCHITECTURE.md §14 (Deployment).
   */
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/sitedoctor-assets/**",
      },
    ],
  },
  serverExternalPackages:[
"playwright",
"lighthouse"
],

  /**
   * Prevent Next.js from exposing which framework the site uses.
   * Minor security hardening — consistent with the security posture
   * in ARCHITECTURE.md §10.
   */
  poweredByHeader: false,
};

export default nextConfig;
