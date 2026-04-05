"use client";

import { useState } from "react";

const REPO = "https://github.com/astralchemist/vela";
const DOCS = `${REPO}/tree/main/docs/wiki/Getting-Started.md`;

const components = [
  { icon: "\u2630", name: "Order Book", desc: "Bids & asks with depth bars, price grouping, streaming delta updates via applyDelta().", tag: "<wick-order-book>" },
  { icon: "\u26A1", name: "Price Ticker", desc: "Flash-on-change with direction detection. 24h stats. Emits wick-price-change events.", tag: "<wick-price-ticker>" },
  { icon: "\u21C5", name: "Trade Feed", desc: "Scrolling trade list with addTrade() streaming. Time formats: absolute, relative, datetime.", tag: "<wick-trade-feed>" },
  { icon: "\u25E0", name: "Depth Chart", desc: "Canvas 2D cumulative bid/ask depth curves. Crosshair tooltip. 60fps via requestAnimationFrame.", tag: "<wick-depth-chart>" },
  { icon: "\u2593", name: "Candlestick Chart", desc: "OHLCV via TradingView Lightweight Charts. Real-time updateCandle(). Volume overlay.", tag: "<wick-candlestick-chart>" },
  { icon: "\u21C4", name: "10 Exchange Adapters", desc: "Binance, Coinbase, Kraken, Bybit, OKX, dYdX, Bitfinex, Gate.io, MEXC, KuCoin.", tag: "adapter.parse()" },
];

const codeExamples: Record<string, string> = {
  Vanilla: `import '@wick/order-book';
import { binanceAdapter } from '@wick/adapters/binance';

const ob = document.querySelector('wick-order-book');
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth');

ws.onmessage = (e) => {
  const msg = binanceAdapter.parse(JSON.parse(e.data));
  if (msg?.type === 'orderbook_delta') ob.applyDeltas(msg.data);
};`,
  React: `import { OrderBook, PriceTicker } from '@wick/react';

function TradingPanel({ bookData, tickerData }) {
  return (
    <>
      <PriceTicker data={tickerData} showDetails />
      <OrderBook
        data={bookData}
        depth={15}
        showTotal
        showDepth
        onLevelClick={(d) => console.log(d.price)}
      />
    </>
  );
}`,
  Vue: `<script setup>
import { useOrderBook } from '@wick/vue';
import { ref } from 'vue';

const data = ref({ bids: [], asks: [] });
const { elRef } = useOrderBook(data);
</script>

<template>
  <wick-order-book ref="elRef" :depth="15" show-total show-depth />
</template>`,
  Svelte: `<script>
  import { orderBook } from '@wick/svelte';
  let data = { bids: [], asks: [] };
</script>

<wick-order-book use:orderBook={data} depth={15} show-total show-depth />`,
  Angular: `import { WickOrderBookDirective } from '@wick/angular';

@Component({
  standalone: true,
  imports: [WickOrderBookDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    <wick-order-book
      wickOrderBook
      [wickData]="bookData"
      (wickLevelClick)="onClick($event)"
      depth="15" show-total show-depth
    ></wick-order-book>
  \`
})`,
};

const exchanges = [
  "Binance", "Coinbase", "Kraken", "Bybit", "OKX",
  "dYdX", "Bitfinex", "Gate.io", "MEXC", "KuCoin",
];

const themes = [
  { name: "Exchange", slug: "dark", desc: "Binance/Bybit inspired", colors: { ask: "#f6465d", bid: "#0ecb81", bg: "#12161c", askBg: "rgba(246,70,93,0.08)", bidBg: "rgba(14,203,129,0.08)", muted: "#5e6673" } },
  { name: "Minimal", slug: "minimal", desc: "Monochrome, clean borders", colors: { ask: "#ef4444", bid: "#22c55e", bg: "#111113", askBg: "transparent", bidBg: "transparent", muted: "#52525b" } },
  { name: "Glassmorphism", slug: "glass", desc: "Frosted panels, neon glow", colors: { ask: "#ff3860", bid: "#00ffa3", bg: "linear-gradient(135deg, rgba(15,12,41,0.9), rgba(48,43,99,0.6))", askBg: "transparent", bidBg: "transparent", muted: "#6a6a8a" } },
];

