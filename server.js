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
  USDT: 'تتر',
  XRP: 'ریپل',
  BCH: 'بیت‌کوین کش',
  BNB: 'بایننس کوین',
  EOS: 'ایاس',
  XLM: 'استلار',
  ETC: 'اتریوم کلاسیک',
  TRX: 'ترون',
  DOGE: 'دوج‌کوین',
  UNI: 'یونی‌سواپ',
  DAI: 'دای',
  LINK: 'چین‌لینک',
  DOT: 'پولکادات',
  AAVE: 'آوه',
  ADA: 'کاردانو',
  SHIB: 'شیبا اینو',
  FTM: 'فانتوم',
  MATIC: 'پالیگان',
  AXS: 'اکسی اینفینیتی',
  MANA: 'دیسنترالند',
  SAND: 'سندباکس',
  AVAX: 'آوالانچ',
  MKR: 'میکر',
  GMT: 'استپن',
  USDC: 'یو اس دی کوین',
  CHZ: 'چیلیز',
  GRT: 'گراف',
  CRV: 'کرو',
  BAND: 'باند پروتکل',
  COMP: 'کامپاند',
  EGLD: 'الگورند',
  HBAR: 'هدرا',
  GALA: 'گالا',
  WBTC: 'رپد بیت‌کوین',
  IMX: 'ایمیوتبل ایکس',
  ONE: 'هارمونی',
  GLM: 'گولم',
  ENS: 'اتریوم نیم سرویس',
  BTT: 'بیت‌تورنت',
  SUSHI: 'سوشی‌سواپ',
  LDO: 'لیدو',
  ATOM: 'کازماس',
  ZRO: 'زیرو',
  STORJ: 'استورج',
  ANT: 'آراگون',
  AEVO: 'اوو',
  FLOKI: 'فلوکی',
  RSR: 'ریزرور رایتس',
  API3: 'ای‌پی‌آی۳',
  XMR: 'مونرو',
  OM: 'مانترا',
  RDNT: 'رادیانت کپیتال',
  MAGIC: 'مجیک',
  T: 'تی‌ریال',
  NOT: 'نات‌کوین',
  CVX: 'کانوکس فایننس',
  XTZ: 'تزوس',
  FIL: 'فایل‌کوین',
  UMA: 'یوما',
  BABYDOGE: 'بیبی دوج',
  SSV: 'اس‌اس‌وی نتورک',
  DAO: 'دائو میکر',
  BLUR: 'بلور',
  GMX: 'جی‌ام‌ایکس',
  FLOW: 'فلو',
  W: 'دبلیو',
  CVC: 'سیویک',
  NMR: 'نومرایر',
  SKL: 'اسکیل نتورک',
  SNT: 'استاتوس',
  BAT: 'بیسیک اتنشن توکن',
  TRB: 'ترو',
  INCH: 'وان‌اینچ',
  WOO: 'وو نتورک',
  MASK: 'ماسک نتورک',
  PEPE: 'پپه',
  APT: 'آپتوس',
  TON: 'تون‌کوین',
  JST: 'جاست',
  NEAR: 'نیر پروتکل',
  MDT: 'میدیزبل',
  LRC: 'لوپ‌رینگ',
  LPT: 'لایوپیر',
  BICO: 'بیکو',
  AGLD: 'ادونچر گلد',
  ALGO: 'الگورند',
  ENJ: 'انجین‌کوین',
  OMG: 'او‌ام‌جی',
  DYDX: 'دی‌وای‌دی‌ایکس',
  AGIX: 'سینگولاریتی‌نت',
  MEME: 'مم‌کوین',
  BAL: 'بالانسر',
  SNX: 'سینتتیکس'
};

// نمادهای خاص با پیشوند یا پسوند
const SPECIAL_SYMBOLS = {
  BTT: '1M_BTT',
  FLOKI: '100K_FLOKI',
  BABYDOGE: '1B_BABYDOGE',
  PEPE: '1M_PEPE'
};

// کش برای قیمت تتر
let tetherPriceCache = { price: null, timestamp: null };
const CACHE_DURATION = 60 * 1000; // 60 ثانیه

// تابع دریافت قیمت تتر (USDT/IRT)
async function getTetherPrice() {
  const now = Date.now();
  // چک کردن کش
  if (tetherPriceCache.price && tetherPriceCache.timestamp && (now - tetherPriceCache.timestamp) < CACHE_DURATION) {
    console.log('استفاده از قیمت تتر از کش:', tetherPriceCache.price);
    return tetherPriceCache.price;
  }
  try {
    const response = await axios.get('https://apiv2.nobitex.ir/v3/orderbook/USDTIRT', {
      timeout: 30000,
      headers: { 'User-Agent': 'TraderBot/IranFXCryptoAnalyst' }
    });
    if (!response.data || response.data.status !== 'ok') {
      throw new Error('داده دریافتی قیمت تتر نامعتبر است');
    }
    const { bids } = response.data;
    const tetherPrice = parseFloat(bids[0][0]) / 10; // تبدیل به تومان
    tetherPriceCache = { price: tetherPrice, timestamp: now };
    console.log('قیمت تتر به‌روزرسانی شد:', tetherPrice);
    return tetherPrice;
  } catch (error) {
    console.error('خطا در دریافت قیمت تتر:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری برای تتر');
  }
}

