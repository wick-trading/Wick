import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Wick",
  images: { unoptimized: true },
};

export default nextConfig;
