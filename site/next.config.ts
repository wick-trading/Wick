import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Wick",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
