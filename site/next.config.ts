import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Vela",
  images: { unoptimized: true },
};

export default nextConfig;
