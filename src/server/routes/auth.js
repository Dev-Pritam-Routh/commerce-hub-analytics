
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce-app-secret';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    const { name, email, password, role, phone, address } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      address
    });
    
    await user.save();
    console.log('New user created:', { name, email, role });
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    console.log('User authenticated successfully:', { id: user._id, name: user.name, email: user.email, role: user.role });
    
    // Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d'
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Get user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('User not found with id:', decoded.userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('User found:', user);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
});

export default router;
