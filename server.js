const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// دیتابیس نمادها
const SYMBOL_DB = {
  'BTC': {type:'crypto', name:'بیتکوین', source:'coingecko', id:'bitcoin'},
  'ETH': {type:'crypto', name:'اتریوم', source:'coingecko', id:'ethereum'},
  'BNB': {type:'crypto', name:'بایننس کوین', source:'coingecko', id:'binancecoin'},
  'XRP': {type:'crypto', name:'ریپل', source:'coingecko', id:'ripple'},
  'XAU': {type:'metal', name:'طلا', source:'goldapi', id:'XAU'},
  'XAG': {type:'metal', name:'نقره', source:'goldapi', id:'XAG'},
  'EURUSD': {type:'forex', name:'یورو/دلار', source:'frankfurter', id:'EUR'},
  'GBPUSD': {type:'forex', name:'پوند/دلار', source:'frankfurter', id:'GBP'},
  'USDJPY': {type:'forex', name:'دلار/ین', source:'frankfurter', id:'USD'}
};

// تابع دریافت داده‌های بازار
async function getMarketData(symbol) {
  const symbolInfo = SYMBOL_DB[symbol];
  if (!symbolInfo) throw new Error('نماد پشتیبانی نمی‌شود');

  try {
    // داده‌های نمونه با قیمت‌های به‌روز
    const samplePrices = {
      'BTC': 80000,
      'ETH': 4000,
      'BNB': 600,
      'XRP': 0.5,
      'XAU': 2300,
      'XAG': 27,
      'EURUSD': 1.07,
      'GBPUSD': 1.25,
      'USDJPY': 150
    };
    
    const basePrice = samplePrices[symbol] || 100;
    return Array.from({length: 100}, (_, i) => basePrice + Math.sin(i/10) * (basePrice * 0.05));
  } catch (error) {
    console.error('خطا در دریافت داده:', error.message);
    return null;
  }
}

// تابع محاسبه قدرت بازار
function calculateMarketStrength(prices) {
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i-1]);
  }
  
  const upChanges = changes.filter(c => c > 0).length;
  const downChanges = changes.filter(c => c < 0).length;
  
  return {
    buyerPower: Math.round((upChanges / changes.length) * 100),
    sellerPower: Math.round((downChanges / changes.length) * 100),
    strength: upChanges > downChanges ? 'صعودی' : 'نزولی'
  };
}

// تابع تولید سیگنال پیشرفته
function generateAdvancedSignal(indicators, marketStrength) {
  let signal = '';
  let confidence = 0;
  let details = [];
  
  // تحلیل RSI
  if (indicators.rsi < 30) {
    signal = 'خرید قوی';
    confidence += 40;
    details.push('RSI در منطقه اشباع فروش');
  } else if (indicators.rsi > 70) {
    signal = 'فروش قوی';
    confidence += 40;
    details.push('RSI در منطقه اشباع خرید');
  }
  
  // تحلیل MACD
  if (indicators.macd.MACD > indicators.macd.signal) {
    signal = signal || 'خرید';
    confidence += 30;
    details.push('MACD صعودی');
  } else {
    signal = signal || 'فروش';
    confidence += 30;
    details.push('MACD نزولی');
  }
  
  // تحلیل قدرت بازار
  if (marketStrength.strength === 'صعودی') {
    confidence += 20;
    details.push(`قدرت خریداران: ${marketStrength.buyerPower}%`);
  } else {
    confidence -= 20;
    details.push(`قدرت فروشندگان: ${marketStrength.sellerPower}%`);
  }
  
  // محدود کردن اطمینان بین 0 تا 100
  confidence = Math.max(0, Math.min(100, confidence));
  
  return {
    decision: signal,
    confidence: Math.round(confidence),
    details,
    strength: marketStrength.strength,
    buyerPower: marketStrength.buyerPower,
    sellerPower: marketStrength.sellerPower
  };
}

// تحلیل تکنیکال پیشرفته
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
      rsi: technicalindicators.rsi({values: prices, period: 14}).slice(-1)[0] || 50,
      sma50: technicalindicators.sma({values: prices, period: 50}).slice(-1)[0] || 0,
      sma200: technicalindicators.sma({values: prices, period: 200}).slice(-1)[0] || 0,
      ema20: technicalindicators.ema({values: prices, period: 20}).slice(-1)[0] || 0,
      macd: technicalindicators.macd({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0] || {MACD: 0, signal: 0}
    };

    // محاسبه قدرت بازار
    const marketStrength = calculateMarketStrength(prices);
    
    // تولید سیگنال
    const signal = generateAdvancedSignal(indicators, marketStrength);

    // نتیجه نهایی
    res.json({
      symbol,
      name: symbolInfo.name,
      lastPrice: prices[prices.length - 1] || 0,
      trend: indicators.ema20 > indicators.sma200 ? 'صعودی' : 'نزولی',
      support: Math.min(...prices.slice(-30)) || 0,
      resistance: Math.max(...prices.slice(-30)) || 0,
      indicators,
      signal,
      marketStrength,
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

// اجرای سرور
if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('سرور محلی در حال اجرا در http://localhost:3000'));
}

module.exports = app;
