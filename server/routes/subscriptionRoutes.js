const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to generate simulated delivery items
async function generateDeliveryItems(subscription) {
  const { packageType, tier, includeSecondHand } = subscription;
  const numItems = packageType === 'full' ? 5 : 3;
  
  // Get suitable products based on package type
  let categoryFilter = {};
  
  if (packageType === 'full') {
    categoryFilter = { category: { $in: ['Shirts', 'Pants', 'Accessories'] } };
  } else if (packageType === 'tops') {
    categoryFilter = { category: { $in: ['Shirts', 'Sweaters'] } };
  } else if (packageType === 'accessories') {
    categoryFilter = { category: 'Accessories' };
  }
  
  // Add quality filter based on tier
  let priceFilter = {};
  if (tier === 'budget') {
    priceFilter = { price: { $lt: 30 } };
  } else if (tier === 'mid') {
    priceFilter = { price: { $gte: 30, $lt: 70 } };
  } else if (tier === 'luxury') {
    priceFilter = { price: { $gte: 70 } };
  }
  
  // Add second-hand filter if applicable
  const secondHandFilter = includeSecondHand 
    ? {} 
    : { isSecondHand: false };
  
  // Combine all filters
  const filter = {
    ...categoryFilter,
    ...priceFilter,
    ...secondHandFilter,
    status: 'active'
  };
  
  // Get products matching the criteria
  const products = await Product.find(filter).limit(numItems * 2);
  
  // If not enough products, get random products
  if (products.length < numItems) {
    const additionalProducts = await Product.find({ status: 'active' })
      .limit(numItems - products.length);
    
    products.push(...additionalProducts);
  }
  
  // Select random products from the result
  const selectedProducts = [];
  const productIds = new Set();
  
  while (selectedProducts.length < numItems && products.length > 0) {
    const randomIndex = Math.floor(Math.random() * products.length);
    const product = products[randomIndex];
    
    // Ensure no duplicates
    if (!productIds.has(product._id.toString())) {
      productIds.add(product._id.toString());
      selectedProducts.push(product);
    }
    
    // Remove the product from the array to avoid selecting it again
    products.splice(randomIndex, 1);
  }
  
  // Create delivery items
  return selectedProducts.map(product => ({
    product: product._id,
    returned: false
  }));
}

// Get all subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'monthly',
      title: 'Monthly Refresh',
      description: 'Get new styles every month',
      interval: 'monthly',
      priceMultiplier: 1
    },
    {
      id: 'quarterly',
      title: 'Quarterly Collection',
      description: 'Seasonal styles every 3 months',
      interval: 'quarterly',
      priceMultiplier: 2.8
    }
  ];
  
  res.json(plans);
});

// Get all package types
router.get('/packages', (req, res) => {
  const packages = [
    {
      id: 'full',
      title: 'Full Set',
      description: 'Complete outfit including shirt, pants, and accessories',
      includes: ['Shirt', 'Pants', 'Accessories'],
      basePrice: 89.99
    },
    {
      id: 'tops',
      title: 'Tops Only',
      description: 'Selection of shirts and tops',
      includes: ['Shirt/Top'],
      basePrice: 49.99
    },
    {
      id: 'accessories',
      title: 'Accessories Only',
      description: 'Selection of accessories (rings, necklaces, sunglasses, etc.)',
      includes: ['Accessories'],
      basePrice: 39.99
    }
  ];
  
  res.json(packages);
});

// Get all tiers
router.get('/tiers', (req, res) => {
  const tiers = [
    {
      id: 'budget',
      title: 'Budget Friendly',
      description: 'Quality basics at affordable prices',
      priceMultiplier: 1,
      itemQuality: 'Basic essentials'
    },
    {
      id: 'mid',
      title: 'Premium Selection',
      description: 'Higher quality materials and trendy styles',
      priceMultiplier: 1.5,
      itemQuality: 'Premium materials'
    },
    {
      id: 'luxury',
      title: 'Luxury Collection',
      description: 'Designer collaborations and exclusive pieces',
      priceMultiplier: 2.2,
      itemQuality: 'Exclusive designs'
    }
  ];
  
  res.json(tiers);
});

// Get all festive options
router.get('/festive', (req, res) => {
  const festiveOptions = [
    {
      id: 'none',
      title: 'No Festive Package',
      description: 'Regular subscription without festive items',
      priceAddon: 0
    },
    {
      id: 'cny',
      title: 'Chinese New Year Collection',
      description: 'Special CNY outfits and accessories',
      priceAddon: 29.99
    },
    {
      id: 'christmas',
      title: 'Holiday Season Package',
      description: 'Festive outfits for the holiday season',
      priceAddon: 29.99
    },
    {
      id: 'summer',
      title: 'Summer Special',
      description: 'Beach-ready outfits and accessories',
      priceAddon: 24.99
    }
  ];
  
  res.json(festiveOptions);
});

