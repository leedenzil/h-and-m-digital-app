// Create file: server/models/ARUsage.js
const mongoose = require('mongoose');

const ARUsageSchema = new mongoose.Schema({
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
  duration: {
    type: Number, // Time in seconds
    default: 0
  },
  convertedToPurchase: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ARUsage = mongoose.model('ARUsage', ARUsageSchema);

module.exports = ARUsage;