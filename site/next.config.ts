import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Wick",
  trailingSlash: true,
  images: { unoptimized: true },
  // Wick Lit-based web components need to be transpiled through Next's bundler
  // so custom element registration runs on the client. Each package exports
  // ESM and registers its custom element on import.
  transpilePackages: [
    "@wick/core",
    "@wick/order-book",
    "@wick/price-ticker",
    "@wick/trade-feed",
    "lit",
    "lit-html",
    "lit-element",
    "@lit/reactive-element",
  ],
};

export default nextConfig;
