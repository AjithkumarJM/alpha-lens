const express = require("express");
const router = express.Router();
const { fetchHistoricalData } = require("../services/yahooFinance");
const { generateSignal } = require("../services/signalGenerator");
const cache = require("../services/cache");
const logger = require("../utils/logger");
const {
  fetchComprehensiveStockData,
} = require("../services/comprehensiveData");

/**
 * GET /api/analysis/:symbol
 * Get full analysis with Buy/Hold/Sell recommendation
 */
router.get("/:symbol", async (req, res) => {
  const { symbol } = req.params;

  // Check cache first
  const cacheKey = `analysis:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    logger.info(`Generating analysis for ${symbol}`);

    // Fetch historical data
    const historicalData = await fetchHistoricalData(symbol, 200);

    if (!historicalData || historicalData.length < 50) {
      return res.status(400).json({
        error: "Insufficient historical data",
        message: "Need at least 50 days of price history",
      });
    }

    const latestPrice = historicalData[historicalData.length - 1];
    const prevPrice = historicalData[historicalData.length - 2];

    // Generate signal (without fundamentals for now)
    const analysis = generateSignal(symbol, historicalData);

    // Fetch comprehensive data
    const comprehensiveData = await fetchComprehensiveStockData(symbol);

    // Build response
    const response = {
      symbol,
      name: symbol.replace(".NS", "").replace(".BO", ""),
      timestamp: new Date().toISOString(),
      price: {
        current: parseFloat(latestPrice.close.toFixed(2)),
        open: parseFloat(latestPrice.open.toFixed(2)),
        high: parseFloat(latestPrice.high.toFixed(2)),
        low: parseFloat(latestPrice.low.toFixed(2)),
        volume: latestPrice.volume,
        change: parseFloat((latestPrice.close - prevPrice.close).toFixed(2)),
        changePercent: parseFloat(
          (
            ((latestPrice.close - prevPrice.close) / prevPrice.close) *
            100
          ).toFixed(2),
        ),
        avgVolume: analysis.indicators.atr_14 || 0,
      },
      signal: analysis.signal,
      confidence: analysis.confidence,
      score: analysis.score,
      reasons: analysis.reasons,
      indicators: analysis.indicators,
      fundamentals: analysis.fundamentals,
      explanation: analysis.explanation,
      lastAnalysisRun: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      dataSource: "yahoo_finance",
      historicalDays: historicalData.length,
      // Add comprehensive data
      ...comprehensiveData,
    };

    // Cache for 24 hours
    cache.set(cacheKey, response, cache.CACHE_TTL.analysis);

    res.json(response);
  } catch (error) {
    logger.error(`Analysis failed for ${symbol}:`, error);
    res.status(500).json({
      error: "Failed to generate analysis",
      message: error.message,
    });
  }
});

module.exports = router;
