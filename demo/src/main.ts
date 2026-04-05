/**
 * Wick Demo — Mock data generator that simulates real-time market data.
 * Exercises all five components with randomized but realistic data.
 */
import '@wick/order-book';
import '@wick/price-ticker';
import '@wick/trade-feed';
import '@wick/depth-chart';
import '@wick/candlestick-chart';

import type { OrderBookData, Trade, Candle } from '@wick/core';
import type { WickOrderBook } from '@wick/order-book';
import type { WickPriceTicker } from '@wick/price-ticker';
import type { WickTradeFeed } from '@wick/trade-feed';
import type { WickDepthChart } from '@wick/depth-chart';
import type { WickCandlestickChart } from '@wick/candlestick-chart';

// --- Mock data generators ---

const BASE_PRICE = 67_432.50;
const SPREAD = 0.50;

function randomAround(base: number, variance: number): number {
  return base + (Math.random() - 0.5) * 2 * variance;
}

function generateOrderBook(midPrice: number, levels = 40): OrderBookData {
  const bids = [];
  const asks = [];

  for (let i = 0; i < levels; i++) {
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

function generateHistoricalCandles(basePrice: number, count: number): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const interval = 60_000; // 1 minute candles
  let price = basePrice - count * 5; // Start lower to show trend

  for (let i = count; i > 0; i--) {
    const open = price;
    const change = randomAround(0, 15);
    const close = open + change;
    const high = Math.max(open, close) + Math.abs(randomAround(0, 8));
    const low = Math.min(open, close) - Math.abs(randomAround(0, 8));
    const volume = randomAround(50, 45);

    candles.push({
      time: now - i * interval,
      open,
      high,
      low,
      close,
      volume: Math.abs(volume),
    });

    price = close;
  }

  return candles;
}

// --- Wire up components ---

const orderBook = document.getElementById('orderbook') as WickOrderBook;
const ticker = document.getElementById('ticker') as WickPriceTicker;
const tradeFeed = document.getElementById('tradefeed') as WickTradeFeed;
const depthChart = document.getElementById('depthchart') as WickDepthChart;
const candleChart = document.getElementById('candlechart') as WickCandlestickChart;

let currentPrice = BASE_PRICE;

// Initial state
const initialBook = generateOrderBook(currentPrice);
orderBook.data = initialBook;
depthChart.data = initialBook;

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

// Generate historical candles
const candles = generateHistoricalCandles(currentPrice, 200);
candleChart.candles = candles;

// Track current candle for real-time updates
let currentCandle: Candle = {
  time: Math.floor(Date.now() / 60_000) * 60_000, // Round to current minute
  open: currentPrice,
  high: currentPrice,
  low: currentPrice,
  close: currentPrice,
  volume: 0,
};

// --- Simulate real-time updates ---

// Order book + depth chart: refresh every 200ms
setInterval(() => {
  currentPrice = randomAround(currentPrice, 2);
  const book = generateOrderBook(currentPrice);
  orderBook.data = book;
  depthChart.data = book;
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

  // Update current candle
  const now = Math.floor(Date.now() / 60_000) * 60_000;
  if (now > currentCandle.time) {
    // New candle
    currentCandle = {
      time: now,
      open: currentPrice,
      high: currentPrice,
      low: currentPrice,
      close: currentPrice,
      volume: 0,
    };
  } else {
    currentCandle.close = currentPrice;
    currentCandle.high = Math.max(currentCandle.high, currentPrice);
    currentCandle.low = Math.min(currentCandle.low, currentPrice);
    currentCandle.volume += Math.abs(randomAround(1, 0.8));
  }

  candleChart.updateCandle(currentCandle);
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
orderBook.addEventListener('wick-order-book-level-click', (e) => {
  console.log('Order book level clicked:', (e as CustomEvent).detail);
});

ticker.addEventListener('wick-price-change', (e) => {
  console.log('Price changed:', (e as CustomEvent).detail);
});

tradeFeed.addEventListener('wick-trade-click', (e) => {
  console.log('Trade clicked:', (e as CustomEvent).detail);
});

depthChart.addEventListener('wick-depth-chart-click', (e) => {
  console.log('Depth chart clicked:', (e as CustomEvent).detail);
});

candleChart.addEventListener('wick-candlestick-click', (e) => {
  console.log('Candlestick clicked:', (e as CustomEvent).detail);
});
