const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Mock auth for MVP - replace with real DB queries later
const watchlist = [];

/**
 * GET /api/watchlist
 * Get user's watchlist
 */
router.get('/', async (req, res) => {
  try {
    res.json({
      watchlist,
      count: watchlist.length
    });
  } catch (error) {
    logger.error('Watchlist fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

/**
 * POST /api/watchlist
 * Add symbol to watchlist
 */
router.post('/', async (req, res) => {
  const { symbol } = req.body;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }
  
  try {
    if (!watchlist.includes(symbol)) {
      watchlist.push(symbol);
    }
    
    res.json({
      message: 'Symbol added to watchlist',
      symbol,
      watchlist
    });
  } catch (error) {
    logger.error('Add to watchlist failed:', error);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

/**
 * DELETE /api/watchlist/:symbol
 * Remove symbol from watchlist
 */
router.delete('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  
  try {
    const index = watchlist.indexOf(symbol);
    if (index > -1) {
      watchlist.splice(index, 1);
    }
    
    res.json({
      message: 'Symbol removed from watchlist',
      symbol,
      watchlist
    });
  } catch (error) {
    logger.error('Remove from watchlist failed:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

module.exports = router;
