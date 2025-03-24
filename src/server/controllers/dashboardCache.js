
import { cache, clearCache } from '../utils/cache.js';

export const clearDashboardCache = (req, res) => {
  const cacheKey = req.body.key;
  
  if (cacheKey && cache[cacheKey]) {
    clearCache(cacheKey);
    res.json({ success: true, message: `Cache for ${cacheKey} cleared successfully` });
  } else if (!cacheKey) {
    // Clear all cache
    clearCache();
    res.json({ success: true, message: 'All cache cleared successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid cache key' });
  }
};
