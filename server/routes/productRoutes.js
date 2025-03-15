const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Get all products (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      search,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    const query = {};
    
    // Apply filters if provided
    if (category && category !== 'All Categories') {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Set up sorting
    let sortOption = {};
    switch (sort) {
      case 'price-low-high':
        sortOption = { price: 1 };
        break;
      case 'price-high-low':
        sortOption = { price: -1 };
        break;
      case 'popular':
        sortOption = { popularity: -1 };
        break;
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // Default sort by newest
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      colors,
      sizes,
      tags,
      isSecondHand,
      fromSubscription,
      condition,
      returnable,
      rewardPoints,
      images
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !price || !originalPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Format sizes with quantity if needed
    let formattedSizes = sizes;
    if (sizes && Array.isArray(sizes) && !sizes[0].size) {
      formattedSizes = sizes.map(size => ({
        size,
        quantity: 10 // Default quantity
      }));
    }
    
    // Create new product
    const newProduct = new Product({
      name,
      description,
      category,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice),
      colors: colors || [],
      sizes: formattedSizes || [],
      tags: tags || [],
      isSecondHand: isSecondHand || false,
      fromSubscription: fromSubscription || false,
      condition: condition || 'New',
      returnable: returnable !== false,
      rewardPoints: parseInt(rewardPoints) || 0,
      images: images || []
    });
    
    await newProduct.save();
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      colors,
      sizes,
      tags,
      isSecondHand,
      fromSubscription,
      condition,
      returnable,
      rewardPoints,
      images,
      status
    } = req.body;
    
    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (originalPrice !== undefined) product.originalPrice = parseFloat(originalPrice);
    if (colors) product.colors = colors;
    
    // Handle sizes - check if it's an array of objects or just strings
    if (sizes) {
      if (Array.isArray(sizes) && sizes.length > 0) {
        if (typeof sizes[0] === 'string') {
          // Convert string array to size objects
          product.sizes = sizes.map(size => ({
            size,
            quantity: 10 // Default quantity
          }));
        } else {
          // Already in the right format
          product.sizes = sizes;
        }
      } else {
        product.sizes = [];
      }
    }
    
    if (tags) product.tags = tags;
    if (isSecondHand !== undefined) product.isSecondHand = isSecondHand;
    if (fromSubscription !== undefined) product.fromSubscription = fromSubscription;
    if (condition) product.condition = condition;
    if (returnable !== undefined) product.returnable = returnable;
    if (rewardPoints !== undefined) product.rewardPoints = parseInt(rewardPoints);
    if (images) product.images = images;
    if (status) product.status = status;
    
    product.updatedAt = Date.now();
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get products for swipe feature
router.get('/swipe/recommendations', async (req, res) => {
  try {
    const { limit = 10, exclude = [] } = req.query;
    
    // Convert exclude string to array if needed
    let excludeIds = exclude;
    if (typeof exclude === 'string') {
      excludeIds = exclude.split(',');
    }
    
    // Build query
    const query = {
      status: 'active',
      _id: { $nin: excludeIds }
    };
    
    // Get random products
    const products = await Product.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } }
    ]);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching swipe products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a product review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { rating, comment, userId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.addReview(userId, rating, comment);
    await product.save();
    
    res.json(product.ratings);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add 3D model URL
router.post('/:id/model', async (req, res) => {
  try {
    const { modelUrl } = req.body;
    
    if (!modelUrl) {
      return res.status(400).json({ message: 'Model URL is required' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.modelUrl = modelUrl;
    await product.save();
    
    res.json({ message: 'Model URL added successfully', product });
  } catch (error) {
    console.error('Error adding model URL:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all product categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;