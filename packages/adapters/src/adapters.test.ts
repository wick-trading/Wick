import { describe, it, expect } from 'vitest';
import { binanceAdapter } from './binance.js';
import { coinbaseAdapter } from './coinbase.js';
import { krakenAdapter } from './kraken.js';
import { bybitAdapter } from './bybit.js';
import { okxAdapter } from './okx.js';

describe('Binance adapter', () => {
  it('parses depth snapshot', () => {
    const msg = {
      lastUpdateId: 123,
      bids: [['67400.00', '1.5'], ['67399.00', '3.2']],
      asks: [['67401.00', '0.8'], ['67402.00', '2.1']],
    };

    const result = binanceAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_snapshot');
    if (result?.type === 'orderbook_snapshot') {
      expect(result.data.bids).toHaveLength(2);
      expect(result.data.bids[0]).toEqual({ price: 67400, size: 1.5 });
      expect(result.data.asks[0]).toEqual({ price: 67401, size: 0.8 });
    }
  });

  it('parses depth update', () => {
    const msg = {
      e: 'depthUpdate',
      s: 'BTCUSDT',
      b: [['67400.00', '2.0']],
      a: [['67401.00', '0']],
    };

    const result = binanceAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_delta');
    if (result?.type === 'orderbook_delta') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ side: 'bid', price: 67400, size: 2 });
      expect(result.data[1]).toEqual({ side: 'ask', price: 67401, size: 0 });
    }
  });

  it('parses trade', () => {
    const msg = {
      e: 'trade',
      s: 'BTCUSDT',
      p: '67432.50',
      q: '0.5',
      t: 12345,
      T: 1712345678000,
      m: false,
    };

    const result = binanceAdapter.parse(msg);
    expect(result?.type).toBe('trade');
    if (result?.type === 'trade') {
      expect(result.data.id).toBe('12345');
      expect(result.data.price).toBe(67432.5);
      expect(result.data.size).toBe(0.5);
      expect(result.data.side).toBe('buy');
      expect(result.data.timestamp).toBe(1712345678000);
    }
  });

  it('parses aggTrade', () => {
    const msg = {
      e: 'aggTrade',
      s: 'BTCUSDT',
      p: '67432.50',
      q: '0.5',
      t: 99,
      T: 1712345678000,
      m: true,
    };

    const result = binanceAdapter.parse(msg);
    expect(result?.type).toBe('trade');
    if (result?.type === 'trade') {
      expect(result.data.side).toBe('sell'); // m=true → maker is buyer → taker is seller
    }
  });

  it('parses 24hr ticker', () => {
    const msg = {
      e: '24hrTicker',
      s: 'BTCUSDT',
      c: '67432.50',
      P: '2.34',
      h: '68000.00',
      l: '66000.00',
      v: '42150.00',
      E: 1712345678000,
    };

    const result = binanceAdapter.parse(msg);
    expect(result?.type).toBe('ticker');
    if (result?.type === 'ticker') {
      expect(result.data.symbol).toBe('BTCUSDT');
      expect(result.data.price).toBe(67432.5);
      expect(result.data.change24h).toBe(2.34);
    }
  });

  it('returns null for unknown messages', () => {
    expect(binanceAdapter.parse({ e: 'unknown' })).toBeNull();
    expect(binanceAdapter.parse(null)).toBeNull();
    expect(binanceAdapter.parse('string')).toBeNull();
  });
});

