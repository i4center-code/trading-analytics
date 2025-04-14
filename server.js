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
  SHIB: 'شیبا اینو',
  CRV: 'شیبا اینو'
};

// تابع دریافت قیمت از API نوبیتکس
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(`https://api.nobitex.ir/v3/orderbook/${symbol}IRT`, {
      timeout: 15000 // 15 ثانیه
    });
    
    if (!response.data || response.data.status !== 'ok') {
      throw new Error('داده دریافتی نامعتبر است');
    }

    // استخراج قیمت‌ها از asks و bids
    const { asks, bids } = response.data;
    const prices = [...asks, ...bids].map(item => parseFloat(item[0])); // فقط قیمت‌ها را برمی‌گرداند

    return prices;
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices) {
  const lastPrice = prices[prices.length - 1];

  // محاسبه RSI
  const rsi = technicalindicators.rsi({
    values: prices,
    period: 14
  }).slice(-1)[0] || 50;

  // محاسبه MACD
  const macdResult = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };

  // محاسبه Stochastic
  const stochastic = technicalindicators.stochastic({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14,
    signalPeriod: 3
  }).slice(-1)[0] || { k: 50, d: 50 };

  // محاسبه EMA (Exponential Moving Average)
  const ema = technicalindicators.ema({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  // محاسبه SMA (Simple Moving Average)
  const sma = technicalindicators.sma({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  // محاسبه سطوح مقاومت و حمایت
  const resistance1 = Math.max(...prices) * 1.01; // 1% بالاتر از بیشترین قیمت
  const resistance2 = Math.max(...prices) * 1.02; // 2% بالاتر از بیشترین قیمت
  const support1 = Math.min(...prices) * 0.99; // 1% پایین‌تر از کمترین قیمت
  const support2 = Math.min(...prices) * 0.98; // 2% پایین‌تر از کمترین قیمت

  // محاسبه درصد خریدار و فروشنده
  let buyPercentage = 0;
  let sellPercentage = 0;

  if (rsi < 30 && macdResult.MACD > macdResult.signal) {
    buyPercentage += 30;
  } else if (rsi > 70 && macdResult.MACD < macdResult.signal) {
    sellPercentage += 30;
  }

  if (stochastic.k < 20 && stochastic.d < 20) {
    buyPercentage += 20;
  } else if (stochastic.k > 80 && stochastic.d > 80) {
    sellPercentage += 20;
  }

  if (lastPrice > ema) {
    buyPercentage += 25;
  } else {
    sellPercentage += 25;
  }

  if (lastPrice > sma) {
    buyPercentage += 25;
  } else {
    sellPercentage += 25;
  }

  // تنظیم درصد‌ها به 100
  const totalPercentage = buyPercentage + sellPercentage;
  buyPercentage = (buyPercentage / totalPercentage) * 100;
  sellPercentage = (sellPercentage / totalPercentage) * 100;

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
module.exports = app;
