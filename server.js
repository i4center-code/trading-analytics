const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();

// تنظیمات اولیه
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// دیتابیس نمادها با داده‌های واقعی‌تر
const SYMBOL_DB = {
  'BTC': {
    name: 'بیتکوین',
    prices: Array.from({length: 100}, (_,i) => 76000 + Math.sin(i/3)*2000 + Math.random()*800),
    supports: [74000, 75000],
    resistances: [77000, 79000]
  },
  'ETH': {
    name: 'اتریوم',
    prices: Array.from({length: 100}, (_,i) => 3500 + Math.sin(i/4)*300 + Math.random()*150),
    supports: [3400, 3450],
    resistances: [3600, 3700]
  },
  'XAU': {
    name: 'طلا',
    prices: Array.from({length: 100}, (_,i) => 2300 + Math.sin(i/5)*100 + Math.random()*40),
    supports: [2250, 2280],
    resistances: [2320, 2350]
  }
};

// محاسبه قدرت بازار
function calculateMarketStrength(prices) {
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const upChanges = changes.filter(c => c > 0).length;
  const downChanges = changes.length - upChanges;
  
  const buyerPower = Math.max(10, Math.min(90, 
    Math.round((upChanges/changes.length) * 100)
  ));
  
  return {
    buyerPower: buyerPower,
    sellerPower: 100 - buyerPower,
    trend: upChanges > downChanges ? 'صعودی' : 'نزولی'
  };
}

// محاسبه اندیکاتورها
function calculateIndicators(prices) {
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
  
  return {
    rsi,
    macd
  };
}

// تولید سیگنال
function generateSignal(indicators, marketStrength) {
  const signals = [];
  
  // تحلیل RSI
  if (indicators.rsi < 30) {
    signals.push('RSI در منطقه اشباع فروش');
  } else if (indicators.rsi > 70) {
    signals.push('RSI در منطقه اشباع خرید');
  }
  
  // تحلیل MACD
  if (indicators.macd.MACD > indicators.macd.signal) {
    signals.push('MACD صعودی');
  } else {
    signals.push('MACD نزولی');
  }
  
  // تحلیل روند بازار
  if (marketStrength.trend === 'صعودی') {
    signals.push('روند بازار صعودی');
  } else {
    signals.push('روند بازار نزولی');
  }
  
  // تصمیم نهایی
  const buyPoints = signals.filter(s => s.includes('صعودی') || s.includes('اشباع فروش')).length;
  const sellPoints = signals.filter(s => s.includes('نزولی') || s.includes('اشباع خرید')).length;
  
  return {
    decision: buyPoints > sellPoints ? 'خرید' : 'فروش',
    confidence: Math.round((Math.abs(buyPoints - sellPoints) / signals.length) * 100),
    details: signals
  };
}

// مسیر تحلیل نماد
app.get('/api/analyze/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const asset = SYMBOL_DB[symbol];
    
    if (!asset) {
      return res.status(404).json({error: 'نماد پشتیبانی نمی‌شود'});
    }

    // محاسبه اندیکاتورها
    const indicators = calculateIndicators(asset.prices);
    const currentPrice = asset.prices[asset.prices.length - 1];

    // محاسبه قدرت بازار
    const marketStrength = calculateMarketStrength(asset.prices);
    
    // تولید سیگنال
    const signal = generateSignal(indicators, marketStrength);

    // نتیجه نهایی
    res.json({
      symbol,
      name: asset.name,
      lastPrice: currentPrice,
      trend: marketStrength.trend,
      supports: asset.supports,
      resistances: asset.resistances,
      indicators,
      signal,
      marketStrength,
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

// مسیر اصلی برای صفحه وب
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا در پورت ${PORT}`);
});

module.exports = app;
