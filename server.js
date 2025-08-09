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
  'BTCIRT': { name: 'بیت‌کوین', enName: 'BTC' },
  'ETHIRT': { name: 'اتریوم', enName: 'ETH' },
  'USDTIRT': { name: 'تتر', enName: 'USDT' },
  'XRPIRT': { name: 'ریپل', enName: 'XRP' },
  'BCHIRT': { name: 'بیت‌کوین کش', enName: 'BCH' },
  'BNBIRT': { name: 'بایننس کوین', enName: 'BNB' },
  'EOSIRT': { name: 'ایاس', enName: 'EOS' },
  'XLMIRT': { name: 'استلار', enName: 'XLM' },
  'ETCIRT': { name: 'اتریوم کلاسیک', enName: 'ETC' },
  'TRXIRT': { name: 'ترون', enName: 'TRX' },
  'DOGEIRT': { name: 'دوج‌کوین', enName: 'DOGE' },
 

System: 'UNIIRT': { name: 'یونی‌سواپ', enName: 'UNI' },
  'DAIIRT': { name: 'دای', enName: 'DAI' },
  'LINKIRT': { name: 'چین‌لینک', enName: 'LINK' },
  'DOTIRT': { name: 'پولکادات', enName: 'DOT' },
  'AAVEIRT': { name: 'آوه', enName: 'AAVE' },
  'ADAIRT': { name: 'کاردانو', enName: 'ADA' },
  'SHIBIRT': { name: 'شیبا اینو', enName: 'SHIB' },
  'FTMIRT': { name: 'فانتوم', enName: 'FTM' },
  'MATICIRT': { name: 'پالیگان', enName: 'MATIC' },
  'AXSIRT': { name: 'اکسی اینفینیتی', enName: 'AXS' },
  'MANAIRT': { name: 'دیسنترالند', enName: 'MANA' },
  'SANDIRT': { name: 'سندباکس', enName: 'SAND' },
  'AVAXIRT': { name: 'آوالانچ', enName: 'AVAX' },
  'MKRIRT': { name: 'میکر', enName: 'MKR' },
  'GMTIRT': { name: 'استپن', enName: 'GMT' },
  'USDCIRT': { name: 'یو‌اس‌دی کوین', enName: 'USDC' },
  'BTCUSDT': { name: 'بیت‌کوین', enName: 'BTC' },
  'ETHUSDT': { name: 'اتریوم', enName: 'ETH' },
  'LTCUSDT': { name: 'لایت‌کوین', enName: 'LTC' },
  'XRPUSDT': { name: 'ریپل', enName: 'XRP' },
  'BCHUSDT': { name: 'بیت‌کوین کش', enName: 'BCH' },
  'BNBUSDT': { name: 'بایننس کوین', enName: 'BNB' },
  'EOSUSDT': { name: 'ایاس', enName: 'EOS' },
  'XLMUSDT': { name: 'استلار', enName: 'XLM' },
  'ETCUSDT': { name: 'اتریوم کلاسیک', enName: 'ETC' },
  'TRXUSDT': { name: 'ترون', enName: 'TRX' },
  'PMNUSDT': { name: 'پولی‌مث', enName: 'PMN' },
  'DOGEUSDT': { name: 'دوج‌کوین', enName: 'DOGE' },
  'UNIUSDT': { name: 'یونی‌سواپ', enName: 'UNI' },
  'DAIUSDT': { name: 'دای', enName: 'DAI' },
  'LINKUSDT': { name: 'چین‌لینک', enName: 'LINK' },
  'DOTUSDT': { name: 'پولکادات', enName: 'DOT' },
  'AAVEUSDT': { name: 'آوه', enName: 'AAVE' },
  'ADAUSDT': { name: 'کاردانو', enName: 'ADA' },
  'SHIBUSDT': { name: 'شیبا اینو', enName: 'SHIB' },
  'FTMUSDT': { name: 'فانتوم', enName: 'FTM' },
  'MATICUSDT': { name: 'پالیگان', enName: 'MATIC' },
  'AXSUSDT': { name: 'اکسی اینفینیتی', enName: 'AXS' },
  'MANAUSDT': { name: 'دیسنترالند', enName: 'MANA' },
  'SANDUSDT': { name: 'سندباکس', enName: 'SAND' },
  'AVAXUSDT': { name: 'آوالانچ', enName: 'AVAX' },
  'MKRUSDT': { name: 'میکر', enName: 'MKR' },
  'GMTUSDT': { name: 'استپن', enName: 'GMT' },
  'USDCUSDT': { name: 'یو‌اس‌دی کوین', enName: 'USDC' },
  'CHZIRT': { name: 'چیلیز', enName: 'CHZ' },
  'GRTIRT': { name: 'گراف', enName: 'GRT' },
  'CRVIRT': { name: 'کرو', enName: 'CRV' },
  'BANDUSDT': { name: 'باند پروتکل', enName: 'BAND' },
  'COMPUSDT': { name: 'کامپاند', enName: 'COMP' },
  'EGLDIRT': { name: 'الگورند', enName: 'EGLD' },
  'HBARUSDT': { name: 'هدرا', enName: 'HBAR' },
  'GALIRT': { name: 'گالا', enName: 'GALA' },
  'HBARIRT': { name: 'هدرا', enName: 'HBAR' },
  'WBTCUSDT': { name: 'رپد بیت‌کوین', enName: 'WBTC' },
  'IMXIRT': { name: 'ایمیوتبل ایکس', enName: 'IMX' },
  'WBTCIRT': { name: 'رپد بیت‌کوین', enName: 'WBTC' },
  'ONEIRT': { name: 'هارمونی', enName: 'ONE' },
  'GLMUSDT': { name: 'گولم', enName: 'GLM' },
  'ENSIRT': { name: 'اتریوم نیم سرویس', enName: 'ENS' },
  '1M_BTTIRT': { name: 'بیت‌تورنت', enName: 'BTT' },
  'SUSHIIRT': { name: 'سوشی‌سواپ', enName: 'SUSHI' },
  'LDOIRT': { name: 'لیدو', enName: 'LDO' },
  'ATOMUSDT': { name: 'کازماس', enName: 'ATOM' },
  'ZROIRT': { name: 'زیرو', enName: 'ZRO' },
  'STORJIRT': { name: 'استورج', enName: 'STORJ' },
  'ANTIRT': { name: 'آراگون', enName: 'ANT' },
  'AEVOUSDT': { name: 'اوو', enName: 'AEVO' },
  '100K_FLOKIIRT': { name: 'فلوکی', enName: 'FLOKI' },
  'RSRUSDT': { name: 'ریزرور رایتس', enName: 'RSR' },
  'API3USDT': { name: 'ای‌پی‌آی۳', enName: 'API3' },
  'GLMIRT': { name: 'گولم', enName: 'GLM' },
  'XMRIRT': { name: 'مونرو', enName: 'XMR' },
  'ENSUSDT': { name: 'اتریوم نیم سرویس', enName: 'ENS' },
  'OMIRT': { name: 'مانترا', enName: 'OM' },
  'RDNTIRT': { name: 'رادیانت کپیتال', enName: 'RDNT' },
  'MAGICUSDT': { name: 'مجیک', enName: 'MAGIC' },
  'TIRT': { name: 'تی‌ریال', enName: 'T' },
  'ATOMIRT': { name: 'کازماس', enName: 'ATOM' },
  'NOTIRT': { name: 'نات‌کوین', enName: 'NOT' },
  'CVXIRT': { name: 'کانوکس فایننس', enName: 'CVX' },
  'XTZIRT': { name: 'تزوس', enName: 'XTZ' },
  'FILIRT': { name: 'فایل‌کوین', enName: 'FIL' },
  'UMAIRT': { name: 'یوما', enName: 'UMA' },
  '1B_BABYDOGEIRT': { name: 'بیبی دوج', enName: 'BABYDOGE' },
  'B bandIRT': { name: 'باند پروتکل', enName: 'BAND' },
  'SSVIRT': { name: 'اس‌اس‌وی نتورک', enName: 'SSV' },
  'DAOIRT': { name: 'دائو میکر', enName: 'DAO' },
  'BLURIRT': { name: 'بلور', enName: 'BLUR' },
  'ONEUSDT': { name: 'هارمونی', enName: 'ONE' },
  'EGALAUSDT': { name: 'گالا', enName: 'GALA' },
  'GMXIRT': { name: 'جی‌ام‌ایکس', enName: 'GMX' },
  'XTZUSDT': { name: 'تزوس', enName: 'XTZ' },
  'FLOWUSDT': { name: 'فلو', enName: 'FLOW' },
  'GALUSDT': { name: 'گالا', enName: 'GALA' },
  'WIRT': { name: 'دبلیو', enName: 'W' },
  'CVCUSDT': { name: 'سیویک', enName: 'CVC' },
  'NMRUSDT': { name: 'نومرایر', enName: 'NMR' },
  'SKLIRT': { name: 'اسکیل نتورک', enName: 'SKL' },
  'SNTIRT': { name: 'استاتوس', enName: 'SNT' },
  'BATUSDT': { name: 'بیسیک اتنشن توکن', enName: 'BAT' },
  'TRBUSDT': { name: 'ترو', enName: 'TRB' },
  'NMRIRT': { name: 'نومرایر', enName: 'NMR' },
  'RDNTUSDT': { name: 'رادیانت کپیتال', enName: 'RDNT' },
  'API3IRT': { name: 'ای‌پی‌آی۳', enName: 'API3' },
  'CVCIRT': { name: 'سیویک', enName: 'CVC' },
  'WLDIRT': { name: 'ورلدکوین', enName: 'WLD' },
  'YFIUSDT': { name: 'یارن فایننس', enName: 'YFI' },
  'SOLIRT': { name: 'سولانا', enName: 'SOL' },
  'TUSDT': { name: 'تی‌تتر', enName: 'T' },
  'QNTUSDT': { name: 'کوانت', enName: 'QNT' },
  'IMXUSDT': { name: 'ایمیوتبل ایکس', enName: 'IMX' },
  'AEVOIRT': { name: 'اوو', enName: 'AEVO' },
  'GMXUSDT': { name: 'جی‌ام‌ایکس', enName: 'GMX' },
  'ETHFIUSDT': { name: 'اتر.فی', enName: 'ETHFI' },
  'QNTIRT': { name: 'کوانت', enName: 'QNT' },
  'GRTUSDT': { name: 'گراف', enName: 'GRT' },
  'WLDUSDT': { name: 'ورلدکوین', enName: 'WLD' },
  'FETIRT': { name: 'فتچ.ای‌آی', enName: 'FET' },
  'AGIXIRT': { name: 'سینگولاریتی‌نت', enName: 'AGIX' },
  'NOTUSDT': { name: 'نات‌کوین', enName: 'NOT' },
  'LPTIRT': { name: 'لایوپیر', enName: 'LPT' },
  'SLPIRT': { name: 'اسموت لاو پوش', enName: 'SLP' },
  'MEMEUSDT': { name: 'مم‌کوین', enName: 'MEME' },
  'SOLUSDT': { name: 'سولانا', enName: 'SOL' },
  'BALUSDT': { name: 'بالانسر', enName: 'BAL' },
  'DAOUSDT': { name: 'دائو میکر', enName: 'DAO' },
  'COMPIRT': { name: 'کامپاند', enName: 'COMP' },
  'MEMEIRT': { name: 'مم‌کوین', enName: 'MEME' },
  'TONUSDT': { name: 'تون‌کوین', enName: 'TON' },
  'BATIRT': { name: 'بیسیک اتنشن توکن', enName: 'BAT' },
  'SNXIRT': { name: 'سینتتیکس', enName: 'SNX' },
  'TRBIRT': { name: 'تلور', enName: 'TRB' },
  '1INCHUSDT': { name: 'وان‌اینچ', enName: '1INCH' },
  'OMUSDT': { name: 'مانترا', enName: 'OM' },
  'RSRIRT': { name: 'ریزرور رایتس', enName: 'RSR' },
  'RNDRIRT': { name: 'رندر توکن', enName: 'RNDR' },
  'SLPUSDT': { name: 'اسموت لاو پوش', enName: 'SLP' },
  'SSVUSDT': { name: 'اس‌اس‌وی نتورک', enName: 'SSV' },
  'RNDRUSDT': { name: 'رندر توکن', enName: 'RNDR' },
  'AGLDIRT': { name: 'ادونچر گلد', enName: 'AGLD' },
  'NEARUSDT': { name: 'نیر پروتکل', enName: 'NEAR' },
  'WOOUSDT': { name: 'وو نتورک', enName: 'WOO' },
  'YFIIRT': { name: 'دی‌فای', enName: 'YFI' },
  'MDTIRT': { name: 'میدیزبل', enName: 'MDT' },
  'CRVUSDT': { name: 'کرو', enName: 'CRV' },
  'MDTUSDT': { name: 'میدیزبل', enName: 'MDT' },
  'EGLDUSDT': { name: 'الروند', enName: 'EGLD' },
  'LRCIRT': { name: 'لوپ‌رینگ', enName: 'LRC' },
  'LPTUSDT': { name: 'لایوپیر', enName: 'LPT' },
  'BICOUSDT': { name: 'بیکو', enName: 'BICO' },
  '1M_PEPEIRT': { name: 'پپه', enName: 'PEPE' },
  'BICOIRT': { name: 'بیکو', enName: 'BICO' },
  'MAGICIRT': { name: 'مجیک', enName: 'MAGIC' },
  'ETHFIIRT': { name: 'اتر.فی', enName: 'ETHFI' },
  'ANTUSDT': { name: 'آراگون', enName: 'ANT' },
  '1INCHIRT': { name: 'وان‌اینچ', enName: '1INCH' },
  'APEUSDT': { name: 'ایپ‌کوین', enName: 'APE' },
  '1M_NFTIRT': { name: 'ان‌اف‌تی', enName: 'NFT' },
  'ARBIRT': { name: 'آربیتروم', enName: 'ARB' },
  'LRCUSDT': { name: 'لوپ‌رینگ', enName: 'LRC' },
  'WUSDT': { name: 'دبلیو', enName: 'W' },
  'BLURUSDT': { name: 'بلور', enName: 'BLUR' },
  'CELRUSDT': { name: 'سلر نتورک', enName: 'CELR' },
  'DYDXIRT': { name: 'دی‌وای‌دی‌ایکس', enName: 'DYDX' },
  'CVXUSDT': { name: 'کانوکس فایننس', enName: 'CVX' },
  'BALIRT': { name: 'بالانسر', enName: 'BAL' },
  'TONIRT': { name: 'تون‌کوین', enName: 'TON' },
  '100K_FLOKIUSDT': { name: 'فلوکی', enName: 'FLOKI' },
  'JSTUSDT': { name: 'جاست', enName: 'JST' },
  'ZROUSDT': { name: 'زیرو', enName: 'ZRO' },
  'ARBUSDT': { name: 'آربیتروم', enName: 'ARB' },
  'APTIRT': { name: 'آپتوس', enName: 'APT' },
  '1M_NFTUSDT': { name: 'ان‌اف‌تی', enName: 'NFT' },
  'CELRIRT': { name: 'سلر نتورک', enName: 'CELR' },
  'UMAUSDT': { name: 'یوما', enName: 'UMA' },
  'SKLUSDT': { name: 'اسکیل نتورک', enName: 'SKL' },
  'ZRXUSDT': { name: 'زیروایکس', enName: 'ZRX' },
  'AGLDUSDT': { name: 'ادونچر گلد', enName: 'AGLD' },
  'ALGOIRT': { name: 'الگورند', enName: 'ALGO' },
  'NEARIRT': { name: 'نیر پروتکل', enName: 'NEAR' },
  'APTUSDT': { name: 'آپتوس', enName: 'APT' },
  'ZRXIRT': { name: 'زیروایکس', enName: 'ZRX' },
  'SUSHIUSDT': { name: 'سوشی‌سواپ', enName: 'SUSHI' },
  'FETUSDT': { name: 'فتچ.ای‌آی', enName: 'FET' },
  'ALGOUSDT': { name: 'الگورند', enName: 'ALGO' },
  '1M_PEPEUSDT': { name: 'پپه', enName: 'PEPE' },
  'MASKIRT': { name: 'ماسک نتورک', enName: 'MASK' },
  'EGALAIRT': { name: 'گالا', enName: 'GALA' },
  'FLOWIRT': { name: 'فلو', enName: 'FLOW' },
  '1B_BABYDOGEUSDT': { name: 'بیبی دوج', enName: 'BABYDOGE' },
  'MASKUSDT': { name: 'ماسک نتورک', enName: 'MASK' },
  '1M_BTTUSDT': { name: 'بیت‌تورنت', enName: 'BTT' },
  'STORJUSDT': { name: 'استورج', enName: 'STORJ' },
  'XMRUSDT': { name: 'مونرو', enName: 'XMR' },
  'OMGIRT': { name: 'او‌ام‌جی', enName: 'OMG' },
  'SNTUSDT': { name: 'استاتوس', enName: 'SNT' },
  'APEIRT': { name: 'ایپ‌کوین', enName: 'APE' },
  'FILUSDT': { name: 'فایل‌کوین', enName: 'FIL' },
  'ENJUSDT': { name: 'انجین‌کوین', enName: 'ENJ' },
  'OMGUSDT': { name: 'او‌ام‌جی', enName: 'OMG' },
  'WOOIRT': { name: 'وو نتورک', enName: 'WOO' },
  'CHZUSDT': { name: 'چیلیز', enName: 'CHZ' },
  'ENJIRT': { name: 'انجین‌کوین', enName: 'ENJ' },
  'DYDXUSDT': { name: 'دی‌وای‌دی‌ایکس', enName: 'DYDX' },
  'AGIXUSDT': { name: 'سینگولاریتی‌نت', enName: 'AGIX' },
  'JSTIRT': { name: 'جاست', enName: 'JST' },
  'LDOUSDT': { name: 'لیدو', enName: 'LDO' },
  'SNXUSDT': { name: 'سینتتیکس', enName: 'SNX' }
};

