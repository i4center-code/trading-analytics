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
PEPE: 'پپ',
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
CHZ: 'چیلیز',
DYDX: 'دای‌دی‌ایکس',
AGIX: 'سینژولاریتی‌نت',
MEME: 'مم',
BAL: 'بالانسر',
SNX: 'سینتتیکس'
};

// تابع دریافت قیمت و حجم معاملات از API نوبیتکس
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(`https://api.nobitex.ir/v3/orderbook/${symbol}IRT`, {
      timeout: 15000 // 15 ثانیه
    });

    if (!response.data || response.data.status !== 'ok') {
      throw new Error('داده دریافتی نامعتبر است');
    }

    const { asks, bids } = response.data;

    // محاسبه حجم کل خرید و فروش
    const totalBuyVolume = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0); // حجم خرید
    const totalSellVolume = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0); // حجم فروش

    return {
      prices: [...asks, ...bids].map(item => parseFloat(item[0])), // فقط قیمت‌ها
      totalBuyVolume,
      totalSellVolume
    };
  } catch (error) {
    console.error('خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به سرور قیمت‌گذاری');
  }
}

// محاسبه تحلیل تکنیکال
function calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume) {
  const lastPrice = prices[prices.length - 1];

  // محاسبه RSI
  const rsi = technicalindicators.rsi({
    values: prices,
    period: 14
  }).slice(-1)[0] || 50;

  // محاسبه MACD
  const macdResult = technicalindicators.macd({
    values: prices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9
  }).slice(-1)[0] || { MACD: 0, signal: 0 };

  // محاسبه Stochastic
  const stochastic = technicalindicators.stochastic({
    high: prices.map(() => Math.max(...prices)),
    low: prices.map(() => Math.min(...prices)),
    close: prices,
    period: 14,
    signalPeriod: 3
  }).slice(-1)[0] || { k: 50, d: 50 };

  // محاسبه EMA (Exponential Moving Average)
  const ema = technicalindicators.ema({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  // محاسبه SMA (Simple Moving Average)
  const sma = technicalindicators.sma({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;

  // محاسبه سطوح مقاومت و حمایت
  const resistance1 = Math.max(...prices) * 1.01; // 1% بالاتر از بیشترین قیمت
  const resistance2 = Math.max(...prices) * 1.02; // 2% بالاتر از بیشترین قیمت
  const support1 = Math.min(...prices) * 0.99; // 1% پایین‌تر از کمترین قیمت
  const support2 = Math.min(...prices) * 0.98; // 2% پایین‌تر از کمترین قیمت

  // محاسبه درصد خریدار و فروشنده بر اساس حجم معاملات
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

app.get('/api/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }

    const { prices, totalBuyVolume, totalSellVolume } = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);

    res.json({
      status: 'success',
      symbol,
      name: CRYPTO_SYMBOLS[symbol],
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
      indicators: {
        rsi: analysis.rsi,
        macd: analysis.macd,
        stochastic: analysis.stochastic,
        ema: analysis.ema,
        sma: analysis.sma
      },
      resistance1: analysis.resistance1.toLocaleString('fa-IR'),
      resistance2: analysis.resistance2.toLocaleString('fa-IR'),
      support1: analysis.support1.toLocaleString('fa-IR'),
      support2: analysis.support2.toLocaleString('fa-IR'),
      buyPercentage: analysis.buyPercentage.toFixed(2),
      sellPercentage: analysis.sellPercentage.toFixed(2),
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`سرور در حال اجرا روی پورت ${PORT}`);
});

module.exports = app;
