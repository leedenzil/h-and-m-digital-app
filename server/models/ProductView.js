// Create file: server/models/ProductView.js
const mongoose = require('mongoose');

const ProductViewSchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ProductView = mongoose.model('ProductView', ProductViewSchema);

module.exports = ProductView;