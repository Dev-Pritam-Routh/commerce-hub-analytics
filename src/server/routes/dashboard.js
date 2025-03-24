
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-app-secret';

// Cache configuration
const cache = {
  overview: { data: null, timestamp: 0 },
  sales: { data: null, timestamp: 0 },
  users: { data: null, timestamp: 0 },
  inventory: { data: null, timestamp: 0 }
};

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Admin role check middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// Pagination middleware
const paginate = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  req.pagination = {
    page,
    limit,
    skip
  };
  
  next();
};

// GET /api/admin/dashboard/overview
router.get('/overview', auth, adminOnly, async (req, res) => {
  try {
    // Check cache first
    if (cache.overview.data && Date.now() - cache.overview.timestamp < CACHE_TTL) {
      return res.json(cache.overview.data);
    }
    
    // Calculate dashboard overview data
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('products.product', 'name price')
    .limit(10);
    
    const recentOrdersCount = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders,
        recentOrdersCount
      }
    };
    
    // Update cache
    cache.overview = {
      data: responseData,
      timestamp: Date.now()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/admin/dashboard/sales
router.get('/sales', auth, adminOnly, paginate, async (req, res) => {
  try {
    // Check cache first
    if (cache.sales.data && Date.now() - cache.sales.timestamp < CACHE_TTL) {
      return res.json(cache.sales.data);
    }
    
    const timeFrame = req.query.timeFrame || 'monthly';
    let dateFormat, groupBy, dateRange;
    
    // Define time frame settings
    switch (timeFrame) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        dateRange = 30; // Last 30 days
        break;
      case 'weekly':
        dateFormat = '%Y-W%U';
        groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        dateRange = 12; // Last 12 weeks
        break;
      case 'monthly':
      default:
        dateFormat = '%Y-%m';
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        dateRange = 12; // Last 12 months
        break;
    }
    
    // Calculate start date based on time frame
    const startDate = new Date();
    if (timeFrame === 'daily') {
      startDate.setDate(startDate.getDate() - dateRange);
    } else if (timeFrame === 'weekly') {
      startDate.setDate(startDate.getDate() - (dateRange * 7));
    } else {
      startDate.setMonth(startDate.getMonth() - dateRange);
    }
    
    // Get sales trends over time
    const salesTrends = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, isPaid: true } },
      { $group: {
          _id: groupBy,
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
      { $project: {
          _id: 0,
          date: {
            $dateToString: { format: dateFormat, date: '$createdAt' }
          },
          sales: 1,
          count: 1
        }
      }
    ]);
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $project: {
          _id: 0,
          product: { $arrayElemAt: ['$productDetails', 0] },
          totalSold: 1,
          revenue: 1
        }
      }
    ]);
    
    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: '$products' },
      { $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $group: {
          _id: '$productDetails.category',
          totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          count: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $project: {
          _id: 0,
          category: '$_id',
          totalSales: 1,
          count: 1
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        salesTrends,
        topSellingProducts,
        salesByCategory,
        timeFrame
      }
    };
    
    // Update cache
    cache.sales = {
      data: responseData,
      timestamp: Date.now()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/admin/dashboard/users
router.get('/users', auth, adminOnly, paginate, async (req, res) => {
  try {
    // Check cache first
    if (cache.users.data && Date.now() - cache.users.timestamp < CACHE_TTL) {
      return res.json(cache.users.data);
    }
    
    // User registrations over time (by month)
    const registrationsOverTime = await User.aggregate([
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: {
          _id: 0,
          date: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: 1
        }
      }
    ]);
    
    // User role distribution
    const userRoles = await User.aggregate([
      { $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          role: '$_id',
          count: 1
        }
      }
    ]);
    
    // Active users (with orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: '$user'
        }
      },
      { $count: 'activeUsers' }
    ]);
    
    const activeUsersCount = activeUsers.length > 0 ? activeUsers[0].activeUsers : 0;
    
    // User engagement (orders per user)
    const userEngagement = await Order.aggregate([
      { $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $project: {
          _id: 0,
          user: { $arrayElemAt: ['$userDetails', 0] },
          orderCount: 1,
          totalSpent: 1
        }
      },
      { $project: {
          'user.password': 0
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        registrationsOverTime,
        userRoles,
        activeUsersCount,
        userEngagement,
        totalUsers: await User.countDocuments()
      }
    };
    
    // Update cache
    cache.users = {
      data: responseData,
      timestamp: Date.now()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/admin/dashboard/inventory
router.get('/inventory', auth, adminOnly, paginate, async (req, res) => {
  try {
    // Check cache first
    if (cache.inventory.data && Date.now() - cache.inventory.timestamp < CACHE_TTL) {
      return res.json(cache.inventory.data);
    }
    
    // Low stock products (less than 10 items)
    const lowStockThreshold = 10;
    const lowStockProducts = await Product.find({ stock: { $lt: lowStockThreshold } })
      .sort({ stock: 1 })
      .populate('seller', 'name');
    
    // Products by inventory level
    const inventoryLevels = await Product.aggregate([
      { $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$stock', 10] }, then: 'Low' },
                { case: { $lt: ['$stock', 50] }, then: 'Medium' },
                { case: { $gte: ['$stock', 50] }, then: 'High' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 },
          products: { $push: { id: '$_id', name: '$name', stock: '$stock' } }
        }
      },
      { $project: {
          _id: 0,
          level: '$_id',
          count: 1,
          products: { $slice: ['$products', 5] } // Only include 5 sample products per level
        }
      }
    ]);
    
    // Most viewed products (since we don't track views in the schema, substitute with highest rated)
    const topRatedProducts = await Product.find()
      .sort({ averageRating: -1 })
      .limit(10)
      .populate('seller', 'name');
    
    // Product performance (best and worst selling)
    const productPerformance = await Order.aggregate([
      { $unwind: '$products' },
      { $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $project: {
          _id: 0,
          product: {
            id: '$productDetails._id',
            name: '$productDetails.name',
            category: '$productDetails.category',
            price: '$productDetails.price'
          },
          totalSold: 1,
          revenue: 1,
          averagePrice: { $divide: ['$revenue', '$totalSold'] }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);
    
    // Stock by category
    const stockByCategory = await Product.aggregate([
      { $group: {
          _id: '$category',
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { productCount: -1 } },
      { $project: {
          _id: 0,
          category: '$_id',
          totalStock: 1,
          productCount: 1,
          averageStock: { $divide: ['$totalStock', '$productCount'] }
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        lowStockProducts,
        inventoryLevels,
        topRatedProducts,
        productPerformance: {
          bestSelling: productPerformance.slice(0, 5),
          worstSelling: productPerformance.slice(-5).reverse()
        },
        stockByCategory
      }
    };
    
    // Update cache
    cache.inventory = {
      data: responseData,
      timestamp: Date.now()
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Clear cache if needed
router.post('/clear-cache', auth, adminOnly, (req, res) => {
  const cacheKey = req.body.key;
  
  if (cacheKey && cache[cacheKey]) {
    cache[cacheKey] = { data: null, timestamp: 0 };
    res.json({ success: true, message: `Cache for ${cacheKey} cleared successfully` });
  } else if (!cacheKey) {
    // Clear all cache
    Object.keys(cache).forEach(key => {
      cache[key] = { data: null, timestamp: 0 };
    });
    res.json({ success: true, message: 'All cache cleared successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid cache key' });
  }
});

export default router;
