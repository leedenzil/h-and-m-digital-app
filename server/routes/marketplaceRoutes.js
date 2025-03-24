// Update marketplaceRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all marketplace products
router.get('/', async (req, res) => {
  try {
    // Get query parameters for filtering
    const { 
      category, 
      minPrice, 
      maxPrice, 
      isSecondHand,
      fromSubscription,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    const query = {};
    
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (isSecondHand !== undefined) {
      query.isSecondHand = isSecondHand === 'true';
    }
    
    if (fromSubscription !== undefined) {
      query.fromSubscription = fromSubscription === 'true';
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Product.countDocuments(query);
    
    console.log(`Found ${products.length} products for marketplace`);
    
    res.json({
      products,
      totalProducts: total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record product view
router.post('/view', auth, async (req, res) => {
  const { productId } = req.body;
  
  try {
    // Create ProductView model if it doesn't exist
    if (!req.app.locals.db.models.ProductView) {
      const productViewSchema = new mongoose.Schema({
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
      
      req.app.locals.db.model('ProductView', productViewSchema);
    }
    
    const ProductView = req.app.locals.db.models.ProductView;
    
    // Record product view
    const productView = new ProductView({
      user: req.user.id,
      product: productId,
      timestamp: Date.now()
    });
    
    await productView.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording product view:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record product purchase
router.post('/purchase', auth, async (req, res) => {
  const { 
    productId, 
    quantity = 1, 
    useRewardPoints = false,
    rewardPointsUsed = 0 
  } = req.body;
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create Purchase model if it doesn't exist
    if (!req.app.locals.db.models.Purchase) {
      const purchaseSchema = new mongoose.Schema({
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
      
      req.app.locals.db.model('Purchase', purchaseSchema);
    }
    
    const Purchase = req.app.locals.db.models.Purchase;
    
    // Calculate reward points earned/used
    let rewardPointsEarned = 0;
    
    if (useRewardPoints) {
      // Check if user has enough reward points
      if (user.rewardPoints < rewardPointsUsed) {
        return res.status(400).json({ message: 'Insufficient reward points' });
      }
      
      // Deduct reward points
      user.rewardPoints -= rewardPointsUsed;
    } else {
      // Add reward points (10 points per dollar)
      rewardPointsEarned = Math.round(product.price * quantity * 10);
      user.rewardPoints += rewardPointsEarned;
    }
    
    // Record purchase
    const purchase = new Purchase({
      user: req.user.id,
      product: productId,
      quantity,
      price: product.price,
      useRewardPoints,
      rewardPointsUsed,
      rewardPointsEarned,
      timestamp: Date.now()
    });
    
    await purchase.save();
    await user.save();
    
    // Update product popularity
    product.popularity += quantity;
    await product.save();
    
    res.json({
      success: true,
      purchase,
      newRewardPointsBalance: user.rewardPoints
    });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;