const express = require('express');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// دیتابیس با قیمت‌های به‌روز (آگوست 2024)
const SYMBOL_DB = {
  'BTC': {
    name: 'بیتکوین',
    prices: Array.from({length: 100}, (_,i) => 79000 + Math.sin(i/5)*2000) // قیمت جدید
  },
  'ETH': {
    name: 'اتریوم', 
    prices: Array.from({length: 100}, (_,i) => 4200 + Math.sin(i/5)*300) // قیمت جدید
  },
  'XAU': {
    name: 'طلا',
    prices: Array.from({length: 100}, (_,i) => 2300 + Math.sin(i/5)*100) // قیمت جدید
  }
};

// ... (بقیه کدهای سرور بدون تغییر)

app.listen(3000, () => console.log('سرور آماده در پورت 3000'));
