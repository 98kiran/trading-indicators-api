// Trading Indicators API for Make.com automation
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
    const { Data } = req.body;
    
    if (!Data || !Data.Data || !Array.isArray(Data.Data)) {
      return res.status(400).json({ 
        error: 'Invalid data format. Expected { "Data": { "Data": [...] } }' 
      });
    }

    const candles = Data.Data;
    
    if (candles.length === 0) {
      return res.status(400).json({ error: 'No candle data provided' });
    }

    // Calculate indicators
    const indicators = calculateIndicators(candles);
    
    res.status(200).json({
      success: true,
      data: indicators,
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

function calculateIndicators(candles) {
  const latest = candles[candles.length - 1];
  const prices = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volumefrom || 0);

  return {
    // Current Price Data
    current_price: latest.close,
    current_high: latest.high,
    current_low: latest.low,
    current_volume: latest.volumefrom || 0,
    
    // Moving Averages
    sma_10: calculateSMA(prices, 10),
    sma_20: calculateSMA(prices, 20),
    sma_50: calculateSMA(prices, 50),
    ema_12: calculateEMA(prices, 12),
    ema_26: calculateEMA(prices, 26),
    
    // MACD
    macd: calculateMACD(prices),
    
    // RSI
    rsi_14: calculateRSI(prices, 14),
    
    // Bollinger Bands
    bollinger_bands: calculateBollingerBands(prices, 20, 2),
    
    // Stochastic Oscillator
    stochastic: calculateStochastic(highs, lows, prices, 14),
    
    // Volume indicators
    volume_sma_10: calculateSMA(volumes, 10),
    volume_ratio: volumes.length > 1 ? latest.volumefrom / calculateSMA(volumes, 10) : 1,
    
    // Price change indicators
    price_change_1d: prices.length > 1 ? ((latest.close - prices[prices.length - 2]) / prices[prices.length - 2]) * 100 : 0,
    price_change_7d: prices.length > 7 ? ((latest.close - prices[prices.length - 8]) / prices[prices.length - 8]) * 100 : 0,
    
    // Support/Resistance levels
    support_level: Math.min(...lows.slice(-20)),
    resistance_level: Math.max(...highs.slice(-20)),
    
    // Volatility
    volatility: calculateVolatility(prices, 20),
    
    // Market signals
    signals: generateSignals(prices, volumes)
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

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  if (!ema12 || !ema26) return null;
  
  const macdLine = ema12 - ema26;
  
  // Calculate signal line (9-period EMA of MACD line)
  // For simplicity, we'll return just the MACD line
  return {
    macd: macdLine,
    signal: macdLine * 0.9, // Simplified signal line
    histogram: macdLine * 0.1
  };
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

function calculateStochastic(highs, lows, closes, period = 14) {
  if (highs.length < period) return null;
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const currentClose = closes[closes.length - 1];
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  return {
    k: k,
    d: k * 0.9 // Simplified D line
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

function generateSignals(prices, volumes) {
  const signals = [];
  
  // Price trend signals
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const currentPrice = prices[prices.length - 1];
  
  if (sma20 && sma50) {
    if (sma20 > sma50 && currentPrice > sma20) {
      signals.push({ type: 'bullish', indicator: 'moving_average_crossover', strength: 'medium' });
    } else if (sma20 < sma50 && currentPrice < sma20) {
      signals.push({ type: 'bearish', indicator: 'moving_average_crossover', strength: 'medium' });
    }
  }
  
  // RSI signals
  const rsi = calculateRSI(prices, 14);
  if (rsi) {
    if (rsi > 70) {
      signals.push({ type: 'bearish', indicator: 'rsi_overbought', strength: 'high' });
    } else if (rsi < 30) {
      signals.push({ type: 'bullish', indicator: 'rsi_oversold', strength: 'high' });
    }
  }
  
  // Volume signals
  const avgVolume = calculateSMA(volumes, 10);
  const currentVolume = volumes[volumes.length - 1];
  if (avgVolume && currentVolume > avgVolume * 1.5) {
    signals.push({ type: 'neutral', indicator: 'high_volume', strength: 'medium' });
  }
  
  return signals;
}
