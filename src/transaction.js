import axios from 'axios';
import express from 'express';
import cors from 'cors'; // Import cors
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { dbConnect } from './app/lib/db.js';
import dotenv from 'dotenv';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

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
    const userId = req.user._id; // Get user ID from req.user
    const user = await User.findById(userId).populate('transactionList');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = user.transactionList;
    console.log(transactions);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
});

// route to create transactions (bulk upload)
router.post('/sync', authenticateToken, async (req, res) => {
  console.log("sync endpoint hit");
  console.log("Request body:", req.body); // Log the request body

  try {
    const userId = req.user._id; // Get user ID from req.user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.body.data || !Array.isArray(req.body.data)) {
      return res.status(400).json({ message: 'Invalid data format. Expected an array of transactions.' });
    }

    const transactionPromises = req.body.data.map(async (transaction) => {
      console.log(transaction);

      transaction.purchase_date = new Date(transaction.purchase_date);
      console.log(transaction.purchase_date);

      transaction.merchant_id = transaction.merchantId;

      // push to database
      const createdTransaction = await Transaction.create(transaction);
      user.transactionList.push(createdTransaction._id);
    });

    await Promise.all(transactionPromises);
    await user.save();

    res.status(201).json(req.body);
  } catch (error) {
    console.error('Error creating transactions:', error);
    res.status(500).json({ message: 'Error creating transactions', error: error.message });
  }
});


// Function to assemble transaction
const assembleTransaction = (transaction) => {
  return {
    _id: transaction._id,
    merchant_id: transaction.merchant_id,
    medium: transaction.medium,
    amount: transaction.amount,
    description: transaction.description,
    payee_id: transaction.payee_id,
    payer_id: transaction.payer_id,
    purchase_date: transaction.purchase_date,
    status: transaction.status,
    type: transaction.type,
  };
};

export default router;
