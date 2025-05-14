
// Cache configuration
export const cache = {
  overview: { data: null, timestamp: 0 },
  sales: { data: null, timestamp: 0 },
  users: { data: null, timestamp: 0 },
  inventory: { data: null, timestamp: 0 }
};

// Cache TTL in milliseconds (5 minutes)
export const CACHE_TTL = 5 * 60 * 1000;

// Check if cache is valid
export const isValidCache = (key) => {
  return cache[key].data && Date.now() - cache[key].timestamp < CACHE_TTL;
};

// Update cache
export const updateCache = (key, data) => {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
};

// Clear cache
export const clearCache = (key) => {
  if (key) {
    cache[key] = { data: null, timestamp: 0 };
  } else {
    Object.keys(cache).forEach(cacheKey => {
      cache[cacheKey] = { data: null, timestamp: 0 };
    });
  }
};

/**
 * Returns the cached data for a given key if it exists and is valid.
 * @param {string} key
 * @returns {*} Cached data or null if not present/expired
 */
export const getCacheData = (key) => {
  if (isValidCache(key)) {
    return cache[key].data;
  }
  return null;
};
