
import User from '../models/User.js';
import Order from '../models/Order.js';
import { isValidCache, updateCache, getCacheData } from '../utils/cache.js';

export const getDashboardOverview = async (req, res) => {
  try {
    // Check cache first
    const cachedOverview = getCacheData('overview');
    if (cachedOverview) {
      return res.json(cachedOverview);
    }
    
    // Calculate dashboard overview data
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Calculate total revenue - Fixed to ensure we get a number even if no orders
    const revenueData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    let totalRevenue = 0;
    if (revenueData && revenueData.length > 0) {
      totalRevenue = revenueData[0].totalRevenue || 0;
    }
    
    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .limit(10);
    
    const recentOrdersCount = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get order status distribution for the dashboard
    const orderStatusData = await Order.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: '$count'
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        recentOrders,
        recentOrdersCount,
        orderStatusData
      }
    };
    
    // Update cache
    updateCache('overview', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
