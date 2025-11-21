import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
   images: {
    unoptimized: true, 
  },
  transpilePackages: ["shared_ui"],
};

export default nextConfig;
