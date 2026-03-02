const { calculateAllIndicators } = require('./indicators');
const logger = require('../utils/logger');

// Trading rules configuration
const RULES = {
  technical: {
    rsi: {
      oversold: 30,
      overbought: 70,
      neutral: [40, 60]
    },
    volume: {
      threshold: 1.2  // 20% above average
    }
  },
  fundamentals: {
    pe: {
      undervalued: 0.85,  // PE < sector PE * 0.85
      overvalued: 1.15
    },
    roe: {
      healthy: 12
    },
    debt: {
      safe: 1.0
    }
  }
};

/**
 * Generate Buy/Hold/Sell signal based on technical and fundamental analysis
 * @param {string} symbol - Stock symbol
 * @param {Array} historicalData - OHLCV data
 * @param {Object} fundamentals - Fundamental data (optional)
 * @returns {Object} Signal analysis
 */
function generateSignal(symbol, historicalData, fundamentals = null) {
  const scores = {
    technical: 0,
    fundamental: 0,
    volume: 0
  };
  const reasons = [];
  
  // Calculate indicators
  const indicators = calculateAllIndicators(historicalData);
  const latestPrice = historicalData[historicalData.length - 1];
  const prevPrice = historicalData[historicalData.length - 2];
  const currentVolume = latestPrice.volume;
  
  // RSI Analysis
  if (indicators.rsi_14 !== null) {
    if (indicators.rsi_14 < RULES.technical.rsi.oversold) {
      scores.technical += 30;
      reasons.push(`RSI at ${indicators.rsi_14.toFixed(1)} (oversold - buy opportunity)`);
    } else if (indicators.rsi_14 > RULES.technical.rsi.overbought) {
      scores.technical -= 30;
      reasons.push(`RSI at ${indicators.rsi_14.toFixed(1)} (overbought - caution)`);
    } else if (indicators.rsi_14 >= RULES.technical.rsi.neutral[0] && 
               indicators.rsi_14 <= RULES.technical.rsi.neutral[1]) {
      reasons.push(`RSI at ${indicators.rsi_14.toFixed(1)} (neutral zone)`);
    }
  }
  
  // Moving Average Analysis
  if (indicators.sma_50 && indicators.sma_200) {
    if (indicators.sma_50 > indicators.sma_200) {
      scores.technical += 20;
      reasons.push(`Golden Cross: 50-day MA (₹${indicators.sma_50.toFixed(2)}) > 200-day MA (₹${indicators.sma_200.toFixed(2)})`);
    } else {
      scores.technical -= 20;
      reasons.push(`Death Cross: 50-day MA (₹${indicators.sma_50.toFixed(2)}) below 200-day MA (₹${indicators.sma_200.toFixed(2)})`);
    }
  }
  
  // MACD Analysis
  if (indicators.macd && indicators.macd.histogram > 0) {
    scores.technical += 15;
    reasons.push(`MACD histogram positive (${indicators.macd.histogram.toFixed(2)}) - bullish momentum`);
  } else if (indicators.macd && indicators.macd.histogram < 0) {
    scores.technical -= 10;
    reasons.push(`MACD histogram negative - bearish momentum`);
  }
  
  // Volume Analysis
  if (indicators.avgVolume_20 && currentVolume > indicators.avgVolume_20 * RULES.technical.volume.threshold) {
    scores.volume += 10;
    const volumeIncrease = ((currentVolume / indicators.avgVolume_20 - 1) * 100).toFixed(0);
    reasons.push(`Volume ${volumeIncrease}% above 20-day average (strong interest)`);
  }
  
  // Price Momentum
  const priceChange = ((latestPrice.close - prevPrice.close) / prevPrice.close) * 100;
  if (priceChange > 2) {
    scores.technical += 5;
    reasons.push(`Strong upward momentum (+${priceChange.toFixed(2)}%)`);
  } else if (priceChange < -2) {
    scores.technical -= 5;
    reasons.push(`Downward momentum (${priceChange.toFixed(2)}%)`);
  }
  
  // Fundamental Analysis (if provided)
  if (fundamentals) {
    if (fundamentals.pe_ratio && fundamentals.sector_pe) {
      if (fundamentals.pe_ratio < fundamentals.sector_pe * RULES.fundamentals.pe.undervalued) {
        scores.fundamental += 15;
        reasons.push(`PE ratio ${fundamentals.pe_ratio.toFixed(1)} below sector median ${fundamentals.sector_pe.toFixed(1)} (undervalued)`);
      } else if (fundamentals.pe_ratio > fundamentals.sector_pe * RULES.fundamentals.pe.overvalued) {
        scores.fundamental -= 10;
        reasons.push(`PE ratio ${fundamentals.pe_ratio.toFixed(1)} above sector median (overvalued)`);
      }
    }
    
    if (fundamentals.roe && fundamentals.roe > RULES.fundamentals.roe.healthy) {
      scores.fundamental += 10;
      reasons.push(`ROE ${fundamentals.roe.toFixed(1)}% indicates solid profitability`);
    }
    
    if (fundamentals.debt_to_equity && fundamentals.debt_to_equity < RULES.fundamentals.debt.safe) {
      scores.fundamental += 10;
      reasons.push(`Low debt-to-equity ${fundamentals.debt_to_equity.toFixed(2)} (healthy balance sheet)`);
    }
    
    if (fundamentals.earnings_growth_yoy && fundamentals.earnings_growth_yoy > 10) {
      scores.fundamental += 10;
      reasons.push(`Earnings growth ${fundamentals.earnings_growth_yoy.toFixed(1)}% YoY (strong growth)`);
    }
  }
  
  // Calculate total score
  const totalScore = scores.technical + scores.fundamental + scores.volume;
  
  // Determine signal and confidence
  let signal, confidence;
  if (totalScore >= 50) {
    signal = 'BUY';
    confidence = totalScore >= 70 ? 'HIGH' : 'MEDIUM';
  } else if (totalScore <= -30) {
    signal = 'SELL';
    confidence = totalScore <= -50 ? 'HIGH' : 'MEDIUM';
  } else {
    signal = 'HOLD';
    confidence = 'MEDIUM';
  }
  
  // Generate explanation
  const explanation = generateExplanation(signal, confidence, reasons, totalScore);
  
  logger.info(`Signal generated for ${symbol}: ${signal} (${confidence}, score: ${totalScore})`);
  
  return {
    signal,
    confidence,
    score: totalScore,
    reasons,
    indicators: formatIndicators(indicators),
    fundamentals,
    explanation
  };
}