// تابع دریافت قیمت و حجم معاملات از API نوبیتکس
async function getCryptoPrices(symbol) {
  try {
    const response = await axios.get(`https://apiv2.nobitex.ir/v3/orderbook/${symbol}`, {
      timeout: 30000, // 30 ثانیه
      headers: { 'User-Agent': 'TraderBot/IranFXCryptoAnalyst' }
    });
    if (!response.data || response.data.status !== 'ok') {
      throw new Error('داده دریافتی نامعتبر است');
    }
    const { asks, bids } = response.data;
    // محاسبه حجم کل خرید و فروش
    const totalBuyVolume = bids.reduce((sum, bid) => sum + parseFloat(bid[1]), 0);
    const totalSellVolume = asks.reduce((sum, ask) => sum + parseFloat(ask[1]), 0);
    // تبدیل قیمت‌ها برای جفت‌های IRT (به تومان)
    const isIRT = symbol.endsWith('IRT');
    const prices = [...asks, ...bids].map(item => parseFloat(item[0]) / (isIRT ? 10 : 1));
    return {
      prices,
      totalBuyVolume,
      totalSellVolume
    };
  } catch (error) {
    console.error(`خطا در دریافت قیمت برای ${symbol}:`, error.message, error.response ? error.response.data : '');
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
  // محاسبه€”
  const ema = technicalindicators.ema({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;
  // محاسبه SMA
  const sma = technicalindicators.sma({
    values: prices,
    period: 14
  }).slice(-1)[0] || 0;
  // محاسبه سطوح مقاومت و حمایت
  const resistance1 = Math.max(...prices) * 1.01;
  const resistance2 = Math.max(...prices) * 1.02;
  const support1 = Math.min(...prices) * 0.99;
  const support2 = Math.min(...prices) * 0.98;
  // محاسبه درصد خریدار و فروشنده
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
    console.log(`درخواست تحلیل برای نماد: ${symbol}`);
    if (!CRYPTO_SYMBOLS[symbol]) {
      return res.status(404).json({
        status: 'error',
        message: 'این ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }
    const { prices, totalBuyVolume, totalSellVolume } = await getCryptoPrices(symbol);
    const analysis = calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume);
    const isIRT = symbol.endsWith('IRT');
    res.json({
      status: 'success',
      symbol,
      name: CRYPTO_SYMBOLS[symbol].name,
      enName: CRYPTO_SYMBOLS[symbol].enName,
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
      unit: isIRT ? 'تومان' : 'USDT',
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
    console.error(`خطا در تحلیل ${symbol}:`, error.message, error.response ? error.response.data : '');
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