const mockRows = [
  { price: "67,432.50", size: "1.2340" },
  { price: "67,431.00", size: "0.8910" },
  { price: "67,430.50", size: "2.1560" },
  { price: "67,429.00", size: "0.5670" },
  { price: "67,428.50", size: "1.8920" },
  { price: "67,427.00", size: "3.4510" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("Vanilla");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Glow effects */}
      <div className="fixed top-[-40%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(124,93,250,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-[-30%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,255,163,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-5">
          <span className="text-xl font-extrabold tracking-tight">Wick</span>
          <div className="hidden md:flex gap-8">
            {["Components", "Exchanges", "Themes"].map((s) => (
              <a key={s} href={`#${s.toLowerCase()}`} className="text-sm font-medium text-muted hover:text-foreground transition-colors">{s}</a>
            ))}
            <a href={REPO} target="_blank" className="text-sm font-medium text-muted hover:text-foreground transition-colors">GitHub</a>
            <a href={DOCS} target="_blank" className="text-sm font-medium text-muted hover:text-foreground transition-colors">Docs</a>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-2 border border-border rounded-full text-sm text-text-2 mb-8">
            <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
            v0.1.0-alpha
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-[-0.04em] mb-6">
            Trading UI<br />
            <span className="bg-gradient-to-r from-accent-2 to-green bg-clip-text text-transparent">without the baggage</span>
          </h1>
          <p className="text-lg text-text-2 max-w-[560px] mx-auto mb-10 leading-relaxed">
            Headless Web Components for order books, charts, trade feeds, and more. Framework-agnostic. Unstyled. Real-time first. Under 10KB.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href={REPO} target="_blank" className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-xl text-[15px] font-semibold hover:opacity-90 transition-opacity">
              View on GitHub
            </a>
            <a href={DOCS} target="_blank" className="inline-flex items-center gap-2 px-7 py-3.5 bg-surface-2 border border-border text-foreground rounded-xl text-[15px] font-semibold hover:border-muted transition-colors">
              Get Started
            </a>
          </div>
          <div className="mt-8">
            <code className="font-mono text-sm text-text-2 bg-surface border border-border px-5 py-3 rounded-xl select-all">
              <span className="text-muted">$</span> npm install @wick/order-book @wick/trade-feed
            </code>
          </div>
        </section>

        {/* Stats */}
        <div className="flex justify-center gap-12 md:gap-16 py-12 border-t border-b border-border mb-20 flex-wrap">
          {[
            { value: "5", label: "Components" },
            { value: "10", label: "Exchanges" },
            { value: "5", label: "Frameworks" },
            { value: "3", label: "Themes" },
            { value: "<10KB", label: "Core (gzip)" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-4xl font-bold tracking-tight">{s.value}</div>
              <div className="text-sm text-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Components */}
        <section id="components" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-3">5 primitives, infinite possibilities</h2>
            <p className="text-text-2">Everything you need to build a trading interface. Bring your own styles.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((c) => (
              <div key={c.name} className="bg-surface border border-border rounded-2xl p-7 hover:border-muted hover:-translate-y-0.5 transition-all">
                <span className="text-3xl mb-4 block">{c.icon}</span>
                <h3 className="text-base font-semibold mb-2">{c.name}</h3>
                <p className="text-sm text-text-2 leading-relaxed mb-3">{c.desc}</p>
                <code className="font-mono text-xs bg-surface-2 px-2 py-1 rounded text-accent-2">{c.tag}</code>
              </div>
            ))}
          </div>
        </section>

        {/* Code examples */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-3">Works with your stack</h2>
            <p className="text-text-2">Native Web Components + framework wrappers for the DX you expect.</p>
          </div>
          <div className="flex gap-1 pl-4">
            {Object.keys(codeExamples).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`font-mono text-sm px-5 py-2.5 rounded-t-xl border border-b-0 transition-colors ${
                  activeTab === tab
                    ? "bg-surface-2 text-foreground border-border"
                    : "bg-surface text-muted border-border hover:text-text-2"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="bg-surface-2 border border-border rounded-b-2xl rounded-tr-2xl p-6 overflow-x-auto">
            <pre className="font-mono text-sm leading-7 text-text-2 whitespace-pre">
              {codeExamples[activeTab]}
            </pre>
          </div>
        </section>

        {/* Exchanges */}
        <section id="exchanges" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-3">10 exchanges. One parse call.</h2>
            <p className="text-text-2">Drop-in adapters that map raw WebSocket messages to Wick types.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {exchanges.map((ex) => (
              <span key={ex} className="bg-surface border border-border rounded-xl px-6 py-3 text-sm font-medium text-text-2 hover:border-muted hover:text-foreground transition-colors">
                {ex}
              </span>
            ))}
          </div>
        </section>

        {/* Themes */}
        <section id="themes" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight mb-3">3 themes. Or bring your own.</h2>
            <p className="text-text-2">Pure CSS. One import. Style per-component or globally.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => (
              <div key={t.name} className="border border-border rounded-2xl overflow-hidden hover:border-muted hover:-translate-y-0.5 transition-all">
                <div className="h-44 p-5 flex flex-col gap-1.5 font-mono text-xs" style={{ background: t.colors.bg }}>
                  {mockRows.map((r, i) => (
                    <div key={i} className="flex justify-between px-2 py-1 rounded" style={{ background: i < 3 ? t.colors.askBg : t.colors.bidBg }}>
                      <span style={{ color: i < 3 ? t.colors.ask : t.colors.bid, textShadow: t.slug === "glass" ? `0 0 8px ${i < 3 ? t.colors.ask : t.colors.bid}40` : "none" }}>
                        {r.price}
                      </span>
                      <span style={{ color: t.colors.muted }}>{r.size}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5 bg-surface">
                  <h3 className="text-[15px] font-semibold mb-1">{t.name}</h3>
                  <p className="text-sm text-muted mb-2">{t.desc}</p>
                  <code className="font-mono text-xs bg-surface-2 px-2 py-1 rounded text-accent-2">
                    {`import '@wick/theme/${t.slug}'`}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-20 border-t border-border">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">Start building.</h2>
          <p className="text-text-2 mb-8">MIT licensed. Open source. Ship your trading UI today.</p>
          <div className="flex gap-3 justify-center">
            <a href={REPO} target="_blank" className="inline-flex items-center px-7 py-3.5 bg-foreground text-background rounded-xl text-[15px] font-semibold hover:opacity-90 transition-opacity">
              GitHub
            </a>
            <a href={DOCS} target="_blank" className="inline-flex items-center px-7 py-3.5 bg-surface-2 border border-border text-foreground rounded-xl text-[15px] font-semibold hover:border-muted transition-colors">
              Documentation
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border text-center text-sm text-muted">
          Built by <a href="https://github.com/astralchemist" target="_blank" className="text-text-2 hover:text-foreground transition-colors">astralchemist</a>
          {" \u00B7 "}MIT License{" \u00B7 "}
          <a href={REPO} target="_blank" className="text-text-2 hover:text-foreground transition-colors">GitHub</a>
        </footer>
      </div>
    </div>
  );
}
