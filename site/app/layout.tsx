import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wick — Headless Trading Components",
  description: "31 headless Web Components for trading interfaces. Order books, candlestick charts, trade feeds, and more. Framework-agnostic, unstyled, real-time first. 10 exchange adapters, 4 framework wrappers, MIT licensed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
