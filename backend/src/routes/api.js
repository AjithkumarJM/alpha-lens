const express = require("express");
const router = express.Router();
const technicalAnalysis = require("../services/technicalAnalysis");
const fundamentalAnalysis = require("../services/fundamentalAnalysis");
const {
  fetchComprehensiveStockData,
} = require("../services/comprehensiveData");
const {
  getAllNSEStocks,
  searchStocks,
  getSectors,
  getStocksBySector,
  fetchRealTimeQuote,
  fetchStockDetails,
  fetchChartData,
} = require("../services/nseData");
const cache = require("../utils/cache");
const logger = require("../utils/logger");

/**
 * GET /api/stocks - Get all NSE stocks
 */
router.get("/stocks", async (req, res) => {
  try {
    const stocks = getAllNSEStocks();
    res.json({
      success: true,
      data: stocks,
      count: stocks.length,
    });
  } catch (error) {
    logger.error("Failed to fetch stocks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks list",
    });
  }
});

/**
 * GET /api/stocks/search - Search stocks
 */
router.get("/stocks/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const results = searchStocks(q);
    res.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    logger.error("Search failed:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
    });
  }
});

/**
 * GET /api/stocks/sectors - Get all sectors
 */
router.get("/stocks/sectors", async (req, res) => {
  try {
    const sectors = getSectors();
    res.json({
      success: true,
      data: sectors,
    });
  } catch (error) {
    logger.error("Failed to fetch sectors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sectors",
    });
  }
});

/**
 * GET /api/stocks/sector/:sector - Get stocks by sector
 */
router.get("/stocks/sector/:sector", async (req, res) => {
  try {
    const { sector } = req.params;
    const stocks = getStocksBySector(sector);
    res.json({
      success: true,
      data: stocks,
      count: stocks.length,
    });
  } catch (error) {
    logger.error("Failed to fetch stocks by sector:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stocks",
    });
  }
});

/**
 * GET /api/stocks/:symbol/quote - Get real-time quote
 */
router.get("/stocks/:symbol/quote", async (req, res) => {
  try {
    const { symbol } = req.params;

    // Check cache
    const cached = cache.get(`quote_${symbol}`);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const quote = await fetchRealTimeQuote(symbol);

    // Cache for 1 minute
    cache.set(`quote_${symbol}`, quote, 60);

    res.json({
      success: true,
      data: quote,
      cached: false,
    });
  } catch (error) {
    logger.error(`Failed to fetch quote for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock quote",
    });
  }
});

/**
 * GET /api/stocks/:symbol/chart - Get historical chart data
 */
router.get("/stocks/:symbol/chart", async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = "1y", interval = "1d" } = req.query;

    // Check cache
    const cacheKey = `chart_${symbol}_${period}_${interval}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const chartData = await fetchChartData(symbol, period, interval);

    // Cache for 5 minutes
    cache.set(cacheKey, chartData, 300);

    res.json({
      success: true,
      data: chartData,
      cached: false,
    });
  } catch (error) {
    logger.error(`Failed to fetch chart data for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chart data",
    });
  }
});

/**
 * GET /api/analysis/:symbol - Get comprehensive analysis
 */
router.get("/analysis/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    logger.info(`Fetching comprehensive analysis for ${symbol}`);

    // Check cache first
    const cached = cache.get(`analysis_${symbol}`);
    if (cached) {
      logger.info(`Returning cached analysis for ${symbol}`);
      return res.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Fetch real stock data
    const stockDetails = await fetchStockDetails(symbol);
    const quote = stockDetails.quote;

    // Perform technical analysis
    const technical = await technicalAnalysis.analyze(symbol);

    // Perform fundamental analysis
    const fundamental = await fundamentalAnalysis.analyze(symbol);

    // Fetch comprehensive data
    const comprehensiveData = await fetchComprehensiveStockData(symbol);

    // Generate signal
    const signal = generateSignal(technical, fundamental);

    const analysis = {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: {
        current: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent
          ? quote.regularMarketChangePercent.toFixed(2)
          : "0.00",
        volume: quote.regularMarketVolume || 0,
      },
      signal: signal.signal,
      confidence: signal.confidence,
      score: signal.score,
      reasons: signal.reasons,
      indicators: technical.indicators,
      fundamentals: fundamental.metrics,
      ...comprehensiveData,
    };

    // Cache for 5 minutes
    cache.set(`analysis_${symbol}`, analysis, 300);

    logger.info(`Successfully generated analysis for ${symbol}`);
    res.json({
      success: true,
      data: analysis,
      cached: false,
    });
  } catch (error) {
    logger.error(`Analysis failed for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze stock",
    });
  }
});

function generateSignal(technical, fundamental) {
  const technicalScore =
    technical.signal === "BUY" ? 1 : technical.signal === "HOLD" ? 0 : -1;
  const fundamentalScore =
    fundamental.signal === "BUY" ? 1 : fundamental.signal === "HOLD" ? 0 : -1;

  const totalScore = (technicalScore + fundamentalScore) / 2;
  const score = Math.round((totalScore + 1) * 50);

  let signal, confidence;
  if (totalScore > 0.3) {
    signal = "BUY";
    confidence = "HIGH";
  } else if (totalScore < -0.3) {
    signal = "SELL";
    confidence = "HIGH";
  } else {
    signal = "HOLD";
    confidence = "MEDIUM";
  }

  const reasons = [...technical.reasons, ...fundamental.reasons].slice(0, 5);

  return { signal, confidence, score, reasons };
}

module.exports = router;
