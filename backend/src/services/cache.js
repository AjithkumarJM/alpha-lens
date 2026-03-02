const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Cache TTL values from environment or defaults
const CACHE_TTL = {
  intraday: parseInt(process.env.CACHE_TTL_INTRADAY) || 300,
  daily: parseInt(process.env.CACHE_TTL_DAILY) || 86400,
  analysis: parseInt(process.env.CACHE_TTL_ANALYSIS) || 86400,
  fundamentals: parseInt(process.env.CACHE_TTL_FUNDAMENTALS) || 604800
};

// Initialize cache
const cache = new NodeCache({
  stdTTL: CACHE_TTL.daily,
  checkperiod: 120,
  useClones: false
});

/**
 * Get value from cache
 */
function get(key) {
  const value = cache.get(key);
  if (value) {
    logger.debug(`Cache hit: ${key}`);
  } else {
    logger.debug(`Cache miss: ${key}`);
  }
  return value;
}

/**
 * Set value in cache
 */
function set(key, value, ttl = null) {
  const success = cache.set(key, value, ttl || CACHE_TTL.daily);
  if (success) {
    logger.debug(`Cache set: ${key} (TTL: ${ttl || CACHE_TTL.daily}s)`);
  }
  return success;
}

/**
 * Delete key from cache
 */
function del(key) {
  return cache.del(key);
}

/**
 * Clear all cache
 */
function flush() {
  cache.flushAll();
  logger.info('Cache flushed');
}

/**
 * Get cache statistics
 */
function getStats() {
  return cache.getStats();
}

module.exports = {
  get,
  set,
  del,
  flush,
  getStats,
  CACHE_TTL
};
