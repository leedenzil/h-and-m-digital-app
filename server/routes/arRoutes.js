// server/routes/arRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Record AR try-on event
router.post('/try-on', auth, async (req, res) => {
  const { productId, duration, convertedToPurchase } = req.body;
  
  // Validate input
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  
  try {
    // Get or create the ARUsage model
    const ARUsage = mongoose.models.ARUsage || mongoose.model('ARUsage', new mongoose.Schema({
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
        type: Number,
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
    }));
    
    // Record AR usage
    const arUsage = new ARUsage({
      user: req.user.id,
      product: productId,
      duration: duration || 0,
      convertedToPurchase: convertedToPurchase || false,
      timestamp: Date.now()
    });
    
    await arUsage.save();
    
    res.json({ 
      success: true, 
      message: 'AR try-on recorded successfully',
      arUsage: {
        id: arUsage._id,
        duration: arUsage.duration,
        timestamp: arUsage.timestamp
      }
    });
  } catch (error) {
    console.error('Error recording AR usage:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's AR usage statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get or create the ARUsage model
    const ARUsage = mongoose.models.ARUsage || mongoose.model('ARUsage', new mongoose.Schema({
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
        type: Number,
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
    }));
    
    // Check if user ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    // Aggregate AR usage stats for this user
    // FIXED: Use 'new' keyword with mongoose.Types.ObjectId
    const stats = await ARUsage.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
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
      { $unwind: { 
        path: '$productDetails',
        preserveNullAndEmptyArrays: true
      }},
      { $project: {
        _id: 1,
        productName: { $ifNull: ['$productDetails.name', 'Unknown Product'] },
        category: { $ifNull: ['$productDetails.category', 'Uncategorized'] },
        totalUsage: 1,
        usageCount: 1,
        conversions: 1,
        conversionRate: { 
          $cond: [
            { $eq: ['$usageCount', 0] },
            0,
            { $divide: ['$conversions', '$usageCount'] }
          ]
        }
      }}
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching AR stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;