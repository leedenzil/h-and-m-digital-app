// Create this file at: server/routes/swipeRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products for swipe feature
router.get('/products', async (req, res) => {
  try {
    console.log('Swipe products route accessed');
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`Found ${products.length} products for swipe feature`);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products for swipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Record swipe action (like/dislike)
router.post('/record', async (req, res) => {
  const { productId, liked } = req.body;
  
  try {
    console.log(`Recording swipe: product ${productId}, liked: ${liked}`);
    // In a real app, this would update a user's preferences
    res.json({ success: true });
  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;