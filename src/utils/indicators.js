/**
 * Calculate Simple Moving Average
 * @param {Array} data - Array of price objects with 'close' property
 * @param {number} period - SMA period
 * @returns {Array} Array of SMA values
 */
export function calculateSMA(data, period) {
  if (!data || data.length < period) return []
  
  const sma = []
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sum = slice.reduce((acc, item) => acc + parseFloat(item.close), 0)
    sma.push({
      date: data[i].date,
      value: sum / period,
    })
  }
  return sma
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} data - Array of price objects with 'close' property
 * @param {number} period - RSI period (default: 14)
 * @returns {Array} Array of RSI values (0-100)
 */
export function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) return []
  
  const rsi = []
  const changes = []
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(parseFloat(data[i].close) - parseFloat(data[i - 1].close))
  }
  
  // Calculate initial average gain/loss
  let avgGain = 0
  let avgLoss = 0
  
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }
  
  avgGain /= period
  avgLoss /= period
  
  // Calculate RSI for first point
  let rs = avgGain / (avgLoss || 0.0001)
  rsi.push({
    date: data[period].date,
    value: 100 - (100 / (1 + rs)),
  })
  
  // Calculate RSI for remaining points using smoothed averages
  for (let i = period; i < changes.length; i++) {
    const change = changes[i]
    const gain = change > 0 ? change : 0
    const loss = change < 0 ? Math.abs(change) : 0
    
    avgGain = ((avgGain * (period - 1)) + gain) / period
    avgLoss = ((avgLoss * (period - 1)) + loss) / period
    
    rs = avgGain / (avgLoss || 0.0001)
    rsi.push({
      date: data[i + 1].date,
      value: 100 - (100 / (1 + rs)),
    })
  }
  
  return rsi
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * @param {Array} data - Array of price objects with 'close' property
 * @param {number} fastPeriod - Fast EMA period (default: 12)
 * @param {number} slowPeriod - Slow EMA period (default: 26)
 * @param {number} signalPeriod - Signal line period (default: 9)
 * @returns {Object} Object with macd, signal, and histogram arrays
 */
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (!data || data.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] }
  }
  
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)
  
  // Calculate MACD line
  const macdLine = []
  const startIndex = slowPeriod - 1
  
  for (let i = 0; i < fastEMA.length && i + startIndex < slowEMA.length; i++) {
    macdLine.push({
      date: data[i + startIndex].date,
      value: fastEMA[i].value - slowEMA[i + startIndex].value,
    })
  }
  
  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMAFromValues(macdLine, signalPeriod)
  
  // Calculate histogram
  const histogram = []
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push({
      date: signalLine[i].date,
      value: macdLine[i + signalPeriod - 1].value - signalLine[i].value,
    })
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
  }
}

/**
 * Calculate Exponential Moving Average
 * @param {Array} data - Array of price objects with 'close' property
 * @param {number} period - EMA period
 * @returns {Array} Array of EMA values
 */
function calculateEMA(data, period) {
  if (!data || data.length < period) return []
  
  const ema = []
  const multiplier = 2 / (period + 1)
  
  // Calculate initial SMA as first EMA value
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += parseFloat(data[i].close)
  }
  let emaValue = sum / period
  ema.push({ date: data[period - 1].date, value: emaValue })
  
  // Calculate EMA for remaining points
  for (let i = period; i < data.length; i++) {
    emaValue = (parseFloat(data[i].close) - emaValue) * multiplier + emaValue
    ema.push({ date: data[i].date, value: emaValue })
  }
  
  return ema
}

/**
 * Calculate EMA from pre-calculated values
 * @param {Array} data - Array of objects with 'value' property
 * @param {number} period - EMA period
 * @returns {Array} Array of EMA values
 */
function calculateEMAFromValues(data, period) {
  if (!data || data.length < period) return []
  
  const ema = []
  const multiplier = 2 / (period + 1)
  
  // Calculate initial SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    sum += data[i].value
  }
  let emaValue = sum / period
  ema.push({ date: data[period - 1].date, value: emaValue })
  
  // Calculate EMA
  for (let i = period; i < data.length; i++) {
    emaValue = (data[i].value - emaValue) * multiplier + emaValue
    ema.push({ date: data[i].date, value: emaValue })
  }
  
  return ema
}

/**
 * Calculate Bollinger Bands
 * @param {Array} data - Array of price objects with 'close' property
 * @param {number} period - Period (default: 20)
 * @param {number} stdDev - Standard deviations (default: 2)
 * @returns {Object} Object with upper, middle, and lower band arrays
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (!data || data.length < period) {
    return { upper: [], middle: [], lower: [] }
  }
  
  const bands = { upper: [], middle: [], lower: [] }
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const prices = slice.map(item => parseFloat(item.close))
    
    // Calculate SMA (middle band)
    const sma = prices.reduce((sum, price) => sum + price, 0) / period
    
    // Calculate standard deviation
    const squaredDiffs = prices.map(price => Math.pow(price - sma, 2))
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / period
    const sd = Math.sqrt(variance)
    
    bands.middle.push({ date: data[i].date, value: sma })
    bands.upper.push({ date: data[i].date, value: sma + (stdDev * sd) })
    bands.lower.push({ date: data[i].date, value: sma - (stdDev * sd) })
  }
  
  return bands
}
