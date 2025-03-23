
import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(isAdmin);

// Admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Product stats
    const totalProducts = await Product.countDocuments();
    const featuredProducts = await Product.countDocuments({ featured: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });
    
    // Get product categories
    const categoryAggregation = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const categories = {};
    categoryAggregation.forEach(cat => {
      categories[cat._id] = cat.count;
    });

    // Order stats
    const totalOrders = await Order.countDocuments();
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Sales amount
    const salesAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);
    
    const totalSales = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;
    
    // Status breakdown
    const statusAggregation = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const statusBreakdown = {};
    statusAggregation.forEach(status => {
      statusBreakdown[status._id] = status.count;
    });
    
    // Monthly sales data
    const monthlyData = await Order.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } 
        } 
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format monthly data for the frontend
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = months.map((month, index) => {
      const monthData = monthlyData.find(item => item._id === index + 1);
      return {
        name: month,
        sales: monthData ? monthData.sales : 0,
        orders: monthData ? monthData.orders : 0
      };
    });
    
    return res.json({
      userStats: {
        totalUsers,
        totalCustomers,
        totalSellers,
        newUsers
      },
      productStats: {
        totalProducts,
        featuredProducts,
        lowStockProducts,
        categories
      },
      orderStats: {
        totalOrders,
        recentOrders,
        totalSales,
        statusBreakdown
      },
      salesData
    });
  } catch (error) {
    console.error('Error in admin stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// User management routes
router.get('/users', async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await User.countDocuments(query);
    
    return res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Don't allow deactivating the last admin
    if (status === 'inactive') {
      const user = await User.findById(id);
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot deactivate the last admin account' });
        }
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Don't allow removing the last admin
    if (role !== 'admin') {
      const user = await User.findById(id);
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
          return res.status(400).json({ message: 'Cannot remove the last admin account' });
        }
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting the last admin
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin account' });
      }
    }
    
    await User.findByIdAndDelete(id);
    
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Product management routes
router.get('/products', async (req, res) => {
  try {
    const { search, category, status, seller, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (seller) {
      query.seller = seller;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Product.countDocuments(query);
    
    return res.json({
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('seller', 'name email');
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    return res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await Product.findByIdAndDelete(id);
    
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Seller management routes
router.get('/sellers', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    const query = { role: 'seller' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sellers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    // Get product count and revenue for each seller
    const sellerDetails = await Promise.all(sellers.map(async (seller) => {
      const productCount = await Product.countDocuments({ seller: seller._id });
      
      // Calculate revenue from completed orders
      const orders = await Order.find({
        'items.seller': seller._id,
        status: { $in: ['delivered', 'completed'] }
      });
      
      let revenue = 0;
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.seller.toString() === seller._id.toString()) {
            revenue += item.price * item.quantity;
          }
        });
      });
      
      return {
        ...seller.toObject(),
        products: productCount,
        revenue
      };
    }));
    
    const total = await User.countDocuments(query);
    
    return res.json({
      sellers: sellerDetails,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/sellers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedSeller = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');
    
    if (!updatedSeller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    
    return res.json(updatedSeller);
  } catch (error) {
    console.error('Error updating seller status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
