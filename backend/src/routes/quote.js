const express = require('express');
const router = express.Router();
const { fetchQuote } = require('../services/yahooFinance');
const cache = require('../services/cache');
const logger = require('../utils/logger');

/**
 * GET /api/quote/:symbol
 * Get current quote for a symbol
 */
router.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  const cacheKey = `quote:${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  try {
    const quote = await fetchQuote(symbol);
    
    const response = {
      symbol: quote.symbol,
      current: quote.current,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      previousClose: quote.previousClose,
      volume: quote.volume,
      change: quote.change,
      changePercent: parseFloat(quote.changePercent.toFixed(2)),
      timestamp: new Date().toISOString()
    };
    
    cache.set(cacheKey, response, cache.CACHE_TTL.intraday);
    res.json(response);
    
  } catch (error) {
    logger.error(`Quote fetch failed for ${symbol}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch quote',
      message: error.message 
    });
  }
});

module.exports = router;
