import axios from 'axios';
import express from 'express';
import cors from 'cors'; // Import cors
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { dbConnect } from './app/lib/db.js';
import dotenv from 'dotenv';
import User from './models/User.js';

const router = express.Router();
router.use(cors(
    {
        origin: '*',
        credentials: true,
    }
));

// Ensure database connection
dbConnect().catch(err => {
  console.error('Failed to connect to the database:', err);
});



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

  const { email, password, fullname } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
    let firstName = fullname.split(' ')[0];
    let lastName = fullname.split(' ')[1];
  // Create new user
  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: savedUser._id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
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

// Fetch account details
router.get('/account', authenticateToken, async (req, res) => {
  // get user id from token
  const userId = req.user._id;
  console.log(userId);
  try {
    const account = await User.findById(userId).select('-password'); // Exclude password field

    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.status(200).json({ user: account });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching account details', error: err.message });
  }
});

router.put('/account/updateId', authenticateToken, async (req, res) => {
    const { accountId } = req.body;
    const userId = req.user._id;
    console.log(accountId);
    console.log(userId);

    try {
        const user = await User.findById(userId);
        // add accountId to the user's accountId array
        user.accountId.push(accountId);
        await user.save();
    
        res.status(200).json({ message: 'Account ID updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating account ID', error: err.message });
    }
});



export default router;
