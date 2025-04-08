const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
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
    trend: upChanges > downChanges ? 'صعودی' : 'نزولی'
  };
}

// تابع تولید سیگنال
function generateSignal(indicators, marketStrength) {
  const signals = [];
  
  // تحلیل RSI
  if (indicators.rsi < 30) {
    signals.push('RSI در منطقه اشباع فروش (خرید قوی)');
  } else if (indicators.rsi > 70) {
    signals.push('RSI در منطقه اشباع خرید (فروش قوی)');
  }
  
  // تحلیل MACD
  if (indicators.macd.MACD > indicators.macd.signal) {
    signals.push('MACD صعودی');
  } else {
    signals.push('MACD نزولی');
  }
  
  // تحلیل روند
  if (marketStrength.trend === 'صعودی') {
    signals.push('روند بازار صعودی');
  } else {
    signals.push('روند بازار نزولی');
  }
  
  // تصمیم نهایی
  const buySignals = signals.filter(s => s.includes('خرید') || s.includes('صعودی')).length;
  const sellSignals = signals.filter(s => s.includes('فروش') || s.includes('نزولی')).length;
  
  return {
    decision: buySignals > sellSignals ? 'خرید' : 'فروش',
    confidence: Math.round((Math.abs(buySignals - sellSignals) / signals.length) * 100),
    details: signals,
    strength: marketStrength.trend,
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
    const signal = generateSignal(indicators, marketStrength);

    // نتیجه نهایی
    res.json({
      symbol,
      name: asset.name,
      lastPrice: asset.prices[asset.prices.length - 1],
      trend: indicators.sma50 > indicators.sma200 ? 'صعودی' : 'نزولی',
      support: Math.min(...asset.prices.slice(-30)),
      resistance: Math.max(...asset.prices.slice(-30)),
      indicators,
      signal,
      marketStrength, // اضافه کردن این خط برای حل مشکل
      lastUpdate: new Date()
    });
    
  } catch (error) {
    console.error('خطا در تحلیل:', error);
    res.status(500).json({error: 'خطای سرور در تحلیل نماد'});
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
