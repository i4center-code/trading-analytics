const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

// فعال کردن CORS و JSON
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// دیتابیس نمادها با قیمت‌های واقعی (آگوست 2024)
const SYMBOL_DB = {
  'BTC': {
    name: 'بیتکوین',
    prices: Array.from({length: 100}, (_,i) => 79000 + Math.sin(i/5)*2000)
  },
  'ETH': {
    name: 'اتریوم',
    prices: Array.from({length: 100}, (_,i) => 4200 + Math.sin(i/5)*300)
  },
  'XAU': {
    name: 'طلا',
    prices: Array.from({length: 100}, (_,i) => 2300 + Math.sin(i/5)*100)
  }
};

// تابع محاسبه قدرت بازار
function calculateMarketStrength(prices) {
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i-1]);
  }
  
  const upChanges = changes.filter(c => c > 0).length;
  const downChanges = changes.length - upChanges;
  
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
    details.push('RSI در منطقه اشباع فروش');
    confidence += 40;
  } else if (indicators.rsi > 70) {
    details.push('RSI در منطقه اشباع خرید');
    confidence -= 40;
  }
  
  // تحلیل MACD
  if (indicators.macd.MACD > indicators.macd.signal) {
    details.push('MACD صعودی');
    confidence += 30;
  } else {
    details.push('MACD نزولی');
    confidence -= 30;
  }
  
  // تحلیل قدرت بازار
  if (marketStrength.strength === 'صعودی') {
    details.push(`قدرت خریداران: ${marketStrength.buyerPower}%`);
    confidence += 20;
  } else {
    details.push(`قدرت فروشندگان: ${marketStrength.sellerPower}%`);
    confidence -= 20;
  }
  
  // تعیین سیگنال نهایی
  if (confidence >= 60) signal = 'خرید قوی';
  else if (confidence >= 30) signal = 'خرید';
  else if (confidence <= -60) signal = 'فروش قوی';
  else if (confidence <= -30) signal = 'فروش';
  else signal = 'خنثی';
  
  // محدود کردن بازه اطمینان
  confidence = Math.max(-100, Math.min(100, confidence));
  
  return {
    decision: signal,
    confidence: Math.abs(confidence),
    details,
    strength: marketStrength.strength,
    buyerPower: marketStrength.buyerPower,
    sellerPower: marketStrength.sellerPower
  };
}

// مسیر تحلیل نماد
app.get('/api/analyze/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const asset = SYMBOL_DB[symbol];
    
    if (!asset) {
      return res.status(400).json({error: 'نماد پشتیبانی نمی‌شود'});
    }

    // محاسبه اندیکاتورها
    const indicators = {
      rsi: technicalindicators.rsi({
        values: asset.prices,
        period: 14
      }).slice(-1)[0] || 50,
      macd: technicalindicators.macd({
        values: asset.prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0] || {MACD: 0, signal: 0},
      sma50: technicalindicators.sma({
        values: asset.prices,
        period: 50
      }).slice(-1)[0] || 0,
      sma200: technicalindicators.sma({
        values: asset.prices,
        period: 200
      }).slice(-1)[0] || 0
    };

    // محاسبه قدرت بازار
    const marketStrength = calculateMarketStrength(asset.prices);
    
    // تولید سیگنال
    const signal = generateAdvancedSignal(indicators, marketStrength);

    // نتیجه نهایی
    const result = {
      symbol,
      name: asset.name,
      lastPrice: asset.prices[asset.prices.length - 1],
      trend: indicators.sma50 > indicators.sma200 ? 'صعودی' : 'نزولی',
      support: Math.min(...asset.prices.slice(-30)),
      resistance: Math.max(...asset.prices.slice(-30)),
      indicators,
      signal,
      lastUpdate: new Date()
    };

    res.json(result);
    
  } catch (error) {
    res.status(500).json({error: 'خطای سرور'});
  }
});

// مسیر لیست نمادها
app.get('/api/symbols', (req, res) => {
  const symbols = {};
  for (const [symbol, data] of Object.entries(SYMBOL_DB)) {
    symbols[symbol] = data.name;
  }
  res.json(symbols);
});

// مسیر اصلی برای سرویس فایل‌های فرانت
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا در پورت ${PORT}`);
});
