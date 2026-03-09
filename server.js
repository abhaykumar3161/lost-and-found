const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter configuration
const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env file');
    return null;
  }
  
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lost-found-simple', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  bio: { type: String, default: '' },
  address: { type: String, default: '' },
});

const User = mongoose.model('User', userSchema);

// Item Schema
const itemSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String, // 'lost' or 'found'
  itemName: String,
  category: String,
  description: String,
  location: String,
  date: Date,
  contactName: String,
  contactPhone: String,
  contactEmail: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', itemSchema);

// JWT Secret
const JWT_SECRET = 'mysecretkey123';

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// ROUTES

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!phone || phone.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a valid phone number' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      phone: phone.trim() 
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { name: user.name, email: user.email, phone: user.phone }, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { name: user.name, email: user.email, phone: user.phone }, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const { type, category, search } = req.query;
    let query = { status: 'active' };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
app.post('/api/items', auth, async (req, res) => {
  try {
    const { type, itemName, category, description, location, date, contactName, contactPhone, contactEmail } = req.body;
    
    // Validation
    if (!type || !['lost', 'found'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "lost" or "found"' });
    }
    if (!itemName || itemName.trim().length < 2) {
      return res.status(400).json({ error: 'Item name must be at least 2 characters' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    if (!description || description.trim().length < 10) {
      return res.status(400).json({ error: 'Description must be at least 10 characters' });
    }
    if (!location || location.trim().length < 2) {
      return res.status(400).json({ error: 'Location is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }
    if (!contactName || !contactPhone || !contactEmail) {
      return res.status(400).json({ error: 'Contact information is required' });
    }
    
    const item = new Item({ ...req.body, userId: req.userId });
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's items
app.get('/api/my-items', auth, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
app.put('/api/items/:id', auth, async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete item
app.delete('/api/items/:id', auth, async (req, res) => {
  try {
    await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Item.countDocuments();
    const lost = await Item.countDocuments({ type: 'lost', status: 'active' });
    const found = await Item.countDocuments({ type: 'found', status: 'active' });
    res.json({ total, lost, found });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP with 10 minute expiry
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    
    // Send OTP via email
    const transporter = createEmailTransporter();
    
    if (transporter) {
      try {
        const mailOptions = {
          from: `"Lost & Found System" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '🔐 Your Verification OTP - Lost & Found',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 40px 30px; }
                .otp-box { background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%); border-left: 5px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
                .otp-code { font-size: 36px; font-weight: bold; color: #856404; letter-spacing: 8px; margin: 10px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔍 Lost & Found System</h1>
                  <p>Account Verification</p>
                </div>
                <div class="content">
                  <h2>Hello ${user.name}!</h2>
                  <p>You have requested to verify your account. Please use the OTP code below:</p>
                  
                  <div class="otp-box">
                    <p style="margin: 0; color: #856404; font-weight: bold;">Your Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #856404;">Valid for 10 minutes</p>
                  </div>
                  
                  <p><strong>Important:</strong></p>
                  <ul>
                    <li>This OTP is valid for 10 minutes only</li>
                    <li>Do not share this code with anyone</li>
                    <li>If you didn't request this, please ignore this email</li>
                  </ul>
                  
                  <p>Thank you for using Lost & Found Management System!</p>
                </div>
                <div class="footer">
                  <p>© 2024 Lost & Found Management System. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        
        res.json({ 
          message: 'OTP sent to your email successfully',
          emailSent: true
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Still return success but show OTP for demo
        res.json({ 
          message: 'Email service unavailable. OTP shown for demo.',
          otp: otp,
          emailSent: false
        });
      }
    } else {
      // Email not configured, return OTP for demo
      console.log(`OTP for ${email}: ${otp}`);
      res.json({ 
        message: 'Email not configured. OTP shown for demo.',
        otp: otp,
        emailSent: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ error: 'No OTP requested' });
    }
    
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one' });
    }
    
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const itemCount = await Item.countDocuments({ userId: req.userId });
    const lostCount = await Item.countDocuments({ userId: req.userId, type: 'lost' });
    const foundCount = await Item.countDocuments({ userId: req.userId, type: 'found' });
    const resolvedCount = await Item.countDocuments({ userId: req.userId, status: 'resolved' });
    
    res.json({
      user,
      stats: {
        totalItems: itemCount,
        lostItems: lostCount,
        foundItems: foundCount,
        resolvedItems: resolvedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { name, phone, bio, address, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
      
      user.password = await bcrypt.hash(newPassword, 10);
    }
    
    // Update other fields
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (address !== undefined) user.address = address.trim();
    
    await user.save();
    
    const updatedUser = await User.findById(req.userId).select('-password -otp -otpExpiry');
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Lost & Found API Running' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
