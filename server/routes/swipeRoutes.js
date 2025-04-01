// Update swipeRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET all products for swipe feature
router.get('/products', async (req, res) => {
  try {
    console.log('Swipe products route accessed');
    const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products for swipe feature`);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products for swipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record swipe action (like/dislike)
router.post('/record', auth, async (req, res) => {
  const { productId, liked } = req.body;
  console.log(`👉 SWIPE RECORDED: User ${req.user.id} ${liked ? 'liked' : 'disliked'} product ${productId}`);

  try {
    console.log(`Recording swipe: product ${productId}, liked: ${liked}`);
    
    // Update User's swiped items
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add to user's swiped items
    user.swipedItems.push({
      itemId: productId,
      liked,
      timestamp: Date.now()
    });
    
    // If liked, also add to likedItems array
    if (liked && !user.likedItems.includes(productId)) {
      user.likedItems.push(productId);
    }
    
    await user.save();
    
    // Update Product's swipe stats
    const product = await Product.findById(productId);
    if (product) {
      if (liked) {
        product.swipeStats.likes += 1;
      } else {
        product.swipeStats.dislikes += 1;
      }
      
      // Update popularity score (simple algorithm: likes - dislikes)
      product.popularity = product.swipeStats.likes - product.swipeStats.dislikes;
      
      await product.save();
    }
    
    res.json({ success: true, message: 'Swipe recorded successfully' });
  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
  console.log(`✅ SWIPE SAVED: Success`);

});

// Get user's swipe history count
router.post('/complete-onboarding', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Set an onboarding completed flag in the user profile
    // Note: You'll need to add this field to your User model
    user.onboardingCompleted = true;
    
    await user.save();
    
    res.json({ success: true, message: 'Onboarding marked as complete' });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/history/count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count the number of swiped items
    const count = user.swipedItems ? user.swipedItems.length : 0;
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching swipe history count:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's swipe history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('swipedItems.itemId')
      .select('swipedItems');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.swipedItems);
  } catch (error) {
    console.error('Error fetching swipe history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;