
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string from environment or fallback
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://pritamrouth2003:FUsM0dNuQo2Qaxft@cluster0.kf6y8.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0";

// Sample data for initial setup
const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB for setup');
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin1234', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'pritamrouth2003@gmail.com',
      password: adminPassword,
      role: 'admin'
    });
    
    console.log('Created admin user');
    
    // Create sample sellers
    const sellerPassword = await bcrypt.hash('seller1234', 10);
    const sellers = await User.insertMany([
      {
        name: 'Tech Store',
        email: 'tech@example.com',
        password: sellerPassword,
        role: 'seller',
        phone: '123-456-7890',
        address: {
          street: '123 Tech Street',
          city: 'Tech City',
          state: 'TS',
          postalCode: '12345',
          country: 'USA'
        }
      },
      {
        name: 'Fashion Shop',
        email: 'fashion@example.com',
        password: sellerPassword,
        role: 'seller',
        phone: '123-456-7891',
        address: {
          street: '456 Fashion Avenue',
          city: 'Fashion City',
          state: 'FS',
          postalCode: '54321',
          country: 'USA'
        }
      }
    ]);
    
    console.log('Created sample sellers');
    
    // Create sample users
    const userPassword = await bcrypt.hash('user1234', 10);
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: userPassword,
        role: 'user',
        phone: '123-456-7892',
        address: {
          street: '789 User Lane',
          city: 'User City',
          state: 'UC',
          postalCode: '67890',
          country: 'USA'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: userPassword,
        role: 'user',
        phone: '123-456-7893',
        address: {
          street: '012 User Drive',
          city: 'User Town',
          state: 'UT',
          postalCode: '09876',
          country: 'USA'
        }
      }
    ]);
    
    console.log('Created sample users');
    
    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and long battery life.',
        price: 199.99,
        discountedPrice: 149.99,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        stock: 50,
        seller: sellers[0]._id,
        featured: true,
        averageRating: 4.5
      },
      {
        name: 'Smartphone Flagship Model',
        description: 'Latest flagship smartphone with cutting-edge features and high-performance specs.',
        price: 999.99,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        stock: 25,
        seller: sellers[0]._id,
        featured: true,
        averageRating: 4.8
      },
      {
        name: 'Designer T-Shirt',
        description: 'Premium cotton t-shirt with modern design and comfortable fit.',
        price: 49.99,
        discountedPrice: 39.99,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        stock: 100,
        seller: sellers[1]._id,
        featured: false,
        averageRating: 4.2
      },
      {
        name: 'Smart Watch',
        description: 'Fitness and health tracking smart watch with heart rate monitor and GPS.',
        price: 299.99,
        discountedPrice: 249.99,
        category: 'Electronics',
        images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        stock: 30,
        seller: sellers[0]._id,
        featured: true,
        averageRating: 4.6
      },
      {
        name: 'Designer Jeans',
        description: 'Premium quality jeans with perfect fit and durability.',
        price: 79.99,
        category: 'Clothing',
        images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'],
        stock: 75,
        seller: sellers[1]._id,
        featured: false,
        averageRating: 4.3
      },
    ]);
    
    console.log('Created sample products');
    
    // Create sample orders
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const orders = await Order.insertMany([
      {
        user: users[0]._id,
        products: [
          {
            product: products[0]._id,
            name: products[0].name,
            price: products[0].discountedPrice,
            quantity: 1
          },
          {
            product: products[3]._id,
            name: products[3].name,
            price: products[3].discountedPrice,
            quantity: 1
          }
        ],
        shippingAddress: {
          street: users[0].address.street,
          city: users[0].address.city,
          state: users[0].address.state,
          postalCode: users[0].address.postalCode,
          country: users[0].address.country
        },
        paymentMethod: 'credit_card',
        taxPrice: 39.99,
        shippingPrice: 10.00,
        totalPrice: 449.97,
        isPaid: true,
        paidAt: oneWeekAgo,
        isDelivered: true,
        deliveredAt: new Date(),
        status: 'delivered'
      },
      {
        user: users[1]._id,
        products: [
          {
            product: products[2]._id,
            name: products[2].name,
            price: products[2].discountedPrice,
            quantity: 2
          }
        ],
        shippingAddress: {
          street: users[1].address.street,
          city: users[1].address.city,
          state: users[1].address.state,
          postalCode: users[1].address.postalCode,
          country: users[1].address.country
        },
        paymentMethod: 'paypal',
        taxPrice: 7.99,
        shippingPrice: 5.00,
        totalPrice: 92.97,
        isPaid: true,
        paidAt: new Date(),
        isDelivered: false,
        status: 'processing'
      }
    ]);
    
    console.log('Created sample orders');
    
    console.log('Database setup completed successfully');
    
    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();
