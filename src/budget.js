import express from 'express';
import User from './models/User.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';

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
  
const router = express.Router();
router.use(cors(
    {
        origin: '*',
        credentials: true,
    }
));

// Create a new budget
router.post('/create', authenticateToken, async (req, res) => {
  const { userId, name, limit, color } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    user.budgets.push({ name, limit });
    await user.save();
    res.status(201).send(user.budgets);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get all budgets
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    console.log("Getting budgets for user: ", req.params.userId);
    const user = await User.findById(req.params.userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).send('User not found');
    }
    console.log("User found");
    console.log("User budgets: ", user.budgets);
    res.status(200).send(user.budgets);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// Update a budget
router.post('/update/:userId/:budgetId', authenticateToken, async (req, res) => {
  const { userId, budgetId } = req.params;
  const { name, limit, color } = req.body;
  if (!userId) {
    return res.status(400).send('userId is required');
  }
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (limit !== undefined) updateFields.limit = limit;
  if (color !== undefined) updateFields.color = color;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    const budget = user.budgets.find(budget => budget._id.equals(budgetId));
    if (!budget) {
      return res.status(404).send('Budget not found');
    }
    Object.assign(budget, updateFields);
    await user.save();
    res.status(200).send(user.budgets);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;