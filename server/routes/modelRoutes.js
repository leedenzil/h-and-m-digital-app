const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Set up multer for memory storage (we'll store the file directly in MongoDB)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Accept only .glb and .gltf files
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.glb' && ext !== '.gltf') {
      return cb(new Error('Only .glb and .gltf files are allowed'), false);
    }
    cb(null, true);
  }
});

// Create Model schema for MongoDB
const ModelSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  model: Buffer, // Binary data for the model
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
});

const Model = mongoose.model('Model', ModelSchema);

// Upload a model file and associate with a product
router.post('/upload/:productId', upload.single('modelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const productId = req.params.productId;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if there's an existing model for this product and delete it
    await Model.deleteMany({ productId });
    
    // Create new model document
    const newModel = new Model({
      filename: req.file.originalname,
      contentType: req.file.mimetype || 'model/gltf-binary',
      size: req.file.size,
      model: req.file.buffer,
      productId
    });
    
    await newModel.save();
    
    // Update the product with a reference to the model
    product.modelUrl = `/api/models/${newModel._id}`;
    await product.save();
    
    res.status(201).json({ 
      message: 'Model uploaded successfully',
      modelId: newModel._id,
      modelUrl: `/api/models/${newModel._id}`
    });
    
  } catch (error) {
    console.error('Error uploading model:', error);
    res.status(500).json({ message: 'Error uploading model', error: error.message });
  }
});

// Get a model file by ID
router.get('/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    // Set the appropriate headers
    res.set('Content-Type', model.contentType);
    res.set('Content-Disposition', `inline; filename="${model.filename}"`);
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for a year
    
    // Send the model data
    res.send(model.model);
    
  } catch (error) {
    console.error('Error retrieving model:', error);
    res.status(500).json({ message: 'Error retrieving model', error: error.message });
  }
});

// Get all models
router.get('/', async (req, res) => {
  try {
    // Only return metadata, not the actual model binary data
    const models = await Model.find({}, { model: 0 }).populate('productId', 'name');
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ message: 'Error fetching models', error: error.message });
  }
});

// Delete a model
router.delete('/:id', async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    // If associated with a product, remove the reference
    if (model.productId) {
      const product = await Product.findById(model.productId);
      if (product && product.modelUrl) {
        product.modelUrl = '';
        await product.save();
      }
    }
    
    await Model.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ message: 'Error deleting model', error: error.message });
  }
});

module.exports = router;