// تابع دریافت قیمت و حجم معاملات از API نوبیتکس
async function getCryptoPrices(symbol, pair) {
  try {
    const apiSymbol = SPECIAL_SYMBOLS[symbol] || symbol;
    const baseApiUrl = `https://apiv2.nobitex.ir/v3/orderbook/${apiSymbol}${pair}`;
    console.log(`درخواست به API نوبیتکس: ${baseApiUrl}`);
    const response = await axios.get(baseApiUrl, {
      timeout: 30000,
      headers: { 'User-Agent': 'TraderBot/IranFXCryptoAnalyst' }
    });
    if (!response.data || response.data.status !== 'ok') {
      throw new Error(`داده دریافتی نامعتبر است برای ${apiSymbol}${pair}`);
    }
    const { asks, bids } = response.data;
    const totalBuyVolume = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
    const totalSellVolume = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);
    const isIRT = pair === 'IRT';
    const prices = [...asks, ...bids].map(item => parseFloat(item[0]) / (isIRT ? 10 : 1));
    return {
      prices,
      totalBuyVolume,
      totalSellVolume
    };
  } catch (error) {
    console.error(`خطا در دریافت قیمت برای ${symbol}${pair}:`, error.message, error.response ? error.response.data : '');
    throw new Error(`عدم اتصال به سرور قیمت‌گذاری برای ${symbol}${pair}`);
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume) {
  if (!prices || prices.length === 0) {
    throw new Error('هیچ داده قیمتی دریافت نشده است');
  }
  const lastPrice = prices[prices.length - 1];
  if (typeof lastPrice !== 'number' || isNaN(lastPrice)) {
    throw new Error('قیمت نهایی نامعتبر است');
  }
  const rsi = technicalindicators.rsi({
    values: prices,
    period: 14
  }).slice(-1)[0] || 50;
  const macdResult = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };
  const stochastic = technicalindicators.stochastic({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14,
    signalPeriod: 3
  }).slice(-1)[0] || { k: 50, d: 50 };
  const ema = technicalindicators.ema({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;
  const sma = technicalindicators.sma({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;
  const resistance1 = Math.max(...prices) * 1.01;
  const resistance2 = Math.max(...prices) * 1.02;
  const support1 = Math.min(...prices) * 0.99;
  const support2 = Math.min(...prices) * 0.98;
  const totalVolume = totalBuyVolume + totalSellVolume;
  const buyPercentage = (totalBuyVolume / totalVolume) * 100 || 0;
  const sellPercentage = (totalSellVolume / totalVolume) * 100 || 0;
  return {
    lastPrice,
    rsi,
    macd: macdResult,
    stochastic,
    ema,
    sma,
    resistance1,
    resistance2,
    support1,
    support2,
    buyPercentage,
    sellPercentage
  };
}

// مسیرهای API
app.get('/api/symbols', (req, res) => {
  res.json(CRYPTO_SYMBOLS);
});

app.get('/api/analyze/:symbol/:pair', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const pair = req.params.pair.toUpperCase();
    console.log(`درخواست تحلیل برای نماد: ${symbol}${pair}`);
    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }
    if (pair !== 'IRT' && pair !== 'USDT') {
      return res.status(400).json({
        status: 'error',
        message: 'جفت ارز باید IRT یا USDT باشد'
      });
    }
    const { prices, totalBuyVolume, totalSellVolume } = await getCryptoPrices(symbol, pair);
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);
    const unit = pair === 'IRT' ? 'تومان' : 'دلار';
    let dollarPrice, dollarResistance1, dollarResistance2, dollarSupport1, dollarSupport2;
    if (pair === 'IRT') {
      const tetherPrice = await getTetherPrice();
      dollarPrice = analysis.lastPrice / tetherPrice;
      dollarResistance1 = analysis.resistance1 / tetherPrice;
      dollarResistance2 = analysis.resistance2 / tetherPrice;
      dollarSupport1 = analysis.support1 / tetherPrice;
      dollarSupport2 = analysis.support2 / tetherPrice;
    } else {
      dollarPrice = analysis.lastPrice;
      dollarResistance1 = analysis.resistance1;
      dollarResistance2 = analysis.resistance2;
      dollarSupport1 = analysis.support1;
      dollarSupport2 = analysis.support2;
    }
    res.json({
      status: 'success',
      symbol,
      pair,
      name: CRYPTO_SYMBOLS[symbol],
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
      displayPrice: `${analysis.lastPrice.toLocaleString('fa-IR')} ${unit}`,
      dollarPrice: dollarPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      unit,
      currencyLabel: unit,
      warning: pair === 'IRT' ? 'لطفاً از displayPrice استفاده کنید تا واحد به درستی "تومان" نمایش داده شود و از افزودن "ریال" خودداری کنید.' : 'لطفاً از displayPrice استفاده کنید.',
      indicators: {
        rsi: analysis.rsi,
        macd: analysis.macd,
        stochastic: analysis.stochastic,
        ema: analysis.ema,
        sma: analysis.sma
      },
      resistance1: analysis.resistance1.toLocaleString('fa-IR'),
      displayResistance1: `${analysis.resistance1.toLocaleString('fa-IR')} ${unit}`,
      dollarResistance1: dollarResistance1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      resistance2: analysis.resistance2.toLocaleString('fa-IR'),
      displayResistance2: `${analysis.resistance2.toLocaleString('fa-IR')} ${unit}`,
      dollarResistance2: dollarResistance2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      support1: analysis.support1.toLocaleString('fa-IR'),
      displaySupport1: `${analysis.support1.toLocaleString('fa-IR')} ${unit}`,
      dollarSupport1: dollarSupport1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      support2: analysis.support2.toLocaleString('fa-IR'),
      displaySupport2: `${analysis.support2.toLocaleString('fa-IR')} ${unit}`,
      dollarSupport2: dollarSupport2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      buyPercentage: analysis.buyPercentage.toFixed(2),
      sellPercentage: analysis.sellPercentage.toFixed(2),
      lastUpdate: new Date()
    });
  } catch (error) {
    console.error(`خطا در تحلیل ${symbol}${pair}:`, error.message, error.response ? error.response.data : '');
    res.status(500).json({
      status: 'error',
      message: error.message,
      details: error.response ? error.response.data : 'خطای ناشناخته'
    });
  }
});

