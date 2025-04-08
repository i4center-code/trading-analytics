const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// دیتابیس پیشرفته با داده‌های واقعی‌تر
const SYMBOL_DB = {
  'BTC': {
    name: 'بیتکوین',
    prices: Array.from({length: 100}, (_,i) => 79000 + Math.sin(i/3)*3000 + Math.random()*1000),
    supports: [75000, 77000],
    resistances: [80000, 82000]
  },
  'ETH': {
    name: 'اتریوم',
    prices: Array.from({length: 100}, (_,i) => 4200 + Math.sin(i/4)*400 + Math.random()*200),
    supports: [4000, 4100],
    resistances: [4300, 4400]
  },
  'XAU': {
    name: 'طلا',
    prices: Array.from({length: 100}, (_,i) => 2300 + Math.sin(i/5)*150 + Math.random()*50),
    supports: [2250, 2270],
    resistances: [2330, 2350]
  }
};

// تابع محاسبه قدرت بازار (با تغییرات تصادفی)
function calculateMarketStrength(prices) {
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const upChanges = changes.filter(c => c > 0).length;
  const downChanges = changes.length - upChanges;
  
  // اضافه کردن تغییرات تصادفی برای واقعی‌تر شدن
  const randomFactor = Math.random() * 0.2 - 0.1; // بین -10% تا +10%
  
  return {
    buyerPower: Math.round((upChanges/changes.length) * 100 * (1 + randomFactor)),
    sellerPower: Math.round((downChanges/changes.length) * 100 * (1 - randomFactor)),
    trend: upChanges > downChanges ? 'صعودی' : 'نزولی'
  };
}

// بقیه توابع بدون تغییر ...
