import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
   images: {
    unoptimized: true, // disables Next.js image optimization
  },
};

export default nextConfig;
