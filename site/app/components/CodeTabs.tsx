"use client";

import { useState } from "react";

const TABS = ["React", "Vue", "Svelte", "Angular", "Vanilla"] as const;
type Tab = (typeof TABS)[number];

const CODE: Record<Tab, string> = {
  React: `import { OrderBook, PriceTicker } from '@wick/react';

function TradingPanel({ bookData, tickerData }) {
  return (
    <div className="trading-panel">
      <PriceTicker data={tickerData} showDetails />
      <OrderBook
        data={bookData}
        depth={15}
        showTotal
        showDepth
        onLevelClick={(d) => placeOrder(d.price)}
      />
    </div>
  );
}`,

  Vue: `<template>
  <div class="trading-panel">
    <wick-price-ticker show-details ref="ticker" />
    <wick-order-book depth="15" show-total show-depth ref="book" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import '@wick/price-ticker'
import '@wick/order-book'

const props = defineProps(['bookData', 'tickerData'])
const ticker = ref(null)
const book = ref(null)

watch(() => props.tickerData, (data) => { if (ticker.value) ticker.value.data = data })
watch(() => props.bookData,   (data) => { if (book.value)   book.value.data   = data })
</script>`,

  Svelte: `<script>
  import '@wick/order-book';
  import '@wick/price-ticker';

  export let bookData;
  export let tickerData;

  let bookEl;
  let tickerEl;

  $: if (bookEl)   bookEl.data   = bookData;
  $: if (tickerEl) tickerEl.data = tickerData;
</script>

<wick-price-ticker show-details bind:this={tickerEl} />
<wick-order-book depth="15" show-total show-depth bind:this={bookEl} />`,

  Angular: `import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import '@wick/order-book';
import '@wick/price-ticker';

@Component({
  selector: 'trading-panel',
  template: \`
    <wick-price-ticker show-details #ticker></wick-price-ticker>
    <wick-order-book depth="15" show-total show-depth #book></wick-order-book>
  \`,
})
export class TradingPanelComponent {
  @ViewChild('ticker') ticker!: ElementRef;
  @ViewChild('book')   book!: ElementRef;

  @Input() set tickerData(v: any) { if (this.ticker) this.ticker.nativeElement.data = v; }
  @Input() set bookData(v: any)   { if (this.book)   this.book.nativeElement.data   = v; }
}`,

  Vanilla: `import '@wick/order-book';
import '@wick/price-ticker';

const book   = document.querySelector('wick-order-book');
const ticker = document.querySelector('wick-price-ticker');

// Set initial snapshot
book.data   = bookData;
ticker.data = tickerData;

// Stream live updates
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  book.applyDelta(msg.delta);
  ticker.data = msg.ticker;
};

// React to level clicks
book.addEventListener('wick-order-book-level-click', (e) => {
  placeOrder(e.detail.price, e.detail.side);
});`,
};

export function CodeTabs() {
  const [active, setActive] = useState<Tab>("React");

  return (
    <section id="code" className="pb-24">
      <div className="text-center mb-12">
        <p className="text-sm font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          Framework Support
        </p>
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
        >
          Works with your stack
        </h2>
        <p className="text-base mt-3 max-w-[440px] mx-auto" style={{ color: "var(--text-2)" }}>
          Native Web Components plus framework wrappers for the DX you expect.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Tab bar */}
        <div
          role="tablist"
          aria-label="Framework examples"
          className="flex overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab === active;
            return (
              <button
                key={tab}
                role="tab"
                aria-selected={isActive}
                aria-controls={`code-panel-${tab}`}
                id={`code-tab-${tab}`}
                onClick={() => setActive(tab)}
                className="px-5 py-3 font-mono text-sm shrink-0 transition-colors"
                style={{
                  color: isActive ? "var(--foreground)" : "var(--text-muted)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  borderRight: "1px solid rgba(255,255,255,0.04)",
                  borderBottom: isActive ? "2px solid var(--green)" : "2px solid transparent",
                  outline: "none",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "inset 0 0 0 2px rgba(0,255,163,0.4)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Code panel */}
        {TABS.map((tab) => (
          <div
            key={tab}
            role="tabpanel"
            id={`code-panel-${tab}`}
            aria-labelledby={`code-tab-${tab}`}
            hidden={tab !== active}
            className="p-6"
            style={{ background: "var(--surface-2)" }}
          >
            <pre
              className="font-mono text-sm leading-7 overflow-x-auto"
              style={{ color: "var(--text-2)" }}
            >
              <code>{CODE[tab]}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
