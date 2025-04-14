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
  BTCIRT: 'بیتکوین',
  ETHIRT: 'اتریوم',
  LTCIRT: 'لایت‌کوین',
  USDTIRT: 'تتر',
  XRPIRT: 'ریپل',
  BCHIRT: 'بیت‌کوین کش',
  BNBIRT: 'بایننس کوین',
  EOSIRT: 'ایاس',
  XLMIRT: 'استلار',
  ETCIRT: 'اتریوم کلاسیک',
  TRXIRT: 'ترون',
  DOGEIRT: 'دوج کوین',
  UNIIRT: 'یونی‌سوپ',
  DAIIRT: 'داي',
  LINKIRT: 'چین‌لینک',
  DOTIRT: 'پولکادات',
  AAVEIRT: 'آوی',
  ADAIRT: 'کاردانو',
  SHIBIRT: 'شیبا اینو',
  FTMIRT: 'فانتوم',
  MATICIRT: 'پولی‌گان',
  AXSIRT: 'اکسی اینفینیتی',
  MANAIRT: 'دیسنترالند',
  SANDIRT: 'ساندباکس',
  AVAXIRT: 'آوالانچ',
  MKRIRT: 'میکر',
  GMTIRT: 'استپن',
  USDCIRT: 'یواس‌دی‌سی',
  BTCUSDT: 'بیتکوین/تتر',
  ETHUSDT: 'اتریوم/تتر',
  LTCUSDT: 'لایت‌کوین/تتر',
  XRPUSDT: 'ریپل/تتر',
  BCHUSDT: 'بیت‌کوین کش/تتر',
  BNBUSDT: 'بایننس کوین/تتر',
  EOSUSDT: 'ایاس/تتر',
  XLMUSDT: 'استلار/تتر',
  ETCUSDT: 'اتریوم کلاسیک/تتر',
  TRXUSDT: 'ترون/تتر',
  PMNUSDT: 'پرومین/تتر',
  DOGEUSDT: 'دوج کوین/تتر',
  UNIUSDT: 'یونی‌سوپ/تتر',
  DAIUSDT: 'داي/تتر',
  LINKUSDT: 'چین‌لینک/تتر',
  DOTUSDT: 'پولکادات/تتر',
  AAVEUSDT: 'آوی/تتر',
  ADAUSDT: 'کاردانو/تتر',
  SHIBUSDT: 'شیبا اینو/تتر',
  FTMUSDT: 'فانتوم/تتر',
  MATICUSDT: 'پولی‌گان/تتر',
  AXSUSDT: 'اکسی اینفینیتی/تتر',
  MANAUSDT: 'دیسنترالند/تتر',
  SANDUSDT: 'ساندباکس/تتر',
  AVAXUSDT: 'آوالانچ/تتر',
  MKRUSDT: 'میکر/تتر',
  GMTUSDT: 'استپن/تتر',
  USDCUSDT: 'یواس‌دی‌سی/تتر',
  CHZIRT: 'چیلیز',
  GRTIRT: 'گراف',
  CRVIRT: 'کریو',
  BANDUSDT: 'بند پروتکل/تتر',
  COMPUSDT: 'کامپاوند/تتر',
  EGLDIRT: 'الگورند',
  HBARUSDT: 'هدر با/تتر',
  GALIRT: 'گالاکسی',
  HBARIRT: 'هدر با',
  WBTCUSDT: 'راب‌بتکس/تتر',
  IMXIRT: 'ایمرسیف',
  WBTCIRT: 'راب‌بتکس',
  ONEIRT: 'هارمونی',
  GLMUSDT: 'گلم/تتر',
  ENSIRT: 'ایث‌نیم',
  SUSHIIRT: 'سوشی‌سوپ',
  LDOIRT: 'لیدو',
  ATOMUSDT: 'کازموس/تتر',
  ZROIRT: 'زرو',
  STORJIRT: 'استورج',
  ANTIRT: 'اریون',
  AEVOUSDT: 'ایو/تتر',
  RSRUSDT: 'رزرو/تتر',
  API3USDT: 'ای‌پی‌آی۳/تتر',
  GLMIRT: 'گلم',
  XMRIRT: 'مونرو',
  ENSUSDT: 'ایث‌نیم/تتر',
  OMIRT: 'مان',
  RDNTIRT: 'رادینت',
  MAGICUSDT: 'مجیک/تتر',
  TIRT: 'تتر',
  ATOMIRT: 'کازموس',
  NOTIRT: 'نوت',
  CVXIRT: 'کانوکس',
  XTZIRT: 'تزو',
  FILIRT: 'فایل‌کوین',
  UMAIRT: 'یوما',
  BANDIRT: 'بند پروتکل',
  SSVIRT: 'اس‌اس‌وی',
  DAOIRT: 'داو',
  BLURIRT: 'بلور',
  ONEUSDT: 'هارمونی/تتر',
  EGALAUSDT: 'ایگالا/تتر',
  GMXIRT: 'جمیکس',
  XTZUSDT: 'تزو/تتر',
  FLOWUSDT: 'فلو/تتر',
  GALUSDT: 'گالاکسی/تتر',
  WIRT: 'راب‌بتکس',
  CVCUSDT: 'سیویسیک/تتر',
  NMRUSDT: 'نومریکال/تتر',
  SKLIRT: 'اسکیل',
  SNTIRT: 'استیتیک',
  BATUSDT: 'بیت‌ای‌ای/تتر',
  TRBUSDT: 'تلربیت/تتر',
  NMRIRT: 'نومریکال',
  RDNTUSDT: 'رادینت/تتر',
  API3IRT: 'ای‌پی‌آی۳',
  CVCIRT: 'سیویسیک',
  WLDIRT: 'ویلد',
  YFIUSDT: 'یرن‌فایننس/تتر',
  SOLIRT: 'سولانا',
  TUSDT: 'ترون/تتر',
  QNTUSDT: 'کوانتم/تتر',
  IMXUSDT: 'ایمرسیف/تتر',
  AEVOIRT: 'ایو',
  GMXUSDT: 'جمیکس/تتر',
  ETHFIUSDT: 'اتریوم‌فای/تتر',
  QNTIRT: 'کوانتم',
  GRTUSDT: 'گراف/تتر',
  WLDUSDT: 'ویلد/تتر',
  FETIRT: 'فچ‌ای',
  AGIXIRT: 'سینژولاریتی‌نت',
  NOTUSDT: 'نوت/تتر',
  LPTIRT: 'لایوپیر',
  SLPIRT: 'سالپ',
  MEMEUSDT: 'مم/تتر',
  SOLUSDT: 'سولانا/تتر',
  BALUSDT: 'بالانسر/تتر',
  DAOUSDT: 'داو/تتر',
  COMPIRT: 'کامپاوند',
  MEMEIRT: 'مم',
  TONUSDT: 'تون/تتر',
  BATIRT: 'بیت‌ای‌ای',
  SNXIRT: 'سینتتیکس',
  TRBIRT: 'تلربیت',
  OMUSDT: 'مان/تتر',
  RSRIRT: 'رزرو',
  RNDRIRT: 'رندر',
  SLPUSDT: 'سالپ/تتر',
  SSVUSDT: 'اس‌اس‌وی/تتر',
  RNDRUSDT: 'رندر/تتر',
  AGLDIRT: 'آگلد',
  NEARUSDT: 'نیر/تتر',
  WOOUSDT: 'ووبول/تتر',
  YFIIRT: 'یرن‌فایننس',
  MDTIRT: 'مدیوم',
  CRVUSDT: 'کریو/تتر',
  MDTUSDT: 'مدیوم/تتر',
  EGLDUSDT: 'الگورند/تتر',
  LRCIRT: 'لوپرینگ',
  LPTUSDT: 'لایوپیر/تتر',
  BICOUSDT: 'بیکو/تتر',
  BICOIRT: 'بیکو',
  MAGICIRT: 'مجیک',
  ETHFIIRT: 'اتریوم‌فای',
  ANTUSDT: 'اریون/تتر',
  APEUSDT: 'آپ/تتر',
  ARBIRT: 'آربیتروم',
  LRCUSDT: 'لوپرینگ/تتر',
  WUSDT: 'راب‌بتکس/تتر',
  BLURUSDT: 'بلور/تتر',
  CELRUSDT: 'سلر/تتر',
  DYDXIRT: 'دای‌دکس',
  CVXUSDT: 'کانوکس/تتر',
  BALIRT: 'بالانسر',
  TONIRT: 'تون',
  JSTUSDT: 'جاست/تتر',
  ZROUSDT: 'زرو/تتر',
  ARBUSDT: 'آربیتروم/تتر',
  APTIRT: 'اپتیموس',
  CELRIRT: 'سلر',
  UMAUSDT: 'یوما/تتر',
  SKLUSDT: 'اسکیل/تتر',
  ZRXUSDT: 'زیکس/تتر',
  AGLDUSDT: 'آگلد/تتر',
  ALGOIRT: 'الگورند',
  NEARIRT: 'نیر',
  APTUSDT: 'اپتیموس/تتر',
  ZRXIRT: 'زیکس',
  SUSHIUSDT: 'سوشی‌سوپ/تتر',
  FETUSDT: 'فچ‌ای/تتر',
  ALGOUSDT: 'الگورند/تتر',
  MASKIRT: 'ماسک',
  EGALAIRT: 'ایگالا',
  FLOWIRT: 'فلو',
  MASKUSDT: 'ماسک/تتر',
  STORJUSDT: 'استورج/تتر',
  XMRUSDT: 'مونرو/تتر',
  OMGIRT: 'ام‌جی‌ام',
  SNTUSDT: 'استیتیک/تتر',
  APEIRT: 'آپ',
  FILUSDT: 'فایل‌کوین/تتر',
  ENJUSDT: 'انجین/تتر',
  OMGUSDT: 'ام‌جی‌ام/تتر',
  WOOIRT: 'ووبول',
  CHZUSDT: 'چیلیز/تتر',
  ENJIRT: 'انجین',
  DYDXUSDT: 'دای‌دکس/تتر',
  AGIXUSDT: 'سینژولاریتی‌نت/تتر',
  JSTIRT: 'جاست',
  LDOUSDT: 'لیدو/تتر',
  SNXUSDT: 'سینتتیکس/تتر'
};
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
  BTC: ['BTCIRT', 'BTCUSDT'],
  ETH: ['ETHIRT', 'ETHUSDT'],
  LTC: ['LTCIRT', 'LTCUSDT'],
  USDT: ['USDTIRT', 'USDTUSDT'],
  XRP: ['XRPIRT', 'XRPUSDT'],
  BCH: ['BCHIRT', 'BCHUSDT'],
  BNB: ['BNBIRT', 'BNBUSDT'],
  EOS: ['EOSIRT', 'EOSUSDT'],
  XLM: ['XLMIRT', 'XLMUSDT'],
  ETC: ['ETCIRT', 'ETCUSDT'],
  TRX: ['TRXIRT', 'TRXUSDT'],
  DOGE: ['DOGEIRT', 'DOGEUSDT'],
  UNI: ['UNIIRT', 'UNIUSDT'],
  DAI: ['DAIIRT', 'DAIUSDT'],
  LINK: ['LINKIRT', 'LINKUSDT'],
  DOT: ['DOTIRT', 'DOTUSDT'],
  AAVE: ['AAVEIRT', 'AAVEUSDT'],
  ADA: ['ADAIRT', 'ADAUSDT'],
  SHIB: ['SHIBIRT', 'SHIBUSDT'],
  FTM: ['FTMIRT', 'FTMUSDT'],
  MATIC: ['MATICIRT', 'MATICUSDT'],
  AXS: ['AXSIRT', 'AXSUSDT'],
  MANA: ['MANAIRT', 'MANAUSDT'],
  SAND: ['SANDIRT', 'SANDUSDT'],
  AVAX: ['AVAXIRT', 'AVAXUSDT'],
  MKR: ['MKRIRT', 'MKRUSDT'],
  GMT: ['GMTIRT', 'GMTUSDT'],
  USDC: ['USDCIRT', 'USDCUSDT']
};

