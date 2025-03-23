
import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to protect admin routes
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ecommerce-app-secret');
    console.log('Decoded token:', decoded);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    
    console.log('User found:', user);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};

// Get all users - admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all users');
    const users = await User.find().select('-password');
    console.log(`Found ${users.length} users`);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all sellers - admin only
// Important fix: This route must be defined before the /:id route to avoid the conflict
router.get('/sellers', adminAuth, async (req, res) => {
  try {
    console.log('Fetching all sellers from database');
    const sellers = await User.find({ role: 'seller' }).select('-password');
    console.log(`Found ${sellers.length} sellers`);
    res.json({ success: true, sellers });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user by ID - admin only
router.get('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`Fetching user with ID: ${req.params.id}`);
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create a new user - admin only
router.post('/', adminAuth, async (req, res) => {
  try {
    console.log('Creating new user:', req.body);
    const { name, email, password, role, phone, address } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      address,
      status: 'active'
    });
    
    await user.save();
    console.log('New user created:', { name, email, role });
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user - admin only
router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`Updating user with ID: ${req.params.id}`);
    const { name, email, role, phone, address, status } = req.body;
    
    // Find user
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email is already taken' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (status) user.status = status;
    
    await user.save();
    console.log('User updated successfully');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user status - admin only
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    console.log(`Updating status for user with ID: ${req.params.id}`);
    const { status } = req.body;
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    
    // Find user
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Can't deactivate admin accounts
    if (user.role === 'admin' && status === 'inactive') {
      return res.status(400).json({ success: false, message: 'Cannot deactivate admin accounts' });
    }
    
    // Update status
    user.status = status;
    await user.save();
    console.log(`User status updated to ${status}`);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user - admin only
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    console.log(`Deleting user with ID: ${req.params.id}`);
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Can't delete admin accounts
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin accounts' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    console.log('User deleted successfully');
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change password - admin only
router.put('/:id/password', adminAuth, async (req, res) => {
  try {
    console.log(`Changing password for user with ID: ${req.params.id}`);
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    
    // Find user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    console.log('Password changed successfully');
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
