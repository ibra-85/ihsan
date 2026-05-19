import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Next.js à bundler ces packages via ESM (le CJS exporte 0 icônes → hydration mismatch)
  transpilePackages: ["@hugeicons/react", "@hugeicons/core-free-icons"],
};

export default nextConfig;
