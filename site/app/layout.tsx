import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vela — Headless Trading Components",
  description: "Framework-agnostic Web Components for trading interfaces. Order books, candlestick charts, trade feeds. 5 components, 10 exchanges, 5 frameworks.",
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
