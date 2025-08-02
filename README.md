# Trading Indicators API

A serverless API for calculating technical trading indicators, designed for Make.com automation workflows.

## Features

- **Moving Averages**: SMA (10, 20, 50 periods), EMA (12, 26 periods)
- **MACD**: Moving Average Convergence Divergence
- **RSI**: Relative Strength Index (14 periods)
- **Bollinger Bands**: 20-period with 2 standard deviations
- **Stochastic Oscillator**: %K and %D lines
- **Volume Analysis**: Volume moving averages and ratios
- **Price Change**: 1-day and 7-day percentage changes
- **Support/Resistance**: Dynamic levels based on recent highs/lows
- **Volatility**: Annualized volatility calculation
- **Trading Signals**: Automated bullish/bearish/neutral signals

## API Endpoint

### POST /api/indicators

Calculates technical indicators for provided candle data.

**Request Format:**
```json
{
  "Data": {
    "Data": [
      {
        "close": 735,
        "high": 736,
        "low": 734,
        "volumefrom": 100
      }
    ]
  }
}
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "current_price": 735,
    "sma_20": 728.5,
    "rsi_14": 65.2,
    "bollinger_bands": {
      "upper": 742.1,
      "middle": 735.0,
      "lower": 727.9
    },
    "signals": [
      {
        "type": "bullish",
        "indicator": "rsi_oversold",
        "strength": "high"
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Deployment

### Option 1: Deploy via GitHub (Recommended)

1. Create a new GitHub repository
2. Upload all project files to the repository
3. Go to [vercel.com](https://vercel.com)
4. Sign up with your GitHub account
5. Import your repository
6. Deploy (takes 1-2 minutes)

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
cd trading-indicators-api
vercel
```

## Testing

After deployment, test your API with:

```bash
curl -X POST https://your-api-url.vercel.app/api/indicators \
  -H "Content-Type: application/json" \
  -d '{"Data":{"Data":[{"close":735,"high":736,"low":734,"volumefrom":100}]}}'
```

## Integration with Make.com

1. Use the HTTP module in Make.com
2. Set method to POST
3. Set URL to your deployed API endpoint
4. Set Content-Type header to `application/json`
5. Pass your candle data in the request body

## File Structure

```
trading-indicators-api/
├── package.json          # Project configuration
├── vercel.json           # Vercel deployment settings
├── api/
│   └── indicators.js     # Main API endpoint
└── README.md            # This file
```

## Technical Indicators Included

- **SMA (Simple Moving Average)**: 10, 20, 50 periods
- **EMA (Exponential Moving Average)**: 12, 26 periods  
- **MACD**: 12/26 EMA crossover with signal line
- **RSI**: 14-period Relative Strength Index
- **Bollinger Bands**: 20-period, 2 standard deviations
- **Stochastic**: 14-period %K and %D
- **Volume Analysis**: 10-period volume SMA and current ratio
- **Price Changes**: 1-day and 7-day percentage changes
- **Support/Resistance**: Based on 20-period highs/lows
- **Volatility**: Annualized volatility calculation
- **Trading Signals**: Automated signal generation

## License

MIT License
# Updated to ensure auth disabled