// تابع دریافت قیمت از API نوبیتکس
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(`https://api.nobitex.ir/v3/orderbook/${symbol}`, {
      timeout: 15000 // 15 ثانیه
    });

    if (!response.data || response.data.status !== 'ok') {
      throw new Error('داده دریافتی نامعتبر است');
    }

    // استخراج قیمت‌ها از asks و bids
    const { asks, bids } = response.data[symbol];
    const prices = [...asks, ...bids].map(item => parseFloat(item[0])); // فقط قیمت‌ها را برمی‌گرداند

    return prices;
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices) {
  const lastPrice = prices[prices.length - 1];

  // محاسبه RSI
  const rsi = technicalindicators.rsi({
    values: prices,
    period: 14
  }).slice(-1)[0] || 50;

  // محاسبه MACD
  const macd = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };

  // تشخیص سیگنال
  let signal = 'خنثی';
  if (rsi < 30 && macd.MACD > macd.signal) signal = 'خرید';
  if (rsi > 70 && macd.MACD < macd.signal) signal = 'فروش';

  return {
    lastPrice,
    rsi,
    macd,
    signal,
    trend: lastPrice > prices[prices.length - 2] ? 'صعودی' : 'نزولی'
  };
}

// مسیر دریافت لیست نمادهای مرتبط
app.get('/api/symbols/:baseSymbol', (req, res) => {
  const baseSymbol = req.params.baseSymbol.toUpperCase();

  if (!CRYPTO_SYMBOLS[baseSymbol]) {
    return res.status(404).json({
      status: 'error',
      message: 'این نماد پایه پشتیبانی نمی‌شود'
    });
  }

  res.json({
    status: 'success',
    symbols: CRYPTO_SYMBOLS[baseSymbol]
  });
});

// مسیر تحلیل نماد
app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    if (!Object.values(CRYPTO_SYMBOLS).flat().includes(symbol)) {
      return res.status(404).json({
        status: 'error',
        message: 'این نماد پشتیبانی نمی‌شود'
      });
    }

    const prices = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices);

    res.json({
      status: 'success',
      symbol,
      ...analysis,
      lastUpdate: new Date()
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// مسیر اصلی
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
module.exports = app;
