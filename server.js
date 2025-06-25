const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// لیست جفت‌های پشتیبانی شده در Exir v2
const CRYPTO_PAIRS = {
  'BTC-USDT': 'بیت‌کوین',
  'ETH-USDT': 'اتریوم',
  'LTC-USDT': 'لایت‌کوین',
  'XRP-USDT': 'ریپل',
  'BCH-USDT': 'بیت‌کوین کش',
  'BNB-USDT': 'بایننس کوین',
  'EOS-USDT': 'ایاس',
  'XLM-USDT': 'استلار',
  'TRX-USDT': 'ترون',
  'DOGE-USDT': 'دوج‌کوین',
  'UNI-USDT': 'یونی‌سوپ',
  'LINK-USDT': 'چین‌لینک',
  'DOT-USDT': 'پولکادات',
  'ADA-USDT': 'کاردانو',
  'SHIB-USDT': 'شیبا اینو',
  'MATIC-USDT': 'پولیگان',
  'AVAX-USDT': 'آوالانچ',
  'GMT-USDT': 'استپن',
  'CRV-USDT': 'کروی',
  'FIL-USDT': 'فایل‌کوین',
  'APE-USDT': 'اِیپی',
  'FLOKI-USDT': 'فلوکی',
  'SANTOS-USDT': 'سانتوس',
  'ENJ-USDT': 'انجین',
  'MANA-USDT': 'دکسنترالند',
  'SAND-USDT': 'ساندباکس',
  'COMP-USDT': 'کامپاوند',
  'GRT-USDT': 'گراف',
  'BAT-USDT': 'بیسیک اتنشن توکن',
  'XTZ-USDT': 'تیزوس',
  'HBAR-USDT': 'هدرا',
  'GALA-USDT': 'گالا',
  'API3-USDT': 'ای‌پی‌آی۳',
  'DYDX-USDT': 'دای‌دی‌ایکس',
  'AGIX-USDT': 'سینژولاریتی‌نت'
};

// دریافت قیمت از Exir v2
async function getCryptoPrices(pair) {
  try {
    const formattedPair = pair.toLowerCase(); // Exir expects lowercase
    const response = await axios.get(`https://api.exir.io/v2/orderbook?symbol=${formattedPair}`, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (NodeJS App)'
      }
    });

    if (!response.data || !Array.isArray(response.data.asks) || !Array.isArray(response.data.bids)) {
      throw new Error('داده دریافتی نامعتبر است');
    }

    const { asks, bids } = response.data;

    const totalBuyVolume = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
    const totalSellVolume = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);

    return {
      prices: [...asks, ...bids].map(item => parseFloat(item[0])),
      totalBuyVolume,
      totalSellVolume
    };
  } catch (error) {
    console.error('❌ خطا در دریافت قیمت:', error.message);
    if (error.response) {
      console.error('📝 وضعیت HTTP:', error.response.status);
      console.error('🔍 محتوای خطا:', error.response.data);
    }
    throw new Error('عدم اتصال به سرور قیمت‌گذاری Exir');
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume) {
  const lastPrice = prices[prices.length - 1];

  const rsi = technicalindicators.rsi({ values: prices, period: 14 }).slice(-1)[0] || 50;
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

  const ema = technicalindicators.ema({ values: prices, period: 14 }).slice(-1)[0] || 0;
  const sma = technicalindicators.sma({ values: prices, period: 14 }).slice(-1)[0] || 0;

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

// API مسیرها
app.get('/api/symbols', (req, res) => {
  res.json(CRYPTO_PAIRS);
});

app.get('/api/analyze/:pair', async (req, res) => {
  try {
    const pair = req.params.pair.toUpperCase();

    if (!CRYPTO_PAIRS[pair]) {
      return res.status(404).json({
        status: 'error',
        message: 'این جفت ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }

    const { prices, totalBuyVolume, totalSellVolume } = await getCryptoPrices(pair);
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);

    res.json({
      status: 'success',
      pair,
      name: CRYPTO_PAIRS[pair],
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
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
      lastUpdate: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// مسیر اصلی
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا روی پورت ${PORT}`);
});

module.exports = app;
