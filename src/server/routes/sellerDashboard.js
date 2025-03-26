
import express from 'express';
import { auth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get seller dashboard overview
router.get('/overview', auth, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Convert string ID to ObjectId for MongoDB aggregation
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    
    // Total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const totalActiveProducts = await Product.countDocuments({ 
      seller: sellerId, 
      status: 'active' 
    });
    
    // Low stock products
    const lowStockProducts = await Product.countDocuments({
      seller: sellerId,
      stock: { $lt: 10 },
      status: 'active'
    });
    
    // Total stock
    const stockData = await Product.aggregate([
      { $match: { seller: sellerObjectId } },
      { $group: { _id: null, total: { $sum: '$stock' } } }
    ]);
    
    const totalStock = stockData.length > 0 ? stockData[0].total : 0;
    
    // Find all orders that contain products from this seller
    const allOrders = await Order.find({})
      .populate('products.product', 'seller price');
    
    // Filter orders to only include those with products from this seller
    const sellerOrders = allOrders.filter(order => {
      return order.products.some(item => {
        return item.product && 
               item.product.seller && 
               item.product.seller.toString() === sellerId;
      });
    });
    
    // Calculate total sales for this seller
    let totalSales = 0;
    sellerOrders.forEach(order => {
      order.products.forEach(item => {
        if (item.product && 
            item.product.seller && 
            item.product.seller.toString() === sellerId) {
          totalSales += item.price * item.quantity;
        }
      });
    });
    
    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = sellerOrders.filter(order => {
      return new Date(order.createdAt) >= thirtyDaysAgo;
    });
    
    res.json({
      success: true,
      data: {
        productStats: {
          totalProducts,
          totalActiveProducts,
          totalStock,
          lowStockProducts
        },
        orderStats: {
          totalOrders: sellerOrders.length,
          recentOrders: recentOrders.length,
          totalSales: totalSales
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller dashboard overview:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get seller sales data
router.get('/sales', auth, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const timeFrame = req.query.timeFrame || 'monthly';
    
    // Find all orders that contain products from this seller
    const allOrders = await Order.find({})
      .populate('products.product', 'seller price');
    
    // Filter orders to only include those with products from this seller
    const sellerOrders = allOrders.filter(order => {
      return order.products.some(item => {
        return item.product && 
               item.product.seller && 
               item.product.seller.toString() === sellerId;
      });
    });
    
    // Generate sales data based on timeframe
    const salesData = generateSalesData(sellerOrders, timeFrame, sellerId);
    
    // Order status breakdown
    const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;
    const processingOrders = sellerOrders.filter(order => order.status === 'processing').length;
    const shippedOrders = sellerOrders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = sellerOrders.filter(order => order.status === 'delivered').length;
    const cancelledOrders = sellerOrders.filter(order => order.status === 'cancelled').length;
    
    res.json({
      success: true,
      data: {
        salesData,
        orderStatusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller sales data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get recent orders for seller
router.get('/recent-orders', auth, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Find all orders that contain products from this seller
    const allOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('products.product', 'seller name price');
    
    // Filter orders to only include those with products from this seller
    const sellerOrders = allOrders.filter(order => {
      return order.products.some(item => {
        return item.product && 
               item.product.seller && 
               item.product.seller.toString() === sellerId;
      });
    }).slice(0, 4); // Only take the 4 most recent
    
    // Format orders for frontend
    const recentOrders = sellerOrders.map(order => {
      // Calculate total for this seller's products in the order
      let orderTotal = 0;
      order.products.forEach(item => {
        if (item.product && 
            item.product.seller && 
            item.product.seller.toString() === sellerId) {
          orderTotal += item.price * item.quantity;
        }
      });
      
      return {
        id: order._id,
        date: order.createdAt,
        customer: order.user ? order.user.name : 'Unknown',
        total: orderTotal,
        status: order.status
      };
    });
    
    res.json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    console.error('Error fetching recent seller orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get low stock products for seller
router.get('/low-stock', auth, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Find low stock products
    const lowStockProducts = await Product.find({
      seller: sellerId,
      stock: { $lt: 10 },
      status: 'active'
    })
    .sort({ stock: 1 })
    .limit(5);
    
    // Format for frontend
    const formattedProducts = lowStockProducts.map(product => ({
      id: product._id,
      name: product.name,
      stock: product.stock,
      threshold: 10 // Using a default threshold of 10
    }));
    
    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to generate sales data based on timeframe
function generateSalesData(orders, timeFrame, sellerId) {
  // Get current date
  const now = new Date();
  let salesData = [];
  
  if (timeFrame === 'daily') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      
      // Filter orders for this day
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toISOString().split('T')[0] === dayStr;
      });
      
      // Calculate sales for this day
      let daySales = 0;
      let dayOrders = 0;
      
      dayOrders.forEach(order => {
        dayOrders++;
        order.products.forEach(item => {
          if (item.product && 
              item.product.seller && 
              item.product.seller.toString() === sellerId) {
            daySales += item.price * item.quantity;
          }
        });
      });
      
      salesData.push({
        name: new Date(dayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales,
        orders: dayOrders
      });
    }
  } else if (timeFrame === 'weekly') {
    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - (i * 7 + 6));
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() - (i * 7));
      
      // Filter orders for this week
      const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      // Calculate sales for this week
      let weekSales = 0;
      let weekOrderCount = 0;
      
      weekOrders.forEach(order => {
        weekOrderCount++;
        order.products.forEach(item => {
          if (item.product && 
              item.product.seller && 
              item.product.seller.toString() === sellerId) {
            weekSales += item.price * item.quantity;
          }
        });
      });
      
      salesData.push({
        name: `Week ${8-i}`,
        sales: weekSales,
        orders: weekOrderCount
      });
    }
  } else {
    // Monthly (last 12 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now);
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthIndex = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      // Filter orders for this month
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year;
      });
      
      // Calculate sales for this month
      let monthSales = 0;
      let monthOrderCount = 0;
      
      monthOrders.forEach(order => {
        monthOrderCount++;
        order.products.forEach(item => {
          if (item.product && 
              item.product.seller && 
              item.product.seller.toString() === sellerId) {
            monthSales += item.price * item.quantity;
          }
        });
      });
      
      salesData.push({
        name: months[monthIndex],
        sales: monthSales,
        orders: monthOrderCount
      });
    }
  }
  
  return salesData;
}

export default router;
