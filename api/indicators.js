// Technical Indicators API for ML Prediction Models
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let candles;
    
    // Handle different input formats
    if (req.body.Data && req.body.Data.Data) {
      // Original format: { "Data": { "Data": [...] } }
      candles = req.body.Data.Data;
    } else if (req.body[0] && req.body[0].data && req.body[0].data.Data && req.body[0].data.Data.Data) {
      // CryptoCompare format: [{ "data": { "Data": { "Data": [...] } } }]
      candles = req.body[0].data.Data.Data;
    } else if (Array.isArray(req.body)) {
      // Direct array format: [...]
      candles = req.body;
    } else {
      return res.status(400).json({ 
        error: 'Invalid data format. Expected OHLCV candle data array' 
      });
    }
    
    if (!Array.isArray(candles) || candles.length === 0) {
      return res.status(400).json({ error: 'No candle data provided' });
    }

    // Calculate all possible indicators
    const indicators = calculateAllIndicators(candles);
    
    res.status(200).json({
      success: true,
      indicators: indicators,
      candles_count: candles.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

function calculateAllIndicators(candles) {
  const latest = candles[candles.length - 1];
  const opens = candles.map(c => c.open);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volumefrom || 0);
  const times = candles.map(c => c.time);

  return {
    // === PRICE DATA ===
    current_open: latest.open,
    current_high: latest.high,
    current_low: latest.low,
    current_close: latest.close,
    current_time: latest.time,
    
    // === VOLUME DATA ===
    current_volume: latest.volumefrom || 0,
    current_volume_to: latest.volumeto || 0,
    
    // === SIMPLE MOVING AVERAGES ===
    sma_5: calculateSMA(closes, 5),
    sma_10: calculateSMA(closes, 10),
    sma_15: calculateSMA(closes, 15),
    sma_20: calculateSMA(closes, 20),
    sma_25: calculateSMA(closes, 25),
    sma_30: calculateSMA(closes, 30),
    sma_50: calculateSMA(closes, 50),
    sma_100: calculateSMA(closes, 100),
    sma_200: calculateSMA(closes, 200),
    
    // === EXPONENTIAL MOVING AVERAGES ===
    ema_5: calculateEMA(closes, 5),
    ema_8: calculateEMA(closes, 8),
    ema_12: calculateEMA(closes, 12),
    ema_21: calculateEMA(closes, 21),
    ema_26: calculateEMA(closes, 26),
    ema_50: calculateEMA(closes, 50),
    ema_100: calculateEMA(closes, 100),
    ema_200: calculateEMA(closes, 200),
    
    // === MACD VARIANTS ===
    macd_12_26: calculateMACD(closes, 12, 26, 9),
    macd_5_35: calculateMACD(closes, 5, 35, 5),
    
    // === RSI VARIANTS ===
    rsi_6: calculateRSI(closes, 6),
    rsi_14: calculateRSI(closes, 14),
    rsi_21: calculateRSI(closes, 21),
    
    // === BOLLINGER BANDS ===
    bb_20_2: calculateBollingerBands(closes, 20, 2),
    bb_20_1: calculateBollingerBands(closes, 20, 1),
    bb_10_2: calculateBollingerBands(closes, 10, 2),
    
    // === STOCHASTIC OSCILLATORS ===
    stoch_14_3: calculateStochastic(highs, lows, closes, 14, 3),
    stoch_5_3: calculateStochastic(highs, lows, closes, 5, 3),
    
    // === WILLIAMS %R ===
    williams_r_14: calculateWilliamsR(highs, lows, closes, 14),
    williams_r_21: calculateWilliamsR(highs, lows, closes, 21),
    
    // === MOMENTUM INDICATORS ===
    momentum_10: calculateMomentum(closes, 10),
    momentum_14: calculateMomentum(closes, 14),
    roc_10: calculateROC(closes, 10),
    roc_20: calculateROC(closes, 20),
    
    // === AVERAGE TRUE RANGE ===
    atr_14: calculateATR(highs, lows, closes, 14),
    atr_21: calculateATR(highs, lows, closes, 21),
    
    // === COMMODITY CHANNEL INDEX ===
    cci_14: calculateCCI(highs, lows, closes, 14),
    cci_20: calculateCCI(highs, lows, closes, 20),
    
    // === VOLUME INDICATORS ===
    volume_sma_10: calculateSMA(volumes, 10),
    volume_sma_20: calculateSMA(volumes, 20),
    volume_ema_10: calculateEMA(volumes, 10),
    volume_ratio_10: volumes.length > 10 ? (latest.volumefrom || 0) / (calculateSMA(volumes, 10) || 1) : 1,
    volume_ratio_20: volumes.length > 20 ? (latest.volumefrom || 0) / (calculateSMA(volumes, 20) || 1) : 1,
    
    // === PRICE CHANGES ===
    price_change_1: closes.length > 1 ? ((latest.close - closes[closes.length - 2]) / closes[closes.length - 2]) * 100 : 0,
    price_change_3: closes.length > 3 ? ((latest.close - closes[closes.length - 4]) / closes[closes.length - 4]) * 100 : 0,
    price_change_5: closes.length > 5 ? ((latest.close - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 : 0,
    price_change_10: closes.length > 10 ? ((latest.close - closes[closes.length - 11]) / closes[closes.length - 11]) * 100 : 0,
    price_change_20: closes.length > 20 ? ((latest.close - closes[closes.length - 21]) / closes[closes.length - 21]) * 100 : 0,
    
    // === VOLATILITY MEASURES ===
    volatility_10: calculateVolatility(closes, 10),
    volatility_20: calculateVolatility(closes, 20),
    volatility_30: calculateVolatility(closes, 30),
    
    // === SUPPORT/RESISTANCE LEVELS ===
    support_10: Math.min(...lows.slice(-10)),
    support_20: Math.min(...lows.slice(-20)),
    resistance_10: Math.max(...highs.slice(-10)),
    resistance_20: Math.max(...highs.slice(-20)),
    
    // === PRICE POSITION INDICATORS ===
    price_vs_sma_10: closes.length > 10 ? ((latest.close - calculateSMA(closes, 10)) / calculateSMA(closes, 10)) * 100 : 0,
    price_vs_sma_20: closes.length > 20 ? ((latest.close - calculateSMA(closes, 20)) / calculateSMA(closes, 20)) * 100 : 0,
    price_vs_ema_12: closes.length > 12 ? ((latest.close - calculateEMA(closes, 12)) / calculateEMA(closes, 12)) * 100 : 0,
    
    // === RANGE INDICATORS ===
    true_range: calculateTrueRange(latest, candles.length > 1 ? candles[candles.length - 2] : latest),
    high_low_ratio: latest.high / latest.low,
    body_size: Math.abs(latest.close - latest.open),
    body_ratio: Math.abs(latest.close - latest.open) / (latest.high - latest.low),
    upper_shadow: latest.high - Math.max(latest.open, latest.close),
    lower_shadow: Math.min(latest.open, latest.close) - latest.low,
    
    // === TIME-BASED FEATURES ===
    time_since_last: times.length > 1 ? times[times.length - 1] - times[times.length - 2] : 0,
    
    // === STATISTICAL MEASURES ===
    mean_20: calculateSMA(closes, 20),
    std_20: calculateStandardDeviation(closes, 20),
    skewness_20: calculateSkewness(closes, 20),
    kurtosis_20: calculateKurtosis(closes, 20)
  };
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  const sma = calculateSMA(prices, period);
  if (!sma) return null;
  
  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
}

function calculateVolatility(prices, period = 20) {
  if (prices.length < period) return null;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const recentReturns = returns.slice(-period);
  const avgReturn = recentReturns.reduce((sum, ret) => sum + ret, 0) / recentReturns.length;
  const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / recentReturns.length;
  
  return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
}

// Enhanced MACD with configurable parameters
function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  if (!emaFast || !emaSlow) return null;
  
  const macdLine = emaFast - emaSlow;
  
  return {
    macd: macdLine,
    signal: macdLine * 0.9, // Simplified signal line
    histogram: macdLine * 0.1
  };
}

// Enhanced Stochastic with configurable parameters
function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (highs.length < kPeriod) return null;
  
  const recentHighs = highs.slice(-kPeriod);
  const recentLows = lows.slice(-kPeriod);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  return {
    k: k,
    d: k * (dPeriod / (dPeriod + 1)) // Simplified D line
  };
}

// Williams %R
function calculateWilliamsR(highs, lows, closes, period = 14) {
  if (highs.length < period) return null;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  return -100 * ((highestHigh - currentClose) / (highestHigh - lowestLow));
}

// Momentum
function calculateMomentum(prices, period = 10) {
  if (prices.length < period + 1) return null;
  
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - period];
  
  return ((current - past) / past) * 100;
}

