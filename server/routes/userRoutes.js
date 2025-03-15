const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      email,
      password,
      firstName,
      lastName,
      rewardPoints: 1500 // Give new users starter reward points
    });
    
    await user.save();
    
    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  const { firstName, lastName, profileImage, stylePreferences } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileImage) user.profileImage = profileImage;
    if (stylePreferences) user.stylePreferences = stylePreferences;
    
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Set new password
    user.password = newPassword;
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's reward points
router.get('/rewards', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('rewardPoints');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ rewardPoints: user.rewardPoints });
  } catch (error) {
    console.error('Error fetching reward points:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's style preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('stylePreferences');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.stylePreferences);
  } catch (error) {
    console.error('Error fetching style preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update style preferences
router.put('/preferences', auth, async (req, res) => {
  const { colors, styles, sizes, excludedItems } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (!user.stylePreferences) {
      user.stylePreferences = {};
    }
    
    if (colors) user.stylePreferences.colors = colors;
    if (styles) user.stylePreferences.styles = styles;
    if (sizes) user.stylePreferences.sizes = sizes;
    if (excludedItems) user.stylePreferences.excludedItems = excludedItems;
    
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json(user.stylePreferences);
  } catch (error) {
    console.error('Error updating style preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's liked items
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedItems')
      .select('likedItems');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.likedItems);
  } catch (error) {
    console.error('Error fetching liked items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;