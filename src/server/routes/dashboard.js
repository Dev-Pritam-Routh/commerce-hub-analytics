
import express from 'express';
import { auth, adminOnly, paginate } from '../middleware/auth.js';
import { getDashboardOverview } from '../controllers/dashboardOverview.js';
import { getSalesData } from '../controllers/dashboardSales.js';
import { getUsersData } from '../controllers/dashboardUsers.js';
import { getInventoryData } from '../controllers/dashboardInventory.js';
import { clearDashboardCache } from '../controllers/dashboardCache.js';

const router = express.Router();

// GET /api/admin/dashboard/overview
router.get('/overview', auth, adminOnly, getDashboardOverview);

// GET /api/admin/dashboard/sales
router.get('/sales', auth, adminOnly, paginate, getSalesData);

// GET /api/admin/dashboard/users
router.get('/users', auth, adminOnly, paginate, getUsersData);

// GET /api/admin/dashboard/inventory
router.get('/inventory', auth, adminOnly, paginate, getInventoryData);

// Clear cache if needed
router.post('/clear-cache', auth, adminOnly, clearDashboardCache);

export default router;
