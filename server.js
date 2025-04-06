const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const app = express();
const port = process.env.PORT || 3000; // مهم: استفاده از پورت محیطی

// دیتابیس نمادها (با قیمت‌های ثابت برای فلزات)
const SYMBOL_DB = {
  // ارزهای دیجیتال
  'BTC': {type:'crypto', name:'بیتکوین', source:'coingecko', id:'bitcoin'},
  'ETH': {type:'crypto', name:'اتریوم', source:'coingecko', id:'ethereum'},
  
  // فلزات (با قیمت‌های ثابت)
  'XAU': {type:'metal', name:'طلا', price: 2300},
  'XAG': {type:'metal', name:'نقره', price: 28},
  'XPT': {type:'metal', name:'پلاتین', price: 1000},
  
  // فارکس
  'EURUSD': {type:'forex', name:'یورو/دلار', source:'frankfurter', id:'EUR/USD'}
};

// تابع دریافت داده‌های بازار (بهینه‌شده برای Vercel)
async function getMarketData(symbol) {
  const symbolInfo = SYMBOL_DB[symbol];
  if (!symbolInfo) throw new Error('نماد پشتیبانی نمی‌شود');

  try {
    if (symbolInfo.type === 'metal') {
      // شبیه‌سازی داده تاریخی برای فلزات
      const basePrice = symbolInfo.price;
      return Array(100).fill(0).map(() => basePrice * (0.95 + Math.random() * 0.1));
    }
    
    if (symbolInfo.type === 'crypto') {
      const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${symbolInfo.id}/market_chart?vs_currency=usd&days=90`);
      return response.data.prices.map(p => p[1]);
    }
    
    if (symbolInfo.type === 'forex') {
      const response = await axios.get(`https://api.frankfurter.app/latest?from=${symbolInfo.id.split('/')[0]}&to=${symbolInfo.id.split('/')[1]}`);
      return Array(100).fill(response.data.rates[symbolInfo.id.split('/')[1]]);
    }
  } catch (error) {
    console.error('خطا در دریافت داده:', error.message);
    return null;
  }
}

// تابع تولید سیگنال
function generateSignal(indicators) {
  const signals = [];
  
  // سیگنال RSI
  if (indicators.rsi < 30) signals.push('RSI اشباع فروش (خرید)');
  else if (indicators.rsi > 70) signals.push('RSI اشباع خرید (فروش)');
  
  // سیگنال MACD
  if (indicators.macd.MACD > indicators.macd.signal) signals.push('MACD صعودی (خرید)');
  else signals.push('MACD نزولی (فروش)');
  
  // سیگنال SMA
  if (indicators.sma50 > indicators.sma200) signals.push('SMA طلایی (خرید)');
  else signals.push('SMA مرگ (فروش)');
  
  return {
    decision: signals.filter(s => s.includes('خرید')).length > 1 ? 'خرید' : 'فروش',
    confidence: Math.min(100, Math.round(Math.abs(indicators.rsi - 50) * 2)),
    details: signals
  };
}

// تحلیل تکنیکال
app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const symbolInfo = SYMBOL_DB[symbol];
    
    if (!symbolInfo) {
      return res.status(400).json({error: 'نماد پشتیبانی نمی‌شود'});
    }

    const prices = await getMarketData(symbol);
    if (!prices || prices.length < 30) {
      return res.status(500).json({error: 'داده کافی برای تحلیل وجود ندارد'});
    }

    // محاسبه اندیکاتورها
    const indicators = {
      rsi: technicalindicators.rsi({values: prices, period: 14}).slice(-1)[0],
      sma50: technicalindicators.sma({values: prices, period: 50}).slice(-1)[0],
      sma200: technicalindicators.sma({values: prices, period: 200}).slice(-1)[0],
      ema20: technicalindicators.ema({values: prices, period: 20}).slice(-1)[0],
      macd: technicalindicators.macd({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0]
    };

    // نتیجه نهایی
    res.json({
      symbol,
      name: symbolInfo.name,
      lastPrice: prices[prices.length - 1],
      trend: indicators.sma50 > indicators.sma200 ? 'صعودی' : 'نزولی',
      support: Math.min(...prices.slice(-30)),
      resistance: Math.max(...prices.slice(-30)),
      indicators,
      signal: generateSignal(indicators),
      lastUpdate: new Date(),
      notice: symbolInfo.type === 'metal' ? 'داده‌های فلزات به صورت مصنوعی تولید شده‌اند' : undefined
    });
    
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// سرویس دهی فایل‌های استاتیک
app.use(express.static('public'));

// روت پیش‌فرض
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// راه‌اندازی سرور
app.listen(port, () => {
  console.log(`سرور در حال اجرا در پورت ${port}`);
});