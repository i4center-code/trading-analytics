const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ایجاد کش با زمان انقضای 60 ثانیه
const cache = new NodeCache({ stdTTL: 60 });

// نمادهای ارز دیجیتال پشتیبانی شده
const CRYPTO_SYMBOLS = {
  BTC: 'بیت‌کوین',
  ETH: 'اتریوم',
  // ... (بقیه نمادها مانند قبل)
};

// تابع دریافت قیمت و حجم معاملات از API Exir
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(`https://api.exir.io/v1/ticker?symbol=${symbol.toLowerCase()}-irt`, {
      timeout: 15000 // 15 ثانیه
    });

    if (!response.data) {
      throw new Error('داده دریافتی نامعتبر است');
    }

    const { last, high, low, volume } = response.data;

    // در Exir ما فقط قیمت آخرین معامله را داریم، بنابراین ساختار داده را شبیه‌سازی می‌کنیم
    const lastPrice = parseFloat(last);
    const highPrice = parseFloat(high);
    const lowPrice = parseFloat(low);
    
    // شبیه‌سازی asks و bids برای حفظ سازگاری با کد موجود
    const spread = (highPrice - lowPrice) * 0.01; // 1% از محدوده قیمت
    const asks = [
      [lastPrice + spread, volume / 2],
      [lastPrice + (spread * 2), volume / 4]
    ];
    const bids = [
      [lastPrice - spread, volume / 2],
      [lastPrice - (spread * 2), volume / 4]
    ];

    return {
      prices: [highPrice, lowPrice, lastPrice],
      totalBuyVolume: volume / 2,
      totalSellVolume: volume / 2
    };
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}
