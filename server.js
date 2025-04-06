const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// دیتابیس نمادها
const SYMBOL_DB = {
  // ارزهای دیجیتال
  'BTC': {type:'crypto', name:'بیتکوین', source:'coingecko', id:'bitcoin'},
  'ETH': {type:'crypto', name:'اتریوم', source:'coingecko', id:'ethereum'},
  'BNB': {type:'crypto', name:'بایننس کوین', source:'coingecko', id:'binancecoin'},
  'XRP': {type:'crypto', name:'ریپل', source:'coingecko', id:'ripple'},
  
  // فلزات
  'XAU': {type:'metal', name:'طلا', source:'metals-api', id:'XAU'},
  'XAG': {type:'metal', name:'نقره', source:'metals-api', id:'XAG'},
  
  // جفت ارزهای فارکس
  'EURUSD': {type:'forex', name:'یورو/دلار', source:'frankfurter', id:'EUR/USD'},
  'GBPUSD': {type:'forex', name:'پوند/دلار', source:'frankfurter', id:'GBP/USD'},
  'USDJPY': {type:'forex', name:'دلار/ین', source:'frankfurter', id:'USD/JPY'}
};

// تابع دریافت داده‌های بازار
async function getMarketData(symbol) {
  const symbolInfo = SYMBOL_DB[symbol];
  if (!symbolInfo) throw new Error('نماد پشتیبانی نمی‌شود');

  // داده‌های نمونه (برای تست)
  const sampleData = {
    'BTC': Array.from({length: 100}, (_, i) => 50000 + Math.sin(i/10)*2000),
    'ETH': Array.from({length: 100}, (_, i) => 3000 + Math.sin(i/10)*200),
    'XAU': Array.from({length: 100}, (_, i) => 1800 + Math.sin(i/10)*50),
    'EURUSD': Array.from({length: 100}, (_, i) => 1.08 + Math.sin(i/10)*0.02)
  };

  return sampleData[symbol] || sampleData['BTC'];
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
  
  // جمع‌بندی سیگنال‌ها
  const buySignals = signals.filter(s => s.includes('خرید')).length;
  const sellSignals = signals.filter(s => s.includes('فروش')).length;
  
  return {
    decision: buySignals > sellSignals ? 'خرید' : 'فروش',
    confidence: Math.abs(buySignals - sellSignals) / signals.length * 100,
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
      trend: indicators.ema20 > indicators.sma200 ? 'صعودی' : 'نزولی',
      support: Math.min(...prices.slice(-30)),
      resistance: Math.max(...prices.slice(-30)),
      indicators,
      signal: generateSignal(indicators),
      lastUpdate: new Date()
    });
    
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// لیست نمادهای پشتیبانی شده
app.get('/api/symbols', (req, res) => {
  const symbols = {};
  for (const [key, value] of Object.entries(SYMBOL_DB)) {
    symbols[key] = value.name;
  }
  res.json(symbols);
});

// برای اجرای محلی
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('سرور محلی در حال اجرا در http://localhost:3000'));
}

module.exports = app;
