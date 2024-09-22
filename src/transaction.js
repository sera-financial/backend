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


// Route to get all user transactions
router.get('/user-transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('transactionList');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = user.transactionList;
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});


export default router;
