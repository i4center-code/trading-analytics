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
const CRYPTO_SYMBOLS ={
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
  const macd = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || {MACD: 0, signal: 0};

  // تشخیص سیگنال
  let signal = 'خنثی';
  if (rsi < 30 && macd.MACD > macd.signal) signal = 'خرید';
  if (rsi > 70 && macd.MACD < macd.signal) signal = 'فروش';

  return {
    lastPrice,
    rsi,
    macd,
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
