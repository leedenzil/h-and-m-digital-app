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
    // Import the model directly
    const ProductView = require('../models/ProductView');

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
    rewardPointsUsed = 0,
    orderId = null // Allow passing in an orderId for multiple items in one order
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
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', require('../models/Purchase'));

    // Generate a new orderId if not provided
    // This allows multiple items to share the same orderId
    const purchaseOrderId = orderId || `ORD-${Date.now()}-${user._id.toString().substring(0, 6)}`;

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
      orderId: purchaseOrderId, // Use the generated or provided orderId
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
      orderId: purchaseOrderId, // Return the orderId for the client
      newRewardPointsBalance: user.rewardPoints
    });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get purchases for the current user
router.get('/purchases', auth, async (req, res) => {
  try {
    // Get Purchase model
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', require('../models/Purchase'));
    
    // Find all purchases for the current user
    const purchases = await Purchase.find({ user: req.user.id })
      .populate('product')
      .sort({ timestamp: -1 });

    // Group purchases by orderId
    const orderMap = new Map();
    
    purchases.forEach(purchase => {
      const orderId = purchase.orderId || purchase._id.toString();
      
      if (!orderMap.has(orderId)) {
        // Initialize a new order
        orderMap.set(orderId, {
          _id: orderId,
          id: orderId,
          date: purchase.timestamp,
          timestamp: purchase.timestamp,
          status: 'Confirmed', // Default status
          items: [],
          subtotal: 0,
          total: 0,
          shippingCost: 4.99, // Default shipping cost per order
          useRewardPoints: purchase.useRewardPoints,
          rewardPointsUsed: purchase.rewardPointsUsed || 0,
          rewardPointsEarned: 0
        });
      }
      
      const order = orderMap.get(orderId);
      
      // Add the item to the order
      const item = {
        id: purchase.product._id,
        name: purchase.product.name,
        price: purchase.price,
        quantity: purchase.quantity,
        category: purchase.product.category,
        image: purchase.product.images && purchase.product.images.length > 0 
          ? purchase.product.images.find(img => img.isMain)?.url || purchase.product.images[0].url 
          : '/api/placeholder/40/40'
      };
      
      order.items.push(item);
      
      // Update order totals
      const itemTotal = purchase.price * purchase.quantity;
      order.subtotal += itemTotal;
      order.rewardPointsEarned += purchase.rewardPointsEarned || 0;
      
      // Use the most recent timestamp
      if (new Date(purchase.timestamp) > new Date(order.timestamp)) {
        order.timestamp = purchase.timestamp;
        order.date = purchase.timestamp;
      }
    });
    
    // Calculate final totals and sort orders by date
    const orders = Array.from(orderMap.values()).map(order => {
      // Add tax to subtotal
      order.total = (order.subtotal * 1.07 + order.shippingCost).toFixed(2); // 7% tax + shipping
      return order;
    });
    
    // Sort by date descending (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;