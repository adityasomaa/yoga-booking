import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Image Optimization is OFF on purpose.
     *
     * The Vercel Image Optimization quota on this account is exhausted. With
     * the optimizer enabled every /_next/image request returns 402 and the
     * production pages render with broken images. Serving the assets as-is
     * costs nothing and, since every graphic here is a small hand-generated
     * SVG, there is nothing for an optimizer to gain anyway.
     */
    unoptimized: true,
  },
};

export default nextConfig;