describe('Coinbase adapter', () => {
  it('parses snapshot', () => {
    const msg = {
      type: 'snapshot',
      product_id: 'BTC-USD',
      bids: [['67400.00', '1.5']],
      asks: [['67401.00', '0.8']],
    };

    const result = coinbaseAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_snapshot');
    if (result?.type === 'orderbook_snapshot') {
      expect(result.data.bids[0]).toEqual({ price: 67400, size: 1.5 });
    }
  });

  it('parses l2update', () => {
    const msg = {
      type: 'l2update',
      product_id: 'BTC-USD',
      changes: [['buy', '67400.00', '2.0'], ['sell', '67401.00', '0']],
    };

    const result = coinbaseAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_delta');
    if (result?.type === 'orderbook_delta') {
      expect(result.data[0]).toEqual({ side: 'bid', price: 67400, size: 2 });
      expect(result.data[1]).toEqual({ side: 'ask', price: 67401, size: 0 });
    }
  });

  it('parses match trade', () => {
    const msg = {
      type: 'match',
      trade_id: 999,
      product_id: 'BTC-USD',
      price: '67432.50',
      size: '0.5',
      side: 'buy',
      time: '2026-01-15T14:30:00.000Z',
    };

    const result = coinbaseAdapter.parse(msg);
    expect(result?.type).toBe('trade');
    if (result?.type === 'trade') {
      expect(result.data.id).toBe('999');
      expect(result.data.side).toBe('sell'); // Opposite of maker side
    }
  });

  it('parses ticker', () => {
    const msg = {
      type: 'ticker',
      product_id: 'BTC-USD',
      price: '67432.50',
      open_24h: '66000.00',
      high_24h: '68000.00',
      low_24h: '65500.00',
      volume_24h: '42150.00',
      time: '2026-01-15T14:30:00.000Z',
    };

    const result = coinbaseAdapter.parse(msg);
    expect(result?.type).toBe('ticker');
    if (result?.type === 'ticker') {
      expect(result.data.symbol).toBe('BTC/USD');
      expect(result.data.price).toBe(67432.5);
      expect(result.data.change24h).toBeCloseTo(2.17, 1);
    }
  });

  it('returns null for subscriptions and heartbeats', () => {
    expect(coinbaseAdapter.parse({ type: 'subscriptions' })).toBeNull();
    expect(coinbaseAdapter.parse({ type: 'heartbeat' })).toBeNull();
  });
});

describe('Kraken adapter', () => {
  it('parses book snapshot', () => {
    const msg = {
      channel: 'book',
      type: 'snapshot',
      data: [{
        symbol: 'BTC/USD',
        bids: [{ price: 67400, qty: 1.5 }],
        asks: [{ price: 67401, qty: 0.8 }],
      }],
    };

    const result = krakenAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_snapshot');
    if (result?.type === 'orderbook_snapshot') {
      expect(result.data.bids[0]).toEqual({ price: 67400, size: 1.5 });
    }
  });

  it('parses book update', () => {
    const msg = {
      channel: 'book',
      type: 'update',
      data: [{
        symbol: 'BTC/USD',
        bids: [{ price: 67400, qty: 2.0 }],
        asks: [{ price: 67401, qty: 0 }],
      }],
    };

    const result = krakenAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_delta');
    if (result?.type === 'orderbook_delta') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ side: 'bid', price: 67400, size: 2 });
    }
  });

  it('parses trades', () => {
    const msg = {
      channel: 'trade',
      type: 'update',
      data: [
        {
          ord_type: 'limit',
          price: 67432.5,
          qty: 0.5,
          side: 'buy',
          symbol: 'BTC/USD',
          timestamp: '2026-01-15T14:30:00.000Z',
          trade_id: 12345,
        },
      ],
    };

    const result = krakenAdapter.parse(msg);
    expect(result?.type).toBe('trades');
    if (result?.type === 'trades') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].side).toBe('buy');
      expect(result.data[0].price).toBe(67432.5);
    }
  });

  it('parses ticker', () => {
    const msg = {
      channel: 'ticker',
      type: 'update',
      data: [{
        symbol: 'BTC/USD',
        last: 67432.5,
        high: 68000,
        low: 66000,
        volume: 42150,
        change: 1432.5,
        change_pct: 2.17,
      }],
    };

    const result = krakenAdapter.parse(msg);
    expect(result?.type).toBe('ticker');
    if (result?.type === 'ticker') {
      expect(result.data.price).toBe(67432.5);
      expect(result.data.change24h).toBe(2.17);
    }
  });

  it('returns null for system/subscription messages', () => {
    expect(krakenAdapter.parse({ channel: 'status', type: 'update' })).toBeNull();
    expect(krakenAdapter.parse({ method: 'subscribe' })).toBeNull();
  });
});

