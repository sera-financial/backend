import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from header
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add user payload to request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Register User
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new User({
    username,
    password: hashedPassword
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: savedUser._id });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User does not exist' });

  // Validate password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

  // Create and assign JWT
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('Authorization', `Bearer ${token}`).json({ message: 'Logged in successfully', token });
});

// Example of a protected route
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access to protected route', user: req.user });
});

export default router;
