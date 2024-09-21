import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: false,
  },
  merchantId: {
    type: String,
    required: false,
  },
  payerId: {
    type: String,
    required: false,
  },
  purchaseDate: {
    type: Date,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: false,
  },
  medium: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
}, { 
  timestamps: true 
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;