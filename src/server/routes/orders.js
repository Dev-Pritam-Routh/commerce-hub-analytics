import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = 'ecommerce-app-secret';

// Middleware to check authentication
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
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
};

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const {
      products,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;
    
    if (products && products.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }
    
    // Create new order
    const order = new Order({
      user: req.user.userId,
      products,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });
    
    // Update product stock
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }
    
    const createdOrder = await order.save();
    
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders (admin only)
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user orders
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate('products.product', 'name images');
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('products.product', 'name price images seller');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is admin, order owner, or seller of products in the order
    const isSeller = order.products.some(item => {
      return item.product.seller && item.product.seller.toString() === req.user.userId;
    });
    
    if (req.user.userId !== order.user._id.toString() && req.user.role !== 'admin' && !isSeller) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status (admin or seller)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'seller');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user is admin or seller of products in the order
    const isSeller = order.products.some(item => {
      return item.product.seller && item.product.seller.toString() === req.user.userId;
    });
    
    if (req.user.role !== 'admin' && !isSeller) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    order.status = status;
    
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order payment status (admin only)
router.put('/:id/pay', auth, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };
    
    const updatedOrder = await order.save();
    
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get seller orders
router.get('/seller/orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied. Seller only.' });
    }
    
    // Find all orders that contain products from this seller
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price seller');
    
    // Filter orders to only include those with products from this seller
    const sellerOrders = orders.filter(order => {
      return order.products.some(item => {
        return item.product.seller && item.product.seller.toString() === req.user.userId;
      });
    });
    
    res.json({ success: true, orders: sellerOrders });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order stats for admin
router.get('/stats/admin', auth, adminOnly, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Orders in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Total sales amount
    const salesData = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const totalSales = salesData.length > 0 ? salesData[0].total : 0;
    
    // Orders by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    res.json({
      success: true,
      stats: {
        totalOrders,
        recentOrders,
        totalSales,
        statusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get order stats for seller
router.get('/stats/seller', auth, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied. Seller only.' });
    }
    
    // Find all orders
    const allOrders = await Order.find({})
      .populate('products.product', 'seller price');
    
    // Filter orders to only include those with products from this seller
    const sellerOrders = allOrders.filter(order => {
      return order.products.some(item => {
        return item.product.seller && item.product.seller.toString() === req.user.userId;
      });
    });
    
    // Calculate total sales for this seller
    let totalSales = 0;
    
    sellerOrders.forEach(order => {
      order.products.forEach(item => {
        if (item.product.seller && item.product.seller.toString() === req.user.userId) {
          totalSales += item.price * item.quantity;
        }
      });
    });
    
    // Orders in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = sellerOrders.filter(order => {
      return new Date(order.createdAt) >= thirtyDaysAgo;
    });
    
    // Count orders by status
    const pendingOrders = sellerOrders.filter(order => order.status === 'pending').length;
    const processingOrders = sellerOrders.filter(order => order.status === 'processing').length;
    const shippedOrders = sellerOrders.filter(order => order.status === 'shipped').length;
    const deliveredOrders = sellerOrders.filter(order => order.status === 'delivered').length;
    
    res.json({
      success: true,
      stats: {
        totalOrders: sellerOrders.length,
        recentOrders: recentOrders.length,
        totalSales,
        statusBreakdown: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller order stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