/**
 * Format indicators for output
 */
function formatIndicators(indicators) {
  return {
    sma_50: indicators.sma_50 ? parseFloat(indicators.sma_50.toFixed(2)) : null,
    sma_200: indicators.sma_200 ? parseFloat(indicators.sma_200.toFixed(2)) : null,
    ema_12: indicators.ema_12 ? parseFloat(indicators.ema_12.toFixed(2)) : null,
    ema_26: indicators.ema_26 ? parseFloat(indicators.ema_26.toFixed(2)) : null,
    rsi_14: indicators.rsi_14 ? parseFloat(indicators.rsi_14.toFixed(2)) : null,
    macd: indicators.macd ? {
      macd: parseFloat(indicators.macd.macd.toFixed(2)),
      signal: parseFloat(indicators.macd.signal.toFixed(2)),
      histogram: parseFloat(indicators.macd.histogram.toFixed(2))
    } : null,
    bollinger: indicators.bollinger ? {
      upper: parseFloat(indicators.bollinger.upper.toFixed(2)),
      middle: parseFloat(indicators.bollinger.middle.toFixed(2)),
      lower: parseFloat(indicators.bollinger.lower.toFixed(2))
    } : null,
    atr_14: indicators.atr_14 ? parseFloat(indicators.atr_14.toFixed(2)) : null
  };
}

/**
 * Generate natural language explanation
 */
function generateExplanation(signal, confidence, reasons, score) {
  const signalDescriptions = {
    BUY: 'buy signal',
    HOLD: 'hold recommendation',
    SELL: 'sell signal'
  };
  
  const confidenceDescriptions = {
    HIGH: 'Strong',
    MEDIUM: 'Moderate',
    LOW: 'Weak'
  };
  
  const topReasons = reasons.slice(0, 3).join('. ');
  
  return `${confidenceDescriptions[confidence]} ${signalDescriptions[signal]} based on multiple factors. ${topReasons}. Overall signal strength: ${score}/100.`;
}

module.exports = {
  generateSignal,
  RULES
};
