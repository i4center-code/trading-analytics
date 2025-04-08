const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Keyها (در فایل .env قرار می‌گیرند)
const API_KEYS = {
  COINGECKO: process.env.COINGECKO_API_KEY,
  ALPHAVANTAGE: process.env.ALPHAVANTAGE_API_KEY
};

// نمادهای پشتیبانی شده
const SYMBOLS = {
  BTC: { name: 'بیتکوین', type: 'crypto' },
  ETH: { name: 'اتریوم', type: 'crypto' },
  BNB: { name: 'بایننس کوین', type: 'crypto' },
  XRP: { name: 'ریپل', type: 'crypto' },
  EURUSD: { name: 'یورو/دلار', type: 'forex' },
  GBPUSD: { name: 'پوند/دلار', type: 'forex' },
  USDJPY: { name: 'دلار/ین ژاپن', type: 'forex' },
  XAU: { name: 'طلا', type: 'commodity' },
  XAG: { name: 'نقره', type: 'commodity' }
};

// دریافت قیمت‌های واقعی از API
async function getRealTimeData(symbol) {
  try {
    let response;
    const symbolData = SYMBOLS[symbol];
    
    if (!symbolData) {
      throw new Error('نماد پشتیبانی نمی‌شود');
    }

    // ارزهای دیجیتال
    if (symbolData.type === 'crypto') {
      response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=30&x_cg_demo_api_key=${API_KEYS.COINGECKO}`
      );
      return response.data.prices.map(p => p[1]);
    }
    // فارکس و فلزات
    else {
      response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEYS.ALPHAVANTAGE}`
      );
      
      const timeSeries = response.data['Time Series (Daily)'];
      return Object.values(timeSeries).map(entry => parseFloat(entry['4. close'])).slice(0, 30);
    }
  } catch (error) {
    console.error('خطا در دریافت داده:', error);
    throw error;
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

  // محاسبه سطوح حمایت/مقاومت
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const supports = [
    sortedPrices[Math.floor(sortedPrices.length * 0.15)],
    sortedPrices[Math.floor(sortedPrices.length * 0.3)]
  ];
  const resistances = [
    sortedPrices[Math.floor(sortedPrices.length * 0.7)],
    sortedPrices[Math.floor(sortedPrices.length * 0.85)]
  ];

  return {
    lastPrice,
    supports,
    resistances,
    indicators: { rsi, macd },
    trend: rsi > 50 ? 'صعودی' : 'نزولی'
  };
}

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(SYMBOLS);
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    // دریافت داده‌های واقعی
    const prices = await getRealTimeData(symbol);
    
    // محاسبه تحلیل تکنیکال
    const analysis = calculateTechnicalAnalysis(prices);
    
    // نتیجه نهایی
    res.json({
      symbol,
      name: SYMBOLS[symbol].name,
      ...analysis,
      lastUpdate: new Date()
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'خطا در تحلیل نماد',
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
  console.log(`سرور در حال اجرا در پورت ${PORT}`);
});

module.exports = app;
