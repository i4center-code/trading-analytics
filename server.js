const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// نمادهای ارز دیجیتال پشتیبانی شده
const CRYPTO_SYMBOLS = {
  BTC: 'بیتکوین',
  ETH: 'اتریوم',
  BNB: 'بایننس کوین',
  SOL: 'سولانا',
  XRP: 'ریپل',
  ADA: 'کاردانو',
  DOGE: 'دوج کوین',
  DOT: 'پولکادات',
  SHIB: 'شیبا اینو'
};

// تابع دریافت قیمت از API CoinGecko
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=30`,
      { timeout: 15000 } // 15 ثانیه
    );

    if (!response.data || !response.data.prices) {
      throw new Error('داده دریافتی نامعتبر است');
    }

    return response.data.prices.map(item => item[1]); // فقط قیمت‌ها را برمی‌گرداند
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices) {
  const lastPrice = prices[prices.length - 1];

  // محاسبه اندیکاتورها
  const rsi = technicalindicators.rsi({ values: prices, period: 14 }).slice(-1)[0] || 50;
  const macdResult = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };
  const sma = technicalindicators.sma({ period: 20, values: prices }).slice(-1)[0] || 0;
  const ema = technicalindicators.ema({ period: 20, values: prices }).slice(-1)[0] || 0;
  const bollingerBands = technicalindicators.bollingerbands({
    period: 20,
    values: prices,
    stdDev: 2
  }).slice(-1)[0] || { lower: 0, middle: 0, upper: 0 };
  const stochastic = technicalindicators.stochastic({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14
  }).slice(-1)[0] || { k: 0, d: 0 };
  const adx = technicalindicators.adx({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14
  }).slice(-1)[0] || 0;
  const atr = technicalindicators.atr({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14
  }).slice(-1)[0] || 0;

  // تشخیص سیگنال
  let signal = 'خنثی';
  if (rsi < 30 && macdResult.MACD > macdResult.signal) signal = 'خرید';
  if (rsi > 70 && macdResult.MACD < macdResult.signal) signal = 'فروش';

  return {
    lastPrice,
    rsi,
    macd: macdResult,
    sma,
    ema,
    bollingerBands,
    stochastic,
    adx,
    atr,
    signal,
    trend: lastPrice > prices[prices.length - 2] ? 'صعودی' : 'نزولی'
  };
}

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(CRYPTO_SYMBOLS);
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }

    const prices = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices);

    res.json({
      status: 'success',
      symbol,
      name: CRYPTO_SYMBOLS[symbol],
      ...analysis,
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
module.exports = app;
