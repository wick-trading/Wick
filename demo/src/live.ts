/**
 * Vela Live Demo — Real Binance WebSocket data.
 * Uses public streams (no API key needed).
 */
import '@vela-trading/order-book';
import '@vela-trading/price-ticker';
import '@vela-trading/trade-feed';
import '@vela-trading/depth-chart';

import { binanceAdapter } from '@vela-trading/adapters/binance';
import { parseDepthSnapshot } from '@vela-trading/adapters/binance';
import type { OrderBookData } from '@vela-trading/core';
import type { VelaOrderBook } from '@vela-trading/order-book';
import type { VelaPriceTicker } from '@vela-trading/price-ticker';
import type { VelaTradeFeed } from '@vela-trading/trade-feed';
import type { VelaDepthChart } from '@vela-trading/depth-chart';

// --- DOM refs ---

const orderBook = document.getElementById('orderbook') as VelaOrderBook;
const ticker = document.getElementById('ticker') as VelaPriceTicker;
const tradeFeed = document.getElementById('tradefeed') as VelaTradeFeed;
const depthChart = document.getElementById('depthchart') as VelaDepthChart;
const symbolSelect = document.getElementById('symbolSelect') as HTMLSelectElement;
const reconnectBtn = document.getElementById('reconnectBtn') as HTMLButtonElement;
const statusDot = document.getElementById('statusDot') as HTMLElement;
const statusText = document.getElementById('statusText') as HTMLElement;

// --- State ---

let ws: WebSocket | null = null;
let currentSymbol = 'btcusdt';
let book: OrderBookData = { bids: [], asks: [] };

// --- Status UI ---

function setStatus(state: 'connecting' | 'connected' | 'disconnected', text: string) {
  statusDot.className = `dot ${state}`;
  statusText.textContent = text;
}

// --- Fetch initial order book snapshot via REST ---

async function fetchSnapshot(symbol: string): Promise<void> {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/depth?symbol=${symbol.toUpperCase()}&limit=50`,
    );
    const data = await res.json();
    book = parseDepthSnapshot(data);
    orderBook.data = book;
    depthChart.data = book;
  } catch (err) {
    console.error('Failed to fetch snapshot:', err);
  }
}

// --- WebSocket connection ---

function connect(symbol: string) {
  // Close existing connection
  if (ws) {
    ws.close();
    ws = null;
  }

  currentSymbol = symbol;
  book = { bids: [], asks: [] };
  tradeFeed.trades = [];

  setStatus('connecting', `Connecting to ${symbol.toUpperCase()}...`);

  // Fetch REST snapshot first
  fetchSnapshot(symbol);

  // Combined stream: depth updates + trades + ticker
  const streams = [
    `${symbol}@depth@100ms`,
    `${symbol}@aggTrade`,
    `${symbol}@ticker`,
  ].join('/');

  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.onopen = () => {
    setStatus('connected', `Live: ${symbol.toUpperCase()}`);
  };

  ws.onmessage = (event) => {
    try {
      const wrapper = JSON.parse(event.data);
      const raw = wrapper.data ?? wrapper;
      const msg = binanceAdapter.parse(raw);

      if (!msg) return;

      switch (msg.type) {
        case 'orderbook_snapshot':
          book = msg.data;
          orderBook.data = book;
          depthChart.data = book;
          break;

        case 'orderbook_delta':
          orderBook.applyDeltas(msg.data);
          // Also update the depth chart with the order book's current state
          depthChart.data = orderBook.data;
          break;

        case 'trade':
          tradeFeed.addTrade(msg.data);
          break;

        case 'ticker':
          ticker.data = msg.data;
          // Fix symbol format for display
          ticker.data = {
            ...msg.data,
            symbol: formatSymbol(symbol),
          };
          break;
      }
    } catch (err) {
      console.error('Parse error:', err);
    }
  };

  ws.onclose = () => {
    setStatus('disconnected', 'Disconnected');
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
    setStatus('disconnected', 'Connection error');
  };
}

function formatSymbol(symbol: string): string {
  // btcusdt → BTC/USDT
  const base = symbol.replace(/usdt$/i, '').toUpperCase();
  return `${base}/USDT`;
}

// --- Controls ---

symbolSelect.addEventListener('change', () => {
  connect(symbolSelect.value);
});

reconnectBtn.addEventListener('click', () => {
  connect(currentSymbol);
});

// --- Init ---

connect(currentSymbol);

// Log events
orderBook.addEventListener('vela-order-book-level-click', (e) => {
  console.log('Level clicked:', (e as CustomEvent).detail);
});

depthChart.addEventListener('vela-depth-chart-click', (e) => {
  console.log('Depth clicked:', (e as CustomEvent).detail);
});
