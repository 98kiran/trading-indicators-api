#!/bin/bash

echo "🧪 Trading Indicators API Test Suite"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'  
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL - update this with your deployed URL
# For local testing: API_URL="http://localhost:3000/api/indicators"
# For production: API_URL="https://your-api-url.vercel.app/api/indicators"
API_URL="${1:-http://localhost:3000/api/indicators}"

echo -e "${BLUE}🎯 Testing API Endpoint: ${API_URL}${NC}"
echo ""

# Test 1: Basic single candle test
echo -e "${YELLOW}Test 1: Single Candle Data${NC}"
echo "Request: Single candle with basic OHLCV data"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "Data": {
      "Data": [
        {"close": 735, "high": 736, "low": 734, "volumefrom": 100}
      ]
    }
  }' \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo -e "\n${BLUE}----------------------------------------${NC}\n"

# Test 2: Multiple candles for better indicators
echo -e "${YELLOW}Test 2: Multiple Candles (Better Indicators)${NC}"
echo "Request: 20 candles to enable all technical indicators"
curl -X POST "$API_URL" \
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
  }' \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo -e "\n${BLUE}----------------------------------------${NC}\n"

# Test 3: Error handling - invalid data
echo -e "${YELLOW}Test 3: Error Handling (Invalid Data)${NC}"
echo "Request: Invalid data format to test error handling"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "InvalidData": "test"
  }' \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo -e "\n${BLUE}----------------------------------------${NC}\n"

# Test 4: GET request (should return 405)
echo -e "${YELLOW}Test 4: GET Request (Should Return 405)${NC}"
echo "Request: GET request to test method validation"
curl -X GET "$API_URL" \
  -w "\nHTTP Status: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (jq not available for formatting)"

echo -e "\n${GREEN}✅ Test Suite Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Expected Results:${NC}"
echo "• Test 1: Should return basic indicators (some may be null due to insufficient data)"
echo "• Test 2: Should return all indicators with calculated values"
echo "• Test 3: Should return 400 error with validation message"
echo "• Test 4: Should return 405 Method Not Allowed"
echo ""
echo -e "${YELLOW}💡 Usage for Make.com:${NC}"
echo "Use Test 2 format with your real trading data for best results!"