describe('Bybit adapter', () => {
  it('parses orderbook snapshot', () => {
    const msg = {
      topic: 'orderbook.50.BTCUSDT',
      type: 'snapshot',
      data: {
        s: 'BTCUSDT',
        b: [['67400.00', '1.5']],
        a: [['67401.00', '0.8']],
        u: 123,
      },
    };

    const result = bybitAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_snapshot');
    if (result?.type === 'orderbook_snapshot') {
      expect(result.data.bids[0]).toEqual({ price: 67400, size: 1.5 });
      expect(result.data.asks[0]).toEqual({ price: 67401, size: 0.8 });
    }
  });

  it('parses orderbook delta', () => {
    const msg = {
      topic: 'orderbook.50.BTCUSDT',
      type: 'delta',
      data: {
        s: 'BTCUSDT',
        b: [['67400.00', '2.0']],
        a: [['67401.00', '0']],
        u: 124,
      },
    };

    const result = bybitAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_delta');
    if (result?.type === 'orderbook_delta') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ side: 'bid', price: 67400, size: 2 });
    }
  });

  it('parses trades', () => {
    const msg = {
      topic: 'publicTrade.BTCUSDT',
      type: 'snapshot',
      data: [{
        T: 1712345678000,
        s: 'BTCUSDT',
        S: 'Buy',
        v: '0.5',
        p: '67432.50',
        i: '12345',
      }],
    };

    const result = bybitAdapter.parse(msg);
    expect(result?.type).toBe('trades');
    if (result?.type === 'trades') {
      expect(result.data[0].side).toBe('buy');
      expect(result.data[0].price).toBe(67432.5);
    }
  });

  it('parses ticker', () => {
    const msg = {
      topic: 'tickers.BTCUSDT',
      type: 'snapshot',
      data: {
        symbol: 'BTCUSDT',
        lastPrice: '67432.50',
        highPrice24h: '68000.00',
        lowPrice24h: '66000.00',
        volume24h: '42150.00',
        price24hPcnt: '0.0234',
        turnover24h: '2840000000',
      },
    };

    const result = bybitAdapter.parse(msg);
    expect(result?.type).toBe('ticker');
    if (result?.type === 'ticker') {
      expect(result.data.price).toBe(67432.5);
      expect(result.data.change24h).toBeCloseTo(2.34, 1);
    }
  });

  it('returns null for unknown messages', () => {
    expect(bybitAdapter.parse({ op: 'subscribe' })).toBeNull();
    expect(bybitAdapter.parse({ topic: 'unknown', type: 'snapshot' })).toBeNull();
  });
});

describe('OKX adapter', () => {
  it('parses book snapshot', () => {
    const msg = {
      arg: { channel: 'books', instId: 'BTC-USDT' },
      action: 'snapshot',
      data: [{
        bids: [['67400', '1.5', '0', '3']],
        asks: [['67401', '0.8', '0', '2']],
        ts: '1712345678000',
      }],
    };

    const result = okxAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_snapshot');
    if (result?.type === 'orderbook_snapshot') {
      expect(result.data.bids[0]).toEqual({ price: 67400, size: 1.5 });
    }
  });

  it('parses book update', () => {
    const msg = {
      arg: { channel: 'books', instId: 'BTC-USDT' },
      action: 'update',
      data: [{
        bids: [['67400', '2.0', '0', '4']],
        asks: [['67401', '0', '0', '0']],
        ts: '1712345679000',
      }],
    };

    const result = okxAdapter.parse(msg);
    expect(result?.type).toBe('orderbook_delta');
    if (result?.type === 'orderbook_delta') {
      expect(result.data[0]).toEqual({ side: 'bid', price: 67400, size: 2 });
      expect(result.data[1]).toEqual({ side: 'ask', price: 67401, size: 0 });
    }
  });

  it('parses trades', () => {
    const msg = {
      arg: { channel: 'trades', instId: 'BTC-USDT' },
      data: [{
        instId: 'BTC-USDT',
        tradeId: '99999',
        px: '67432.50',
        sz: '0.5',
        side: 'buy',
        ts: '1712345678000',
      }],
    };

    const result = okxAdapter.parse(msg);
    expect(result?.type).toBe('trades');
    if (result?.type === 'trades') {
      expect(result.data[0].price).toBe(67432.5);
      expect(result.data[0].side).toBe('buy');
      expect(result.data[0].id).toBe('99999');
    }
  });

  it('parses ticker', () => {
    const msg = {
      arg: { channel: 'tickers', instId: 'BTC-USDT' },
      data: [{
        instId: 'BTC-USDT',
        last: '67432.50',
        high24h: '68000.00',
        low24h: '66000.00',
        vol24h: '42150.00',
        open24h: '66000.00',
        ts: '1712345678000',
      }],
    };

    const result = okxAdapter.parse(msg);
    expect(result?.type).toBe('ticker');
    if (result?.type === 'ticker') {
      expect(result.data.symbol).toBe('BTC/USDT');
      expect(result.data.price).toBe(67432.5);
      expect(result.data.change24h).toBeCloseTo(2.17, 1);
    }
  });

  it('returns null for non-data messages', () => {
    expect(okxAdapter.parse({ event: 'subscribe' })).toBeNull();
    expect(okxAdapter.parse({ arg: { channel: 'unknown' } })).toBeNull();
  });
});

