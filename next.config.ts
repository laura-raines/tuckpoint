import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundling react-pdf corrupts its font parsing (DataView range errors);
  // load it from node_modules at runtime instead.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
