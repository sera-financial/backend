import mongoose from 'mongoose';

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
    type: String,
    required: false,
    unique: false,
  },
  transactionList: {
    type: Array,
    required: false,
    default: [],
  },
  password: { 
    type: String, 
    required: true 
  },

}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;