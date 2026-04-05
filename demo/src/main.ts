/**
 * Vela Demo — Mock data generator that simulates real-time market data.
 * This exercises all three components with randomized but realistic data.
 */
import '@vela-trading/order-book';
import '@vela-trading/price-ticker';
import '@vela-trading/trade-feed';

import type { OrderBookData, Trade, TickerData } from '@vela-trading/core';
import type { VelaOrderBook } from '@vela-trading/order-book';
import type { VelaPriceTicker } from '@vela-trading/price-ticker';
import type { VelaTradeFeed } from '@vela-trading/trade-feed';

// --- Mock data generators ---

const BASE_PRICE = 67_432.50;
const SPREAD = 0.50;

function randomAround(base: number, variance: number): number {
  return base + (Math.random() - 0.5) * 2 * variance;
}

function generateOrderBook(midPrice: number): OrderBookData {
  const bids = [];
  const asks = [];

  for (let i = 0; i < 20; i++) {
    bids.push({
      price: midPrice - SPREAD / 2 - i * randomAround(1, 0.5),
      size: randomAround(2, 1.8),
    });
    asks.push({
      price: midPrice + SPREAD / 2 + i * randomAround(1, 0.5),
      size: randomAround(2, 1.8),
    });
  }

  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  return { bids, asks };
}

let tradeId = 0;
function generateTrade(midPrice: number): Trade {
  const side = Math.random() > 0.5 ? 'buy' : 'sell';
  return {
    id: String(++tradeId),
    price: randomAround(midPrice, 3),
    size: randomAround(0.5, 0.45),
    side,
    timestamp: Date.now(),
  };
}

// --- Wire up components ---

const orderBook = document.getElementById('orderbook') as VelaOrderBook;
const ticker = document.getElementById('ticker') as VelaPriceTicker;
const tradeFeed = document.getElementById('tradefeed') as VelaTradeFeed;

let currentPrice = BASE_PRICE;

// Initial state
orderBook.data = generateOrderBook(currentPrice);
ticker.data = {
  symbol: 'BTC/USD',
  price: currentPrice,
  change24h: 2.34,
  high24h: currentPrice + 1200,
  low24h: currentPrice - 800,
  volume24h: 42_150,
  timestamp: Date.now(),
};

// Seed initial trades
const initialTrades: Trade[] = [];
for (let i = 0; i < 15; i++) {
  initialTrades.push(generateTrade(currentPrice));
}
tradeFeed.trades = initialTrades;

// --- Simulate real-time updates ---

// Order book: refresh every 200ms
setInterval(() => {
  currentPrice = randomAround(currentPrice, 2);
  orderBook.data = generateOrderBook(currentPrice);
}, 200);

// Ticker: update every 500ms
setInterval(() => {
  const prevPrice = currentPrice;
  currentPrice = randomAround(currentPrice, 1.5);

  ticker.data = {
    symbol: 'BTC/USD',
    price: currentPrice,
    prevPrice,
    change24h: ((currentPrice - BASE_PRICE) / BASE_PRICE) * 100,
    high24h: Math.max(currentPrice + 1200, ticker.data.high24h ?? 0),
    low24h: Math.min(currentPrice - 800, ticker.data.low24h ?? Infinity),
    volume24h: (ticker.data.volume24h ?? 0) + randomAround(5, 4),
    timestamp: Date.now(),
  };
}, 500);

// Trade feed: new trade every 300-800ms
function scheduleNextTrade() {
  const delay = 300 + Math.random() * 500;
  setTimeout(() => {
    tradeFeed.addTrade(generateTrade(currentPrice));
    scheduleNextTrade();
  }, delay);
}
scheduleNextTrade();

// Log events for debugging
orderBook.addEventListener('vela-order-book-level-click', (e) => {
  console.log('Order book level clicked:', (e as CustomEvent).detail);
});

ticker.addEventListener('vela-price-change', (e) => {
  console.log('Price changed:', (e as CustomEvent).detail);
});

tradeFeed.addEventListener('vela-trade-click', (e) => {
  console.log('Trade clicked:', (e as CustomEvent).detail);
});
