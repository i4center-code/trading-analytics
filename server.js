const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// لیست نمادهای پشتیبانی شده
const CRYPTO_PAIRS = {
  'BTC-USD': 'بیت‌کوین',
  'USDT-USD': 'دلار دیجیتال'
};

// دریافت قیمت از API‌های غیر فیلترشده
async function getCryptoPrices(pair) {
  try {
    let data = {};

    if (pair === 'BTC-USD') {
      const btcResponse = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json'); 
      const usdToIrrResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD'); 

      const btcPriceUSD = btcResponse.data.bpi.USD.rate_float;
      const usdToIrrRate = usdToIrrResponse.data.rates.IRR;

      data = {
        priceInIRR: btcPriceUSD * usdToIrrRate,
        priceInUSD: btcPriceUSD,
        symbol: 'BTC'
      };

    } else if (pair === 'USDT-USD') {
      // USDT = 1 دلار ثابت (حدودیت دارد)
      const usdToIrrResponse = await axios.get('https://api.exchangerate-api.com/v4/latest/USD'); 
      const usdToIrrRate = usdToIrrResponse.data.rates.IRR;

      data = {
        priceInIRR: 1 * usdToIrrRate,
        priceInUSD: 1,
        symbol: 'USDT'
      };
    }

    return {
      prices: [data.priceInIRR],
      totalBuyVolume: 0,
      totalSellVolume: 0
    };

  } catch (error) {
    console.error('❌ خطا در دریافت قیمت:', error.message);
    throw new Error('عدم اتصال به منبع قیمت‌گذاری');
  }
}

// محاسبات ساده تکنیکال (برای تست فقط)
function calculateTechnicalAnalysis(prices, totalBuyVolume, totalSellVolume) {
  const lastPrice = prices[prices.length - 1];
  const buyPercentage = (totalBuyVolume / (totalBuyVolume + totalSellVolume)) * 100 || 50;
  const sellPercentage = (totalSellVolume / (totalBuyVolume + totalSellVolume)) * 100 || 50;

  return {
    lastPrice,
    resistance1: lastPrice * 1.01,
    support1: lastPrice * 0.99,
    buyPercentage: buyPercentage.toFixed(2),
    sellPercentage: sellPercentage.toFixed(2)
  };
}

// API Endpoints
app.get('/api/symbols', (req, res) => {
  res.json(CRYPTO_PAIRS);
});

app.get('/api/analyze/:pair', async (req, res) => {
  try {
    const pair = req.params.pair.toUpperCase();

    if (!CRYPTO_PAIRS[pair]) {
      return res.status(404).json({
        status: 'error',
        message: 'این جفت ارز دیجیتال پشتیبانی نمی‌شود'
      });
    }

    const { prices } = await getCryptoPrices(pair);
    const analysis = calculateTechnicalAnalysis(prices, 1000, 1000); // حجم فرضی

    res.json({
      status: 'success',
      pair,
      name: CRYPTO_PAIRS[pair],
      lastPrice: analysis.lastPrice.toLocaleString('fa-IR'),
      indicators: {
        resistance1: analysis.resistance1.toLocaleString('fa-IR'),
        support1: analysis.support1.toLocaleString('fa-IR'),
        buyPercentage: analysis.buyPercentage,
        sellPercentage: analysis.sellPercentage
      },
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
  console.log(`✅ سرور در حال اجرا روی پورت ${PORT}`);
});
