const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تنظیمات API
const API_CONFIG = {
  CRYPTO: {
    BASE_URL: 'https://api.coingecko.com/api/v3',
    SYMBOLS: {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      BNB: 'binancecoin',
      XRP: 'ripple'
    }
  },
  FOREX: {
    BASE_URL: 'https://api.exchangerate-api.com/v4',
    SYMBOLS: {
      EURUSD: 'EUR/USD',
      GBPUSD: 'GBP/USD',
      USDJPY: 'USD/JPY'
    }
  },
  METALS: {
    BASE_URL: 'https://metals-api.com/api',
    SYMBOLS: {
      XAU: 'XAU/USD',
      XAG: 'XAG/USD'
    }
  }
};

// دریافت قیمت‌های واقعی از API
async function getRealTimePrices(symbol) {
  try {
    let response;
    
    // تشخیص نوع نماد (ارز دیجیتال، فارکس یا فلزات)
    if (API_CONFIG.CRYPTO.SYMBOLS[symbol]) {
      const coinId = API_CONFIG.CRYPTO.SYMBOLS[symbol];
      response = await axios.get(`${API_CONFIG.CRYPTO.BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=30`);
      return response.data.prices.map(p => p[1]); // آرایه قیمت‌ها
    }
    else if (API_CONFIG.FOREX.SYMBOLS[symbol]) {
      const pair = API_CONFIG.FOREX.SYMBOLS[symbol];
      response = await axios.get(`${API_CONFIG.FOREX.BASE_URL}/latest/${pair}`);
      return Array(100).fill(response.data.rate); // شبیه‌سازی داده تاریخی
    }
    else if (API_CONFIG.METALS.SYMBOLS[symbol]) {
      const metal = API_CONFIG.METALS.SYMBOLS[symbol];
      response = await axios.get(`${API_CONFIG.METALS.BASE_URL}/latest?access_key=YOUR_API_KEY&base=${metal.split('/')[0]}&symbols=USD`);
      return Array(100).fill(response.data.rates.USD);
    }
    
    throw new Error('نماد پشتیبانی نمی‌شود');
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error);
    throw error;
  }
}

// محاسبه سطوح حمایت و مقاومت
function calculateSupportResistance(prices) {
  const sorted = [...prices].sort((a,b) => a - b);
  return {
    supports: [
      sorted[Math.floor(sorted.length * 0.15)], // حمایت اول (15% پایین)
      sorted[Math.floor(sorted.length * 0.3)]   // حمایت دوم (30% پایین)
    ],
    resistances: [
      sorted[Math.floor(sorted.length * 0.7)],  // مقاومت اول (70% بالا)
      sorted[Math.floor(sorted.length * 0.85)]  // مقاومت دوم (85% بالا)
    ]
  };
}

// مسیر تحلیل نماد
app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    // دریافت قیمت‌های واقعی
    const prices = await getRealTimePrices(symbol);
    const lastPrice = prices[prices.length - 1];
    
    // محاسبه سطوح
    const {supports, resistances} = calculateSupportResistance(prices);
    
    // محاسبه اندیکاتورها
    const indicators = {
      rsi: technicalindicators.rsi({values: prices, period: 14}).slice(-1)[0] || 50,
      macd: technicalindicators.macd({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0] || {MACD: 0, signal: 0}
    };

    // نتیجه نهایی
    res.json({
      symbol,
      name: getName(symbol),
      lastPrice,
      supports,
      resistances,
      indicators,
      lastUpdate: new Date()
    });
    
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

function getName(symbol) {
  const names = {
    BTC: 'بیتکوین', ETH: 'اتریوم', BNB: 'بایننس کوین', XRP: 'ریپل',
    EURUSD: 'یورو/دلار', GBPUSD: 'پوند/دلار', USDJPY: 'دلار/ین ژاپن',
    XAU: 'طلا', XAG: 'نقره'
  };
  return names[symbol] || symbol;
}

// بقیه کدها...
