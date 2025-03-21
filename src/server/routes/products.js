
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

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

// Middleware to check seller or admin role
const sellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Seller or Admin only.' });
  }
  next();
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, sort } = req.query;
    
    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Only show active products
    query.status = 'active';
    
    // Build sort options
    let sortOptions = {};
    
    if (sort) {
      switch (sort) {
        case 'priceAsc':
          sortOptions = { price: 1 };
          break;
        case 'priceDesc':
          sortOptions = { price: -1 };
          break;
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'rating':
          sortOptions = { averageRating: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 };
    }
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .populate('seller', 'name');
    
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name')
      .populate('ratings.user', 'name');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a product (seller only)
router.post('/', auth, sellerOrAdmin, async (req, res) => {
  try {
    const { name, description, price, discountedPrice, category, images, stock, featured } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      discountedPrice: discountedPrice || price,
      category,
      images,
      stock,
      featured: featured || false,
      seller: req.user.userId
    });
    
    const product = await newProduct.save();
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update a product (seller or admin only)
router.put('/:id', auth, sellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if user is the seller of the product or an admin
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Not your product.' });
    }
    
    const { name, description, price, discountedPrice, category, images, stock, featured, status } = req.body;
    
    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountedPrice) product.discountedPrice = discountedPrice;
    if (category) product.category = category;
    if (images) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (featured !== undefined) product.featured = featured;
    if (status) product.status = status;
    
    product.updatedAt = Date.now();
    
    const updatedProduct = await product.save();
    
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a product (seller or admin only)
router.delete('/:id', auth, sellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if user is the seller of the product or an admin
    if (product.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Not your product.' });
    }
    
    await Product.findByIdAndRemove(req.params.id);
    
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add product rating and review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if user has already reviewed this product
    const alreadyReviewed = product.ratings.find(
      r => r.user.toString() === req.user.userId
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed' });
    }
    
    const newRating = {
      user: req.user.userId,
      rating: Number(rating),
      review
    };
    
    product.ratings.push(newRating);
    
    await product.save();
    
    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get seller products
router.get('/seller/products', auth, sellerOrAdmin, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.userId });
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get product stats for seller
router.get('/seller/stats', auth, sellerOrAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ seller: req.user.userId });
    const totalActiveProducts = await Product.countDocuments({ seller: req.user.userId, status: 'active' });
    
    // Convert string ID to ObjectId for MongoDB aggregation
    const sellerId = mongoose.Types.ObjectId(req.user.userId);
    
    const totalStock = await Product.aggregate([
      { $match: { seller: sellerId } },
      { $group: { _id: null, total: { $sum: '$stock' } } }
    ]);
    
    const lowStockProducts = await Product.countDocuments({
      seller: req.user.userId,
      stock: { $lt: 10 },
      status: 'active'
    });
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        totalActiveProducts,
        totalStock: totalStock.length > 0 ? totalStock[0].total : 0,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
