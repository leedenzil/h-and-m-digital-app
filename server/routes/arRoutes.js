// Create a new file: server/routes/arRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Record AR try-on event
router.post('/try-on', auth, async (req, res) => {
  const { productId, duration, convertedToPurchase } = req.body;
  
  try {
    // Create AR Usage model if it doesn't exist
    if (!req.app.locals.db.models.ARUsage) {
      const arUsageSchema = new mongoose.Schema({
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
      
      req.app.locals.db.model('ARUsage', arUsageSchema);
    }
    
    const ARUsage = req.app.locals.db.models.ARUsage;
    
    // Record AR usage
    const arUsage = new ARUsage({
      user: req.user.id,
      product: productId,
      duration,
      convertedToPurchase,
      timestamp: Date.now()
    });
    
    await arUsage.save();
    
    // Update Product if converted to purchase
    if (convertedToPurchase) {
      const product = await Product.findById(productId);
      if (product) {
        // You could increment a conversion counter here if you add it to the Product model
        product.popularity += 5; // Bonus popularity for AR-influenced purchases
        await product.save();
      }
    }
    
    res.json({ success: true, message: 'AR try-on recorded successfully' });
  } catch (error) {
    console.error('Error recording AR usage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get AR usage statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const ARUsage = req.app.locals.db.models.ARUsage;
    
    if (!ARUsage) {
      return res.json([]);
    }
    
    const stats = await ARUsage.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.user.id) } },
      { $group: {
        _id: '$product',
        totalUsage: { $sum: '$duration' },
        usageCount: { $sum: 1 },
        conversions: { $sum: { $cond: ['$convertedToPurchase', 1, 0] } }
      }},
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }},
      { $unwind: '$productDetails' },
      { $project: {
        _id: 1,
        productName: '$productDetails.name',
        category: '$productDetails.category',
        totalUsage: 1,
        usageCount: 1,
        conversions: 1,
        conversionRate: { $divide: ['$conversions', '$usageCount'] }
      }}
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching AR stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;