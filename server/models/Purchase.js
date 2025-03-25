// Update the Purchase model in server/models/Purchase.js

const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // Add orderId field to group purchases together
  orderId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  useRewardPoints: {
    type: Boolean,
    default: false
  },
  rewardPointsUsed: {
    type: Number,
    default: 0
  },
  rewardPointsEarned: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;