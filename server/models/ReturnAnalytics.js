// Create file: server/models/ReturnAnalytics.js
const mongoose = require('mongoose');

const ReturnAnalyticsSchema = new mongoose.Schema({
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
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  reason: String,
  rewardPointsEarned: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ReturnAnalytics = mongoose.model('ReturnAnalytics', ReturnAnalyticsSchema);

module.exports = ReturnAnalytics;