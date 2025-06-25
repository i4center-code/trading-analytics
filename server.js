const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const cache = new NodeCache({ stdTTL: 60 });

const CRYPTO_SYMBOLS = {
  BTC: 'بیت‌کوین',
  ETH: 'اتریوم',
  // ... (بقیه نمادها مانند قبل)
};

// تابع دریافت اطلاعات پایه از Exir V2
async function getExirConstants() {
  try {
    const response = await axios.get('https://api.exir.io/v2/constants');
    return response.data;
  } catch (error) {
    console.error('خطا در دریافت اطلاعات پایه:', error.message);
    return null;
  }
}

// تابع دریافت قیمت از API Exir V2
async function getCryptoPrices(symbol) {
  const cacheKey = `price_${symbol}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  try {
    // دریافت اطلاعات تیکر
    const tickerResponse = await axios.get(`https://api.exir.io/v2/ticker?symbol=${symbol.toLowerCase()}-irt`, {
      timeout: 15000
    });

    if (!tickerResponse.data) {
      throw new Error('داده دریافتی نامعتبر است');
    }

    // دریافت اطلاعات دفتر سفارشات
    const orderbookResponse = await axios.get(`https://api.exir.io/v2/orderbook?symbol=${symbol.toLowerCase()}-irt`, {
      timeout: 15000
    });

    const tickerData = tickerResponse.data;
    const orderbookData = orderbookResponse.data;

    const lastPrice = parseFloat(tickerData.last);
    const highPrice = parseFloat(tickerData.high);
    const lowPrice = parseFloat(tickerData.low);
    const volume = parseFloat(tickerData.volume);
    const bestBid = parseFloat(orderbookData.bids[0][0]);
    const bestAsk = parseFloat(orderbookData.asks[0][0]);

    const spread = (bestAsk - bestBid) || (highPrice - lowPrice) * 0.01;
    const asks = orderbookData.asks.map(ask => [parseFloat(ask[0]), parseFloat(ask[1])]);
    const bids = orderbookData.bids.map(bid => [parseFloat(bid[0]), parseFloat(bid[1])]);

    const totalBuyVolume = bids.reduce((sum, bid) => sum + bid[1], 0);
    const totalSellVolume = asks.reduce((sum, ask) => sum + ask[1], 0);

    const result = {
      prices: [highPrice, lowPrice, lastPrice, ...asks.map(a => a[0]), ...bids.map(b => b[0])],
      totalBuyVolume,
      totalSellVolume,
      lastPrice,
      orderbook: {
        asks,
        bids
      }
    };

    cache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}

// محاسبه تحلیل تکنیکال (بدون تغییر)
function calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume) {
  const lastPrice = prices[prices.length - 1];

  const rsi = technicalindicators.rsi({
    values: prices,
    period: 14
  }).slice(-1)[0] || 50;

  const macdResult = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };

  const stochastic = technicalindicators.stochastic({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14,
    signalPeriod: 3
  }).slice(-1)[0] || { k: 50, d: 50 };

  const ema = technicalindicators.ema({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  const sma = technicalindicators.sma({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  const resistance1 = Math.max(...prices) * 1.01;
  const resistance2 = Math.max(...prices) * 1.02;
  const support1 = Math.min(...prices) * 0.99;
  const support2 = Math.min(...prices) * 0.98;

  const totalVolume = totalBuyVolume + totalSellVolume;
  const buyPercentage = (totalBuyVolume / totalVolume) * 100 || 0;
  const sellPercentage = (totalSellVolume / totalVolume) * 100 || 0;

  return {
    lastPrice,
    rsi,
    macd: macdResult,
    stochastic,
    ema,
    sma,
    resistance1,
    resistance2,
    support1,
    support2,
    buyPercentage,
    sellPercentage
  };
}

// مسیرهای API
app.get('/api/symbols', async (req, res) => {
  try {
    const constants = await getExirConstants();
    if (constants) {
      const symbols = {};
      Object.entries(constants.pairs).forEach(([pair, data]) => {
        if (pair.endsWith('-irt')) {
          const symbol = pair.split('-')[0].toUpperCase();
          symbols[symbol] = CRYPTO_SYMBOLS[symbol] || symbol;
        }
      });
      res.json(symbols);
    } else {
      res.json(CRYPTO_SYMBOLS);
    }
  } catch (error) {
    res.json(CRYPTO_SYMBOLS);
  }
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    const { prices, totalBuyVolume, totalSellVolume, lastPrice } = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);

    res.json({
      status: 'success',
      symbol,
      name: CRYPTO_SYMBOLS[symbol] || symbol,
      lastPrice: lastPrice.toLocaleString('fa-IR'),
      indicators: {
        rsi: analysis.rsi,
        macd: analysis.macd,
        stochastic: analysis.stochastic,
        ema: analysis.ema,
        sma: analysis.sma
      },
      resistance1: analysis.resistance1.toLocaleString('fa-IR'),
      resistance2: analysis.resistance2.toLocaleString('fa-IR'),
      support1: analysis.support1.toLocaleString('fa-IR'),
      support2: analysis.support2.toLocaleString('fa-IR'),
      buyPercentage: analysis.buyPercentage.toFixed(2),
      sellPercentage: analysis.sellPercentage.toFixed(2),
      lastUpdate: new Date(),
      dataSource: 'EXIR V2'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا روی پورت ${PORT} | استفاده از API Exir V2`);
});

module.exports = app;