// Rate of Change (ROC)
function calculateROC(prices, period = 10) {
  if (prices.length < period + 1) return null;
  
  const current = prices[prices.length - 1];
  const past = prices[prices.length - 1 - period];
  
  return ((current - past) / past) * 100;
}

// Average True Range (ATR)
function calculateATR(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return null;
  
  const trueRanges = [];
  
  for (let i = 1; i < highs.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  return calculateSMA(trueRanges, period);
}

// Commodity Channel Index (CCI)
function calculateCCI(highs, lows, closes, period = 14) {
  if (highs.length < period) return null;
  
  const typicalPrices = [];
  for (let i = 0; i < highs.length; i++) {
    typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
  }
  
  const smaTP = calculateSMA(typicalPrices, period);
  if (!smaTP) return null;
  
  const recentTP = typicalPrices.slice(-period);
  const meanDeviation = recentTP.reduce((sum, tp) => sum + Math.abs(tp - smaTP), 0) / period;
  
  const currentTP = typicalPrices[typicalPrices.length - 1];
  
  return (currentTP - smaTP) / (0.015 * meanDeviation);
}

// True Range for a single candle
function calculateTrueRange(current, previous) {
  const tr1 = current.high - current.low;
  const tr2 = Math.abs(current.high - previous.close);
  const tr3 = Math.abs(current.low - previous.close);
  
  return Math.max(tr1, tr2, tr3);
}

// Standard Deviation
function calculateStandardDeviation(prices, period = 20) {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const mean = slice.reduce((sum, price) => sum + price, 0) / period;
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
  
  return Math.sqrt(variance);
}

// Skewness
function calculateSkewness(prices, period = 20) {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const mean = slice.reduce((sum, price) => sum + price, 0) / period;
  const std = calculateStandardDeviation(prices, period);
  
  if (!std || std === 0) return null;
  
  const skewness = slice.reduce((sum, price) => {
    return sum + Math.pow((price - mean) / std, 3);
  }, 0) / period;
  
  return skewness;
}

// Kurtosis
function calculateKurtosis(prices, period = 20) {
  if (prices.length < period) return null;
  
  const slice = prices.slice(-period);
  const mean = slice.reduce((sum, price) => sum + price, 0) / period;
  const std = calculateStandardDeviation(prices, period);
  
  if (!std || std === 0) return null;
  
  const kurtosis = slice.reduce((sum, price) => {
    return sum + Math.pow((price - mean) / std, 4);
  }, 0) / period;
  
  return kurtosis - 3; // Excess kurtosis
}
