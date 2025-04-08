const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const SYMBOL_DB = {
  'BTC': {name:'بیتکوین', prices: Array.from({length: 100}, (_,i) => 60000 + Math.sin(i/5)*5000)},
  'ETH': {name:'اتریوم', prices: Array.from({length: 100}, (_,i) => 3000 + Math.sin(i/5)*300)},
  'XAU': {name:'طلا', prices: Array.from({length: 100}, (_,i) => 1800 + Math.sin(i/5)*100)}
};

function calculateMarketStrength(prices) {
  const changes = prices.slice(1).map((p,i) => p - prices[i]);
  const up = changes.filter(c => c > 0).length;
  return {
    buyerPower: Math.round((up/changes.length)*100),
    sellerPower: Math.round(((changes.length-up)/changes.length)*100)
  };
}

function generateSignal(indicators) {
  const signals = [];
  if(indicators.rsi < 30) signals.push('اشباع فروش (خرید)');
  if(indicators.macd.MACD > indicators.macd.signal) signals.push('MACD صعودی');
  return {
    decision: signals.length ? 'خرید' : 'فروش',
    confidence: signals.length ? 80 : 40,
    details: signals.length ? signals : ['سیگنال خاصی یافت نشد']
  };
}

app.get('/api/analyze/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const asset = SYMBOL_DB[symbol];
  
  if(!asset) return res.status(400).json({error: 'نماد نامعتبر'});

  const indicators = {
    rsi: technicalindicators.rsi({values: asset.prices, period: 14}).slice(-1)[0],
    macd: technicalindicators.macd({
      values: asset.prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    }).slice(-1)[0]
  };

  res.json({
    symbol,
    name: asset.name,
    lastPrice: asset.prices.slice(-1)[0],
    signal: generateSignal(indicators),
    strength: calculateMarketStrength(asset.prices),
    indicators
  });
});

app.get('/api/symbols', (req, res) => {
  res.json(Object.keys(SYMBOL_DB).reduce((acc, sym) => {
    acc[sym] = SYMBOL_DB[sym].name;
    return acc;
  }, {});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`سرور آماده در پورت ${PORT}`));
