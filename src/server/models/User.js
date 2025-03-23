
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create a default admin account if not exists
UserSchema.statics.createDefaultAdmin = async function() {
  try {
    // Fix: Make sure the email is correct with @ symbol
    const adminEmail = 'pritamrouth2003@gmail.com';
    console.log('Checking for admin account with email:', adminEmail);
    
    const admin = await this.findOne({ email: adminEmail });
    
    if (!admin) {
      console.log('Creating default admin account with email:', adminEmail);
      await this.create({
        name: 'Admin',
        email: adminEmail,
        password: 'admin1234',
        role: 'admin'
      });
      console.log('Default admin account created successfully');
    } else {
      console.log('Admin account already exists');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const User = mongoose.model('User', UserSchema);
export default User;
