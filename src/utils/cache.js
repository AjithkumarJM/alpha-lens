import { openDB } from 'idb'

const DB_NAME = 'StockMarketDB'
const DB_VERSION = 1
const STORE_NAME = 'cache'

// Initialize IndexedDB
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

/**
 * Save data to IndexedDB cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlMinutes - Time to live in minutes (default: 5)
 */
export async function setCache(key, data, ttlMinutes = 5) {
  try {
    const db = await initDB()
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000
    await db.put(STORE_NAME, { data, expiresAt }, key)
  } catch (error) {
    console.warn('IndexedDB cache write failed:', error)
    // Fallback to localStorage
    try {
      const expiresAt = Date.now() + ttlMinutes * 60 * 1000
      localStorage.setItem(key, JSON.stringify({ data, expiresAt }))
    } catch (e) {
      console.warn('localStorage fallback failed:', e)
    }
  }
}

/**
 * Get data from IndexedDB cache
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired/not found
 */
export async function getCache(key) {
  try {
    const db = await initDB()
    const cached = await db.get(STORE_NAME, key)
    
    if (!cached) {
      return null
    }
    
    if (cached.expiresAt < Date.now()) {
      // Expired, delete it
      await db.delete(STORE_NAME, key)
      return null
    }
    
    return cached.data
  } catch (error) {
    console.warn('IndexedDB cache read failed:', error)
    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      const cached = JSON.parse(item)
      if (cached.expiresAt < Date.now()) {
        localStorage.removeItem(key)
        return null
      }
      
      return cached.data
    } catch (e) {
      console.warn('localStorage fallback failed:', e)
      return null
    }
  }
}

/**
 * Clear all cache
 */
export async function clearCache() {
  try {
    const db = await initDB()
    await db.clear(STORE_NAME)
  } catch (error) {
    console.warn('Cache clear failed:', error)
  }
}

/**
 * Delete specific cache entry
 * @param {string} key - Cache key
 */
export async function deleteCache(key) {
  try {
    const db = await initDB()
    await db.delete(STORE_NAME, key)
  } catch (error) {
    console.warn('Cache delete failed:', error)
  }
}
