# Quick Curl Commands for Trading Indicators API

## 🚀 Ready-to-Use Test Commands

### 1. Basic Single Candle Test
```bash
curl -X POST "https://your-api-url.vercel.app/api/indicators" \
  -H "Content-Type: application/json" \
  -d '{
    "Data": {
      "Data": [
        {"close": 735, "high": 736, "low": 734, "volumefrom": 100}
      ]
    }
  }' | jq '.'
```

### 2. Multiple Candles Test (Recommended)
```bash
curl -X POST "https://your-api-url.vercel.app/api/indicators" \
  -H "Content-Type: application/json" \
  -d '{
    "Data": {
      "Data": [
        {"close": 700, "high": 705, "low": 695, "volumefrom": 1000},
        {"close": 710, "high": 715, "low": 705, "volumefrom": 1100},
        {"close": 720, "high": 725, "low": 715, "volumefrom": 900},
        {"close": 715, "high": 722, "low": 710, "volumefrom": 1200},
        {"close": 725, "high": 730, "low": 720, "volumefrom": 1300},
        {"close": 730, "high": 735, "low": 725, "volumefrom": 1150},
        {"close": 735, "high": 740, "low": 730, "volumefrom": 1400},
        {"close": 740, "high": 745, "low": 735, "volumefrom": 1250},
        {"close": 745, "high": 750, "low": 740, "volumefrom": 1500},
        {"close": 750, "high": 755, "low": 745, "volumefrom": 1350},
        {"close": 748, "high": 753, "low": 743, "volumefrom": 1200},
        {"close": 752, "high": 757, "low": 747, "volumefrom": 1450},
        {"close": 755, "high": 760, "low": 750, "volumefrom": 1600},
        {"close": 760, "high": 765, "low": 755, "volumefrom": 1550},
        {"close": 758, "high": 763, "low": 753, "volumefrom": 1300},
        {"close": 762, "high": 767, "low": 757, "volumefrom": 1400},
        {"close": 765, "high": 770, "low": 760, "volumefrom": 1650},
        {"close": 770, "high": 775, "low": 765, "volumefrom": 1700},
        {"close": 768, "high": 773, "low": 763, "volumefrom": 1500},
        {"close": 772, "high": 777, "low": 767, "volumefrom": 1800}
      ]
    }
  }' | jq '.'
```

### 3. Error Handling Test
```bash
curl -X POST "https://your-api-url.vercel.app/api/indicators" \
  -H "Content-Type: application/json" \
  -d '{"InvalidData": "test"}' | jq '.'
```

### 4. Method Test (Should Return 405)
```bash
curl -X GET "https://your-api-url.vercel.app/api/indicators" | jq '.'
```

## 🔧 How to Use

1. **Replace URL**: Change `https://your-api-url.vercel.app` with your actual Vercel deployment URL
2. **Copy & Paste**: Run any command in your terminal
3. **For Make.com**: Use the format from Test #2 with your real trading data

## 📝 Expected Response Format
```json
{
  "success": true,
  "data": {
    "current_price": 772,
    "current_high": 777,
    "current_low": 767,
    "current_volume": 1800,
    "sma_10": 760.4,
    "sma_20": 745.45,
    "sma_50": null,
    "ema_12": 761.2,
    "ema_26": 748.8,
    "macd": {
      "macd": 12.4,
      "signal": 11.16,
      "histogram": 1.24
    },
    "rsi_14": 68.5,
    "bollinger_bands": {
      "upper": 768.2,
      "middle": 745.45,
      "lower": 722.7
    },
    "stochastic": {
      "k": 75.3,
      "d": 67.77
    },
    "volume_sma_10": 1387.5,
    "volume_ratio": 1.297,
    "price_change_1d": 0.52,
    "price_change_7d": 4.86,
    "support_level": 695,
    "resistance_level": 777,
    "volatility": 0.23,
    "signals": [
      {
        "type": "bullish",
        "indicator": "moving_average_crossover",
        "strength": "medium"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🎯 For Make.com Integration
- Use HTTP module
- Method: POST  
- URL: Your API endpoint
- Headers: Content-Type: application/json
- Body: Use Test #2 format with your actual candle data
