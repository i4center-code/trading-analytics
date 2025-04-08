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

// دریافت قیمت‌های واقعی (نسخه ساده شده)
async function getRealPrices(symbol) {
  try {
    // اینجا می‌توانید از API واقعی استفاده کنید
    // برای شروع از داده‌های نمونه استفاده می‌کنیم
    const sampleData = {
      BTC: [70000, 71000, 70500, 72000, 71500, 73000],
      ETH: [3500, 3550, 3530, 3600, 3580, 3650],
      BNB: [550, 560, 555, 570, 565, 580],
      XRP: [0.5, 0.51, 0.52, 0.53, 0.52, 0.54],
      EURUSD: [1.07, 1.08, 1.075, 1.08, 1.085, 1.09],
      GBPUSD: [1.25, 1.26, 1.255, 1.26, 1.265, 1.27],
      USDJPY: [150, 151, 150.5, 151.5, 152, 152.5],
      XAU: [2300, 2310, 2320, 2330, 2340, 2350],
      XAG: [26, 26.5, 27, 27.5, 28, 28.5]
    };
    
    return sampleData[symbol] || [100, 105, 102, 108, 110];
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error);
    throw error;
  }
}

// محاسبه تحلیل تکنیکال
function calculateAnalysis(prices) {
  const lastPrice = prices[prices.length - 1];
  
  // محاسبه سطوح حمایت/مقاومت ساده
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return {
    lastPrice,
    supports: [
      min + (lastPrice - min) * 0.3,
      min + (lastPrice - min) * 0.15
    ],
    resistances: [
      lastPrice + (max - lastPrice) * 0.15,
      lastPrice + (max - lastPrice) * 0.3
    ],
    indicators: {
      rsi: technicalindicators.rsi({values: prices, period: 14}).slice(-1)[0] || 50,
      macd: technicalindicators.macd({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0] || {MACD: 0, signal: 0}
    }
  };
}

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(SYMBOLS);
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    
    if (!SYMBOLS[symbol]) {
      return res.status(404).json({error: 'نماد پشتیبانی نمی‌شود'});
    }

    const prices = await getRealPrices(symbol);
    const analysis = calculateAnalysis(prices);
    
    res.json({
      symbol,
      name: SYMBOLS[symbol].name,
      ...analysis,
      lastUpdate: new Date()
    });
    
  } catch (error) {
    res.status(500).json({error: 'خطا در تحلیل نماد'});
  }
});

// مسیر اصلی
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور آماده دریافت درخواست در پورت ${PORT}`);
});

module.exports = app;
