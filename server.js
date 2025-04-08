const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// اطلاعات نمادها
const SYMBOLS = {
  BTC: { name: 'بیتکوین', type: 'crypto' },
  ETH: { name: 'اتریوم', type: 'crypto' },
  BNB: { name: 'بایننس کوین', type: 'crypto' },
  XRP: { name: 'ریپل', type: 'crypto' },
  EURUSD: { name: 'یورو/دلار', type: 'forex' },
  GBPUSD: { name: 'پوند/دلار', type: 'forex' },
  USDJPY: { name: 'دلار/ین ژاپن', type: 'forex' },
  XAU: { name: 'طلا', type: 'metal' },
  XAG: { name: 'نقره', type: 'metal' }
};

// تابع برای دریافت داده از API
async function fetchFromAPI(symbol) {
  try {
    // اینجا می‌توانید آدرس API واقعی ایران افیکس را قرار دهید
    const response = await axios.get(`https://api.iranfx.com/prices/${symbol}`, {
      timeout: 5000 // 5 ثانیه timeout
    });
    
    if (!response.data || !response.data.prices) {
      throw new Error('داده دریافتی نامعتبر است');
    }
    
    return response.data.prices;
  } catch (error) {
    console.error('خطا در اتصال به API:', error.message);
    throw new Error('عدم اتصال به سرور ایران افیکس');
  }
}

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(SYMBOLS);
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    if (!SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'نماد پشتیبانی نمی‌شود'
      });
    }

    // دریافت داده از API
    const prices = await fetchFromAPI(symbol);
    
    // محاسبه تحلیل تکنیکال
    const lastPrice = prices[prices.length - 1];
    const rsi = technicalindicators.rsi({
      values: prices,
      period: 14
    }).slice(-1)[0] || 50;
    
    const macd = technicalindicators.macd({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    }).slice(-1)[0] || {MACD: 0, signal: 0};
    
    // نتیجه نهایی
    res.json({
      status: 'success',
      symbol,
      name: SYMBOLS[symbol].name,
      lastPrice,
      indicators: { rsi, macd },
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
  console.log(`سرور در حال اجرا در پورت ${PORT}`);
});
