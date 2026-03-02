const axios = require("axios");
const logger = require("../utils/logger");

// Helper function for retry logic with exponential backoff
async function retryFetch(fetchFn, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Fetch historical data from Yahoo Finance
 * @param {string} symbol - Stock symbol (e.g., RELIANCE.NS)
 * @param {number} days - Number of days of history
 * @returns {Promise<Array>} Array of OHLCV data
 */
async function fetchHistoricalData(symbol, days = 200) {
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - days * 24 * 60 * 60;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
  const params = { period1, period2, interval: "1d" };

  const fetchData = async () => {
    try {
      const response = await axios.get(url, { params, timeout: 10000 });
      const result = response.data.chart.result[0];

      if (!result) {
        throw new Error("No data returned from Yahoo Finance");
      }

      const timestamps = result.timestamp;
      const quote = result.indicators.quote[0];

      return timestamps
        .map((ts, i) => ({
          date: new Date(ts * 1000),
          open: quote.open[i],
          high: quote.high[i],
          low: quote.low[i],
          close: quote.close[i],
          volume: quote.volume[i],
        }))
        .filter((d) => d.close !== null); // Filter out null values
    } catch (error) {
      logger.error(`Yahoo Finance fetch failed for ${symbol}:`, error.message);
      throw error;
    }
  };

  // Use custom retry logic
  return retryFetch(fetchData, 3);
}

/**
 * Fetch current quote for a symbol
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Current price data
 */
async function fetchQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
  const params = { interval: "1d", range: "5d" };

  try {
    const response = await axios.get(url, { params, timeout: 10000 });
    const result = response.data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;
    const lastIdx = timestamps.length - 1;

    return {
      symbol: meta.symbol,
      current: meta.regularMarketPrice,
      open: quote.open[lastIdx],
      high: quote.high[lastIdx],
      low: quote.low[lastIdx],
      close: quote.close[lastIdx],
      previousClose: meta.previousClose,
      volume: quote.volume[lastIdx],
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent:
        ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) *
        100,
    };
  } catch (error) {
    logger.error(`Quote fetch failed for ${symbol}:`, error.message);
    throw error;
  }
}

module.exports = { fetchHistoricalData, fetchQuote };