// مسیر پیش‌فرض برای سازگاری با کلاینت‌های قدیمی
app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`درخواست تحلیل پیش‌فرض برای نماد: ${symbol}IRT`);
    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }
    const { prices, totalBuyVolume, totalSellVolume } = await getCryptoPrices(symbol, 'IRT');
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);
    const unit = 'تومان';
    const tetherPrice = await getTetherPrice();
    const dollarPrice = analysis.lastPrice / tetherPrice;
    const dollarResistance1 = analysis.resistance1 / tetherPrice;
    const dollarResistance2 = analysis.resistance2 / tetherPrice;
    const dollarSupport1 = analysis.support1 / tetherPrice;
    const dollarSupport2 = analysis.support2 / tetherPrice;
    res.json({
      status: 'success',
      symbol,
      pair: 'IRT',
      name: CRYPTO_SYMBOLS[symbol],
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
      displayPrice: `${analysis.lastPrice.toLocaleString('fa-IR')} ${unit}`,
      dollarPrice: dollarPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      unit,
      currencyLabel: unit,
      warning: 'لطفاً از displayPrice استفاده کنید تا واحد به درستی "تومان" نمایش داده شود و از افزودن "ریال" خودداری کنید.',
      indicators: {
        rsi: analysis.rsi,
        macd: analysis.macd,
        stochastic: analysis.stochastic,
        ema: analysis.ema,
        sma: analysis.sma
      },
      resistance1: analysis.resistance1.toLocaleString('fa-IR'),
      displayResistance1: `${analysis.resistance1.toLocaleString('fa-IR')} ${unit}`,
      dollarResistance1: dollarResistance1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      resistance2: analysis.resistance2.toLocaleString('fa-IR'),
      displayResistance2: `${analysis.resistance2.toLocaleString('fa-IR')} ${unit}`,
      dollarResistance2: dollarResistance2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      support1: analysis.support1.toLocaleString('fa-IR'),
      displaySupport1: `${analysis.support1.toLocaleString('fa-IR')} ${unit}`,
      dollarSupport1: dollarSupport1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      support2: analysis.support2.toLocaleString('fa-IR'),
      displaySupport2: `${analysis.support2.toLocaleString('fa-IR')} ${unit}`,
      dollarSupport2: dollarSupport2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' دلار',
      buyPercentage: analysis.buyPercentage.toFixed(2),
      sellPercentage: analysis.sellPercentage.toFixed(2),
      lastUpdate: new Date()
    });
  } catch (error) {
    console.error(`خطا در تحلیل پیش‌فرض ${symbol}IRT:`, error.message, error.response ? error.response.data : '');
    res.status(500).json({
      status: 'error',
      message: error.message,
      details: error.response ? error.response.data : 'خطای ناشناخته'
    });
  }
});

// مسیر اصلی
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// شروع سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا روی پورت ${PORT}`);
});

module.exports = app;
