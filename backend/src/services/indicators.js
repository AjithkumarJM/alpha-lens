/**
 * Technical Indicators Calculation Module
 */

/**
 * Calculate RSI (Relative Strength Index)
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - RSI period (default 14)
 * @returns {number|null} RSI value or null if insufficient data
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  let gains = 0, losses = 0;
  
  // Initial average
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate SMA (Simple Moving Average)
 * @param {Array<number>} values - Array of values
 * @param {number} period - SMA period
 * @returns {number|null} SMA value or null if insufficient data
 */
function calculateSMA(values, period) {
  if (values.length < period) return null;
  const slice = values.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate EMA (Exponential Moving Average)
 * @param {Array<number>} values - Array of values
 * @param {number} period - EMA period
 * @returns {number|null} EMA value or null if insufficient data
 */
function calculateEMA(values, period) {
  if (values.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(values.slice(0, period), period);
  
  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array<number>} prices - Array of closing prices
 * @returns {Object|null} MACD object with macd, signal, histogram
 */
function calculateMACD(prices) {
  if (prices.length < 26) return null;
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  if (!ema12 || !ema26) return null;
  
  const macd = ema12 - ema26;
  
  // For signal line, would need historical MACD values
  // Simplified version: return current MACD
  const signal = macd * 0.9; // Placeholder
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 * @param {Array<number>} prices - Array of closing prices
 * @param {number} period - Period (default 20)
 * @param {number} stdDev - Standard deviations (default 2)
 * @returns {Object|null} Bollinger Bands object
 */
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;
  
  const sma = calculateSMA(prices, period);
  const slice = prices.slice(-period);
  
  // Calculate standard deviation
  const squaredDiffs = slice.map(price => Math.pow(price - sma, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
}

/**
 * Calculate ATR (Average True Range)
 * @param {Array<Object>} candles - Array of OHLC data
 * @param {number} period - ATR period (default 14)
 * @returns {number|null} ATR value
 */
function calculateATR(candles, period = 14) {
  if (candles.length < period + 1) return null;
  
  const trueRanges = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges, period);
}

/**
 * Calculate all indicators for given data
 * @param {Array<Object>} historicalData - OHLCV data
 * @returns {Object} All calculated indicators
 */
function calculateAllIndicators(historicalData) {
  const closes = historicalData.map(d => d.close);
  const volumes = historicalData.map(d => d.volume);
  
  return {
    rsi_14: calculateRSI(closes, 14),
    sma_50: calculateSMA(closes, 50),
    sma_200: calculateSMA(closes, 200),
    ema_12: calculateEMA(closes, 12),
    ema_26: calculateEMA(closes, 26),
    macd: calculateMACD(closes),
    bollinger: calculateBollingerBands(closes, 20, 2),
    atr_14: calculateATR(historicalData, 14),
    avgVolume_20: calculateSMA(volumes, 20)
  };
}

module.exports = {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateAllIndicators
};
