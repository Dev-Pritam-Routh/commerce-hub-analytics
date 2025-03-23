import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { auth, isAdmin, isSeller } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingInfo, paymentMethod, totalAmount } = req.body;
    
    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    
    // Check product availability and update stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Create the order
    const order = new Order({
      user: req.user._id,
      items,
      shippingInfo,
      paymentMethod,
      totalAmount,
      status: 'pending'
    });
    
    await order.save();
    
    return res.status(201).json({ order });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    return res.json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get orders for a seller
router.get('/seller', isSeller, async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build the query
    const query = { 'items.seller': req.user._id };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      // If the search looks like an ObjectID, search by ID
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        // Otherwise search in user details
        query.$or = [
          { 'shippingInfo.fullName': { $regex: search, $options: 'i' } },
          { 'shippingInfo.address': { $regex: search, $options: 'i' } },
          { 'shippingInfo.city': { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    // Prepare the sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    return res.json({
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all orders
router.get('/admin', isAdmin, async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build the query
    const query = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      // If the search looks like an ObjectID, search by ID
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        // Otherwise search in user details
        query.$or = [
          { 'shippingInfo.fullName': { $regex: search, $options: 'i' } },
          { 'shippingInfo.address': { $regex: search, $options: 'i' } },
          { 'shippingInfo.city': { $regex: search, $options: 'i' } }
        ];
      }
    }
    
    // Prepare the sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get orders
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');
    
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    return res.json({
      orders,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the user is authorized to view this order
    if (!req.user.role === 'admin' && 
        !order.user.equals(req.user._id) && 
        !order.items.some(item => item.seller.equals(req.user._id))) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    return res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify permissions
    if (req.user.role !== 'admin') {
      if (req.user.role === 'seller') {
        // Sellers can only update orders that have their products
        const hasSellersItems = order.items.some(item => 
          item.seller.toString() === req.user._id.toString()
        );
        
        if (!hasSellersItems) {
          return res.status(403).json({ message: 'Not authorized to update this order' });
        }
      } else {
        // Regular users can't update order status
        return res.status(403).json({ message: 'Not authorized to update order status' });
      }
    }
    
    // Update the status
    order.status = status;
    await order.save();
    
    return res.json({ order });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
