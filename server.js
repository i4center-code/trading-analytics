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
  BTCIRT: 'بیتکوین (BTCIRT)',
  ETHIRT: 'اتریوم (ETHIRT)',
  LTCIRT: 'لایت‌کوین (LTCIRT)',
  USDTIRT: 'تتر (USDTIRT)',
  XRPIRT: 'ریپل (XRPIRT)',
  BCHIRT: 'بیت‌کوین کش (BCHIRT)',
  BNBIRT: 'بایننس کوین (BNBIRT)',
  EOSIRT: 'ایاس (EOSIRT)',
  XLMIRT: 'استلار (XLMIRT)',
  ETCIRT: 'اتریوم کلاسیک (ETCIRT)',
  TRXIRT: 'ترون (TRXIRT)',
  DOGEIRT: 'دوج کوین (DOGEIRT)',
  UNIIRT: 'یونی‌سوپ (UNIIRT)',
  DAIIRT: 'داي (DAIIRT)',
  LINKIRT: 'چین‌لینک (LINKIRT)',
  DOTIRT: 'پولکادات (DOTIRT)',
  AAVEIRT: 'آوی (AAVEIRT)',
  ADAIRT: 'کاردانو (ADAIRT)',
  SHIBIRT: 'شیبا اینو (SHIBIRT)',
  FTMIRT: 'فانتوم (FTMIRT)',
  MATICIRT: 'پولی‌گان (MATICIRT)',
  AXSIRT: 'اکسی اینفینیتی (AXSIRT)',
  MANAIRT: 'دیسنترالند (MANAIRT)',
  SANDIRT: 'ساندباکس (SANDIRT)',
  AVAXIRT: 'آوالانچ (AVAXIRT)',
  MKRIRT: 'میکر (MKRIRT)',
  GMTIRT: 'استپن (GMTIRT)',
  USDCIRT: 'یواس‌دی‌سی (USDCIRT)',
  BTCUSDT: 'بیتکوین/تتر (BTCUSDT)',
  ETHUSDT: 'اتریوم/تتر (ETHUSDT)',
  LTCUSDT: 'لایت‌کوین/تتر (LTCUSDT)',
  XRPUSDT: 'ریپل/تتر (XRPUSDT)',
  BCHUSDT: 'بیت‌کوین کش/تتر (BCHUSDT)',
  BNBUSDT: 'بایننس کوین/تتر (BNBUSDT)',
  EOSUSDT: 'ایاس/تتر (EOSUSDT)',
  XLMUSDT: 'استلار/تتر (XLMUSDT)',
  ETCUSDT: 'اتریوم کلاسیک/تتر (ETCUSDT)',
  TRXUSDT: 'ترون/تتر (TRXUSDT)',
  PMNUSDT: 'پرومین (PMNUSDT)',
  DOGEUSDT: 'دوج کوین/تتر (DOGEUSDT)',
  UNIUSDT: 'یونی‌سوپ/تتر (UNIUSDT)',
  DAIUSDT: 'داي/تتر (DAIUSDT)',
  LINKUSDT: 'چین‌لینک/تتر (LINKUSDT)',
  DOTUSDT: 'پولکادات/تتر (DOTUSDT)',
  AAVEUSDT: 'آوی/تتر (AAVEUSDT)',
  ADAUSDT: 'کاردانو/تتر (ADAUSDT)',
  SHIBUSDT: 'شیبا اینو/تتر (SHIBUSDT)',
  FTMUSDT: 'فانتوم/تتر (FTMUSDT)',
  MATICUSDT: 'پولی‌گان/تتر (MATICUSDT)',
  AXSUSDT: 'اکسی اینفینیتی/تتر (AXSUSDT)',
  MANAUSDT: 'دیسنترالند/تتر (MANAUSDT)',
  SANDUSDT: 'ساندباکس/تتر (SANDUSDT)',
  AVAXUSDT: 'آوالانچ/تتر (AVAXUSDT)',
  MKRUSDT: 'میکر/تتر (MKRUSDT)',
  GMTUSDT: 'استپن/تتر (GMTUSDT)',
  USDCUSDT: 'یواس‌دی‌سی/تتر (USDCUSDT)',
  CHZIRT: 'چیلیز (CHZIRT)',
  GRTIRT: 'گراف (GRTIRT)',
  CRVIRT: 'کریو (CRVIRT)',
  BANDUSDT: 'بند پروتکل/تتر (BANDUSDT)',
  COMPUSDT: 'کامپاوند/تتر (COMPUSDT)',
  EGLDIRT: 'الگورند (EGLDIRT)',
  HBARUSDT: 'هدر با (HBARUSDT)',
  GALIRT: 'گالاکسی (GALIRT)',
  HBARIRT: 'هدر با (HBARIRT)',
  WBTCUSDT: 'راب‌بتکس/تتر (WBTCUSDT)',
  IMXIRT: 'ایمرسیف (IMXIRT)',
  WBTCIRT: 'راب‌بتکس (WBTCIRT)',
  ONEIRT: 'هارمونی (ONEIRT)',
  GLMUSDT: 'گلم (GLMUSDT)',
  ENSIRT: 'ایث‌نیم (ENSIRT)',
  "1M_BTTIRT": 'بیت‌تورنت (1M_BTTIRT)',
  SUSHIIRT: 'سوشی‌سوپ (SUSHIIRT)',
  LDOIRT: 'لیدو (LDOIRT)',
  ATOMUSDT: 'کازموس/تتر (ATOMUSDT)',
  ZROIRT: 'زرو (ZROIRT)',
  STORJIRT: 'استورج (STORJIRT)',
  ANTIRT: 'اریون (ANTIRT)',
  AEVOUSDT: 'ایو (AEVOUSDT)',
  "100K_FLOKIIRT": 'فلوکی (100K_FLOKIIRT)',
  RSRUSDT: 'رزرو (RSRUSDT)',
  API3USDT: 'ای‌پی‌آی۳/تتر (API3USDT)',
  GLMIRT: 'گلم (GLMIRT)',
  XMRIRT: 'مونرو (XMRIRT)',
  ENSUSDT: 'ایث‌نیم/تتر (ENSUSDT)',
  OMIRT: 'مان (OMIRT)',
  RDNTIRT: 'رادینت (RDNTIRT)',
  MAGICUSDT: 'مجیک (MAGICUSDT)',
  TIRT: 'تتر (TIRT)',
  ATOMIRT: 'کازموس (ATOMIRT)',
  NOTIRT: 'نوت (NOTIRT)',
  CVXIRT: 'کانوکس (CVXIRT)',
  XTZIRT: 'تزو (XTZIRT)',
  FILIRT: 'فایل‌کوین (FILIRT)',
  UMAIRT: 'یوما (UMAIRT)',
  "1B_BABYDOGEIRT": 'بیبی‌دوج (1B_BABYDOGEIRT)',
  BANDIRT: 'بند پروتکل (BANDIRT)',
  SSVIRT: 'اس‌اس‌وی (SSVIRT)',
  DAOIRT: 'داو (DAOIRT)',
  BLURIRT: 'بلور (BLURIRT)',
  ONEUSDT: 'هارمونی/تتر (ONEUSDT)',
  EGALAUSDT: 'ایگالا (EGALAUSDT)',
  GMXIRT: 'جمیکس (GMXIRT)',
  XTZUSDT: 'تزو/تتر (XTZUSDT)',
  FLOWUSDT: 'فلو/تتر (FLOWUSDT)',
  GALUSDT: 'گالاکسی/تتر (GALUSDT)',
  WIRT: 'راب‌بتکس (WIRT)',
  CVCUSDT: 'سیویسیک/تتر (CVCUSDT)',
  NMRUSDT: 'نومریکال/تتر (NMRUSDT)',
  SKLIRT: 'اسکیل (SKLIRT)',
  SNTIRT: 'استیتیک (SNTIRT)',
  BATUSDT: 'بیت‌ای‌ای/تتر (BATUSDT)',
  TRBUSDT: 'تلربیت (TRBUSDT)',
  NMRIRT: 'نومریکال (NMRIRT)',
  RDNTUSDT: 'رادینت/تتر (RDNTUSDT)',
  API3IRT: 'ای‌پی‌آی۳ (API3IRT)',
  CVCIRT: 'سیویسیک (CVCIRT)',
  WLDIRT: 'ویلد (WLDIRT)',
  YFIUSDT: 'یرن‌فایننس/تتر (YFIUSDT)',
  SOLIRT: 'سولانا (SOLIRT)',
  TUSDT: 'ترون/تتر (TUSDT)',
  QNTUSDT: 'کوانتم/تتر (QNTUSDT)',
  IMXUSDT: 'ایمرسیف/تتر (IMXUSDT)',
  AEVOIRT: 'ایو (AEVOIRT)',
  GMXUSDT: 'جمیکس/تتر (GMXUSDT)',
  ETHFIUSDT: 'اتریوم‌فای/تتر (ETHFIUSDT)',
  QNTIRT: 'کوانتم (QNTIRT)',
  GRTUSDT: 'گراف/تتر (GRTUSDT)',
  WLDUSDT: 'ویلد/تتر (WLDUSDT)',
  FETIRT: 'فچ‌ای (FETIRT)',
  AGIXIRT: 'سینژولاریتی‌نت (AGIXIRT)',
  NOTUSDT: 'نوت/تتر (NOTUSDT)',
  LPTIRT: 'لایوپیر (LPTIRT)',
  SLPIRT: 'سالپ (SLPIRT)',
  MEMEUSDT: 'مم (MEMEUSDT)',
  SOLUSDT: 'سولانا/تتر (SOLUSDT)',
  BALUSDT: 'بالانسر/تتر (BALUSDT)',
  DAOUSDT: 'داو/تتر (DAOUSDT)',
  COMPIRT: 'کامپاوند (COMPIRT)',
  MEMEIRT: 'مم (MEMEIRT)',
  TONUSDT: 'تون (TONUSDT)',
  BATIRT: 'بیت‌ای‌ای (BATIRT)',
  SNXIRT: 'سینتتیکس (SNXIRT)',
  TRBIRT: 'تلربیت (TRBIRT)',
  "1INCHUSDT": 'وان‌اینچ/تتر (1INCHUSDT)',
  OMUSDT: 'مان/تتر (OMUSDT)',
  RSRIRT: 'رزرو (RSRIRT)',
  RNDRIRT: 'رندر (RNDRIRT)',
  SLPUSDT: 'سالپ/تتر (SLPUSDT)',
  SSVUSDT: 'اس‌اس‌وی/تتر (SSVUSDT)',
  RNDRUSDT: 'رندر/تتر (RNDRUSDT)',
  AGLDIRT: 'آگلد (AGLDIRT)',
  NEARUSDT: 'نیر/تتر (NEARUSDT)',
  WOOUSDT: 'ووبول (WOOUSDT)',
  YFIIRT: 'یرن‌فایننس (YFIIRT)',
  MDTIRT: 'مدیوم (MDTIRT)',
  CRVUSDT: 'کریو/تتر (CRVUSDT)',
  MDTUSDT: 'مدیوم/تتر (MDTUSDT)',
  EGLDUSDT: 'الگورند/تتر (EGLDUSDT)',
  LRCIRT: 'لوپرینگ (LRCIRT)',
  LPTUSDT: 'لایوپیر/تتر (LPTUSDT)',
  BICOUSDT: 'بیکو/تتر (BICOUSDT)',
  "1M_PEPEIRT": 'پپ (1M_PEPEIRT)',
  BICOIRT: 'بیکو (BICOIRT)',
  MAGICIRT: 'مجیک (MAGICIRT)',
  ETHFIIRT: 'اتریوم‌فای (ETHFIIRT)',
  ANTUSDT: 'اریون/تتر (ANTUSDT)',
  "1INCHIRT": 'وان‌اینچ (1INCHIRT)',
  APEUSDT: 'آپ (APEUSDT)',
  "1M_NFTIRT": 'ان‌اف‌تی (1M_NFTIRT)',
  ARBIRT: 'آربیتروم (ARBIRT)',
  LRCUSDT: 'لوپرینگ/تتر (LRCUSDT)',
  WUSDT: 'راب‌بتکس (WUSDT)',
  BLURUSDT: 'بلور/تتر (BLURUSDT)',
  CELRUSDT: 'سلر/تتر (CELRUSDT)',
  DYDXIRT: 'دای‌دکس (DYDXIRT)',
  CVXUSDT: 'کانوکس/تتر (CVXUSDT)',
  BALIRT: 'بالانسر (BALIRT)',
  TONIRT: 'تون (TONIRT)',
  "100K_FLOKIUSDT": 'فلوکی/تتر (100K_FLOKIUSDT)',
  JSTUSDT: 'جاست (JSTUSDT)',
  ZROUSDT: 'زرو/تتر (ZROUSDT)',
  ARBUSDT: 'آربیتروم/تتر (ARBUSDT)',
  APTIRT: 'اپتیموس (APTIRT)',
  "1M_NFTUSDT": 'ان‌اف‌تی/تتر (1M_NFTUSDT)',
  CELRIRT: 'سلر (CELRIRT)',
  UMAUSDT: 'یوما/تتر (UMAUSDT)',
  SKLUSDT: 'اسکیل/تتر (SKLUSDT)',
  ZRXUSDT: 'زیکس/تتر (ZRXUSDT)',
  AGLDUSDT: 'آگلد/تتر (AGLDUSDT)',
  ALGOIRT: 'الگورند (ALGOIRT)',
  NEARIRT: 'نیر (NEARIRT)',
  APTUSDT: 'اپتیموس/تتر (APTUSDT)',
  ZRXIRT: 'زیکس (ZRXIRT)',
  SUSHIUSDT: 'سوشی‌سوپ/تتر (SUSHIUSDT)',
  FETUSDT: 'فچ‌ای/تتر (FETUSDT)',
  ALGOUSDT: 'الگورند/تتر (ALGOUSDT)',
  "1M_PEPEUSDT": 'پپ/تتر (1M_PEPEUSDT)',
  MASKIRT: 'ماسک (MASKIRT)',
  EGALAIRT: 'ایگالا (EGALAIRT)',
  FLOWIRT: 'فلو (FLOWIRT)',
  "1B_BABYDOGEUSDT": 'بیبی‌دوج/تتر (1B_BABYDOGEUSDT)',
  MASKUSDT: 'ماسک/تتر (MASKUSDT)',
  "1M_BTTUSDT": 'بیت‌تورنت/تتر (1M_BTTUSDT)',
  STORJUSDT: 'استورج/تتر (STORJUSDT)',
  XMRUSDT: 'مونرو/تتر (XMRUSDT)',
  OMGIRT: 'ام‌جی‌ام (OMGIRT)',
  SNTUSDT: 'استیتیک/تتر (SNTUSDT)',
  APEIRT: 'آپ (APEIRT)',
  FILUSDT: 'فایل‌کوین/تتر (FILUSDT)',
  ENJUSDT: 'انجین (ENJUSDT)',
  OMGUSDT: 'ام‌جی‌ام/تتر (OMGUSDT)',
  WOOIRT: 'ووبول (WOOIRT)',
  CHZUSDT: 'چیلیز/تتر (CHZUSDT)',
  ENJIRT: 'انجین (ENJIRT)',
  DYDXUSDT: 'دای‌دکس/تتر (DYDXUSDT)',
  AGIXUSDT: 'سینژولاریتی‌نت/تتر (AGIXUSDT)',
  JSTIRT: 'جاست (JSTIRT)',
  LDOUSDT: 'لیدو/تتر (LDOUSDT)',
  SNXUSDT: 'سینتتیکس/تتر (SNXUSDT)'
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

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(CRYPTO_SYMBOLS);
});

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }

    const prices = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices);

    res.json({
      status: 'success',
      symbol,
      name: CRYPTO_SYMBOLS[symbol],
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
