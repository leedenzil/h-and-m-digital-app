const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all marketplace products (simplest implementation)
router.get('/', async (req, res) => {
  try {
    // Simple implementation - just return all products
    const products = await Product.find().sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products for marketplace`);
    
    res.json({
      products,
      totalProducts: products.length,
      totalPages: 1,
      currentPage: 1
    });
  } catch (error) {
    console.error('Error fetching marketplace products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;