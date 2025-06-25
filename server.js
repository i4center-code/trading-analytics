const express = require('express');
const axios = require('axios');
const technicalindicators = require('technicalindicators');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// نمادهای ارز دیجیتال پشتیبانی شده
const CRYPTO_SYMBOLS = {
  BTC: 'بیت‌کوین',
  ETH: 'اتریوم',
  LTC: 'لایت‌کوین',
  USDT: 'تتر',
  XRP: 'ریپل',
  BCH: 'بیت‌کوین کش',
  BNB: 'بایننس کوین',
  EOS: 'ایاس',
  XLM: 'استلار',
  ETC: 'اتریوم کلاسیک',
  TRX: 'ترون',
  DOGE: 'دوج‌کوین',
  UNI: 'یونی‌سوپ',
  DAI: 'دای',
  LINK: 'چین‌لینک',
  DOT: 'پولکادات',
  AAVE: 'آوی',
  ADA: 'کاردانو',
  SHIB: 'شیبا اینو',
  FTM: 'فانتوم',
  MATIC: 'پولیگان',
  AXS: 'اکسی اینفینیتی',
  MANA: 'دکسنترالند',
  SAND: 'ساندباکس',
  AVAX: 'آوالانچ',
  MKR: 'میکر',
  GMT: 'استپن',
  USDC: 'یو اس دی کوین',
  CHZ: 'چیلیز',
  GRT: 'گراف',
  sui: 'اس یو آی',
  CRV: 'کروی',
  BAND: 'باند پروتکل',
  COMP: 'کامپاوند',
  EGLD: 'الروندو',
  HBAR: 'هدرا',
  GAL: 'گالا',
  WBTC: 'رابط بیت‌کوین',
  IMX: 'ایمجیکس',
  ONE: 'هارمونی',
  GLM: 'گلم',
  ENS: 'اورث‌نیم سرویس',
  BTT: 'بیت‌تورنت',
  SUSHI: 'سوشی‌سوپ',
  LDO: 'لداین',
  ATOM: 'کوزموس',
  ZRO: 'زرو',
  STORJ: 'استورج',
  ANT: 'ارگون',
  AEVO: 'ایو',
  FLOKI: 'فلوکی',
  RSR: 'رزرو رایتس',
  API3: 'ای‌پی‌آی۳',
  XMR: 'مونرو',
  OM: 'منی',
  RDNT: 'رادینت',
  MAGIC: 'مجیک',
  T: 'ٹ',
  NOT: 'نات‌کوین',
  CVX: 'کانوکس',
  XTZ: 'تیزوس',
  FIL: 'فایل‌کوین',
  UMA: 'اوما',
  BABYDOGE: 'بیبی دوج',
  SSV: 'اس‌اس‌وی',
  DAO: 'داو',
  BLUR: 'بلور',
  EGALA: 'ای‌گالا',
  GMX: 'جی‌ام‌ایکس',
  FLOW: 'فلو',
  W: 'راب',
  CVC: 'سیویک',
  NMR: 'نومیرای',
  SKL: 'سیکل',
  SNT: 'استاتیک',
  BAT: 'بیسیک اتنشن توکن',
  TRB: 'تلرب',
  INCH: 'وان‌اینچ',
  WOO: 'ووکوین',
  MASK: 'ماسک‌نیتورک',
  PEPEUSDT: 'پپ',
  APT: 'اپته',
  TON: 'تون',
  JST: 'جاست',
  NEAR: 'نیر',
  MDT: 'مدیتورم',
  LRC: 'لوپرینگ',
  LPT: 'لیوپر',
  BICO: 'بیکو',
  AGLD: 'آغازگلد',
  ALGO: 'الگورند',
  ENJ: 'انجین',
  OMG: 'اوه‌ام‌جی',
  DYDX: 'دای‌دی‌ایکس',
  AGIX: 'سینژولاریتی‌نت',
  MEME: 'مم',
  BAL: 'بالانسر',
  SNX: 'سینتتیکس'
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