// Get user's active subscription
router.get('/user', auth, async (req, res) => {
  try {
    console.log(`Getting subscriptions for user: ${req.user.id}`);
    
    // Find all active subscriptions for the user, not just one
    const subscriptions = await Subscription.find({ 
      user: req.user.id,
      status: { $in: ['active', 'paused'] } // Include both active and paused
    }).populate('deliveryHistory.items.product');
    
    console.log(`Found ${subscriptions.length} subscriptions`);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for user');
      return res.status(404).json({ message: 'No subscriptions found' });
    }
    
    res.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new subscription
// Create a new subscription - updated to handle new data structure
router.post('/', auth, async (req, res) => {
  const { 
    plan, 
    packageType, 
    tier, 
    includeSecondHand, 
    festivePackage,
    preferences
  } = req.body;
  
  console.log('Creating new subscription with data:', req.body);
  
  try {
    // Calculate price based on selections
    const packages = {
      full: 89.99,
      tops: 49.99,
      accessories: 39.99
    };
    
    const tiers = {
      budget: 1,
      mid: 1.5,
      luxury: 2.2
    };
    
    const planMultipliers = {
      monthly: 1,
      quarterly: 2.8
    };
    
    const festiveAddons = {
      none: 0,
      cny: 29.99,
      christmas: 29.99,
      summer: 24.99
    };
    
    const basePrice = packages[packageType] * tiers[tier] * planMultipliers[plan];
    const festiveAddon = festiveAddons[festivePackage || 'none'];
    const discount = includeSecondHand ? basePrice * 0.1 : 0; // 10% discount if including second hand
    
    const totalPrice = basePrice + festiveAddon - discount;
    
    // Calculate next delivery date
    const nextDeliveryDate = new Date();
    if (plan === 'monthly') {
      nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 1);
    } else {
      nextDeliveryDate.setMonth(nextDeliveryDate.getMonth() + 3);
    }
    
    // Create new subscription
    const newSubscription = new Subscription({
      user: req.user.id,
      plan,
      packageType,
      tier,
      includeSecondHand: includeSecondHand || false,
      festivePackage: festivePackage || 'none',
      nextDeliveryDate,
      price: {
        base: basePrice,
        festiveAddon,
        discount,
        total: totalPrice
      },
      preferences: preferences || {},
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Created subscription object:', newSubscription);
    await newSubscription.save();
    console.log('Subscription saved successfully with ID:', newSubscription._id);
    
    // Update user's isSubscribed status
    await User.findByIdAndUpdate(req.user.id, { isSubscribed: true });
    
    res.status(201).json(newSubscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update subscription
router.put('/:id', auth, async (req, res) => {
  const { 
    plan, 
    packageType, 
    tier, 
    includeSecondHand, 
    festivePackage,
    preferences,
    status
  } = req.body;
  
  try {
    let subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if subscription belongs to user
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Update fields if provided
    if (plan) subscription.plan = plan;
    if (packageType) subscription.packageType = packageType;
    if (tier) subscription.tier = tier;
    if (includeSecondHand !== undefined) subscription.includeSecondHand = includeSecondHand;
    if (festivePackage) subscription.festivePackage = festivePackage;
    if (preferences) subscription.preferences = preferences;
    if (status) subscription.status = status;
    
    // Recalculate price if necessary
    if (plan || packageType || tier || includeSecondHand !== undefined || festivePackage) {
      // Calculate price based on selections (code similar to POST route)
      const packages = {
        full: 89.99,
        tops: 49.99,
        accessories: 39.99
      };
      
      const tiers = {
        budget: 1,
        mid: 1.5,
        luxury: 2.2
      };
      
      const planMultipliers = {
        monthly: 1,
        quarterly: 2.8
      };
      
      const festiveAddons = {
        none: 0,
        cny: 29.99,
        christmas: 29.99,
        summer: 24.99
      };
      
      const basePrice = packages[subscription.packageType] * 
                       tiers[subscription.tier] * 
                       planMultipliers[subscription.plan];
      const festiveAddon = festiveAddons[subscription.festivePackage];
      const discount = subscription.includeSecondHand ? basePrice * 0.1 : 0;
      
      subscription.price = {
        base: basePrice,
        festiveAddon,
        discount,
        total: basePrice + festiveAddon - discount
      };
      
      // Recalculate next delivery date if plan changed
      if (plan) {
        subscription.nextDeliveryDate = Subscription.calculateNextDeliveryDate(plan);
      }
    }
    
    await subscription.save();
    
    // Update user's isSubscribed status if subscription is cancelled
    if (status === 'cancelled') {
      // Check if user has any other active subscriptions
      const activeSubscriptions = await Subscription.countDocuments({
        user: req.user.id,
        status: 'active'
      });
      
      if (activeSubscriptions === 0) {
        await User.findByIdAndUpdate(req.user.id, { isSubscribed: false });
      }
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Simulate a delivery (new route)
router.post('/:id/simulate-delivery', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if subscription belongs to user
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Generate simulated delivery items
    const items = await generateDeliveryItems(subscription);
    
    // Create delivery entry
    subscription.deliveryHistory.push({
      date: new Date(),
      items,
      feedback: { rating: 0, comments: '' }
    });
    
    // Update next delivery date
    subscription.nextDeliveryDate = Subscription.calculateNextDeliveryDate(
      subscription.plan,
      new Date()
    );
    
    await subscription.save();
    
    // Populate product details for response
    const populatedSubscription = await Subscription.findById(req.params.id)
      .populate('deliveryHistory.items.product');
    
    res.json({
      message: 'Delivery simulated successfully',
      delivery: populatedSubscription.deliveryHistory[populatedSubscription.deliveryHistory.length - 1]
    });
  } catch (error) {
    console.error('Error simulating delivery:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get subscription delivery history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('deliveryHistory.items.product');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if subscription belongs to user
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    res.json(subscription.deliveryHistory);
  } catch (error) {
    console.error('Error fetching delivery history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Return an item from subscription box (updated to include analytics tracking)
router.post('/:id/return', auth, async (req, res) => {
  const { deliveryIndex, itemIndex, returnReason } = req.body;
  
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if subscription belongs to user
    if (subscription.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if delivery and item exist
    if (!subscription.deliveryHistory[deliveryIndex] || 
        !subscription.deliveryHistory[deliveryIndex].items[itemIndex]) {
      return res.status(404).json({ message: 'Item not found in delivery history' });
    }
    
    // Update item as returned
    subscription.deliveryHistory[deliveryIndex].items[itemIndex].returned = true;
    subscription.deliveryHistory[deliveryIndex].items[itemIndex].returnReason = returnReason;
    subscription.deliveryHistory[deliveryIndex].items[itemIndex].returnDate = Date.now();
    
    await subscription.save();
    
    // Get the product to calculate reward points
    const productId = subscription.deliveryHistory[deliveryIndex].items[itemIndex].product;
    const product = await Product.findById(productId);
    
    let rewardPoints = 0;
    
    if (product) {
      // Calculate reward points (example: 10% of product price)
      rewardPoints = Math.round(product.price * 10);
      
      // Add reward points to user
      await User.findByIdAndUpdate(
        req.user.id, 
        { $inc: { rewardPoints } }
      );
      
      // Add returned item to second-hand marketplace
      await Product.create({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price * 0.6, // 40% off original price
        originalPrice: product.price,
        images: product.images,
        modelUrl: product.modelUrl,
        colors: product.colors,
        sizes: [{ size: product.sizes[0].size, quantity: 1 }],
        tags: product.tags,
        isSecondHand: true,
        fromSubscription: true,
        condition: 'Very Good', // Default condition for subscription returns
        returnable: true,
        rewardPoints: Math.round(product.price * 5) // 5x reward points for secondhand
      });
    }
    
    // Update analytics data
    try {
      // Create ReturnAnalytics model if it doesn't exist
      if (!mongoose.models.ReturnAnalytics) {
        const returnAnalyticsSchema = new mongoose.Schema({
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
        
        mongoose.model('ReturnAnalytics', returnAnalyticsSchema);
      }
      
      const ReturnAnalytics = mongoose.model('ReturnAnalytics');
      
      // Record return analytics
      const returnAnalytics = new ReturnAnalytics({
        user: req.user.id,
        product: productId,
        subscription: req.params.id,
        reason: returnReason,
        rewardPointsEarned: rewardPoints,
        timestamp: Date.now()
      });
      
      await returnAnalytics.save();
    } catch (error) {
      console.error('Error recording return analytics:', error);
      // Don't return an error, just log it
    }
    
    res.json({ 
      message: 'Item returned successfully', 
      rewardPoints,
      updatedSubscription: subscription
    });
  } catch (error) {
    console.error('Error returning item:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;