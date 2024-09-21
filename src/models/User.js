import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  limit: { type: Number, required: true },
  spent: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  accountId: {
    type: Array,
    required: false,
    unique: false,
    default: [],
  },
  transactionList: {
    type: Array,
    required: false,
    default: [],
  },
  budgets: [budgetSchema],
  password: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;