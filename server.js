const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// دیتابیس نمونه
const SYMBOL_DB = {
  'BTC': {name: 'بیتکوین', prices: Array.from({length: 100}, (_,i) => 60000 + Math.sin(i/5)*5000)},
  'ETH': {name: 'اتریوم', prices: Array.from({length: 100}, (_,i) => 3000 + Math.sin(i/5)*300)},
  'XAU': {name: 'طلا', prices: Array.from({length: 100}, (_,i) => 1800 + Math.sin(i/5)*100)}
};

// تحلیل تکنیکال
app.get('/api/analyze/:symbol', (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const asset = SYMBOL_DB[symbol];
    
    if (!asset) {
      return res.status(400).json({error: 'نماد پشتیبانی نمی‌شود'});
    }

    const indicators = {
      rsi: technicalindicators.rsi({values: asset.prices, period: 14}).slice(-1)[0] || 50,
      macd: technicalindicators.macd({
        values: asset.prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9
      }).slice(-1)[0] || {MACD: 0, signal: 0}
    };

    // محاسبه قدرت بازار
    const changes = asset.prices.slice(1).map((p,i) => p - asset.prices[i]);
    const upDays = changes.filter(c => c > 0).length;
    const marketStrength = {
      buyerPower: Math.round((upDays/changes.length)*100),
      sellerPower: Math.round(((changes.length-upDays)/changes.length)*100)
    };

    // تولید سیگنال
    const signals = [];
    if(indicators.rsi < 30) signals.push('RSI اشباع فروش');
    if(indicators.macd.MACD > indicators.macd.signal) signals.push('MACD صعودی');
    
    const result = {
      symbol,
      name: asset.name,
      lastPrice: asset.prices[asset.prices.length - 1],
      trend: indicators.rsi > 50 ? 'صعودی' : 'نزولی',
      signal: {
        decision: signals.length ? 'خرید' : 'فروش',
        confidence: signals.length ? 80 : 40,
        details: signals.length ? signals : ['سیگنال واضحی وجود ندارد']
      },
      marketStrength,
      indicators
    };

    // تنظیم هدر برای پاسخ JSON
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(result));

  } catch (error) {
    res.status(500).json({error: 'خطای سرور'});
  }
});

// لیست نمادها
app.get('/api/symbols', (req, res) => {
  const symbols = {};
  for (const [symbol, data] of Object.entries(SYMBOL_DB)) {
    symbols[symbol] = data.name;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(symbols));
});

// Route برای صفحه اصلی
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا در پورت ${PORT}`);
});
