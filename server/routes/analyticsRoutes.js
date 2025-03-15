const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// Get user's swipe pattern analysis
router.get('/swipe-patterns', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('swipedItems.itemId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Group swiped items by category
    const categoryData = {};
    
    for (const swipedItem of user.swipedItems) {
      if (swipedItem.itemId) {
        const category = swipedItem.itemId.category;
        
        if (!categoryData[category]) {
          categoryData[category] = { liked: 0, disliked: 0 };
        }
        
        if (swipedItem.liked) {
          categoryData[category].liked += 1;
        } else {
          categoryData[category].disliked += 1;
        }
      }
    }
    
    // Convert to array format for frontend
    const swipeData = Object.keys(categoryData).map(category => ({
      category,
      liked: categoryData[category].liked,
      disliked: categoryData[category].disliked
    }));
    
    res.json(swipeData);
  } catch (error) {
    console.error('Error fetching swipe pattern analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's return analysis
router.get('/returns', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user.id });
    
    if (!subscriptions || subscriptions.length === 0) {
      return res.json([]);
    }
    
    // Create monthly data for returns vs keeps
    const monthlyData = {};
    
    for (const subscription of subscriptions) {
      for (const delivery of subscription.deliveryHistory) {
        const date = new Date(delivery.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const month = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleString('default', { month: 'short' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { month, returns: 0, keeps: 0 };
        }
        
        for (const item of delivery.items) {
          if (item.returned) {
            monthlyData[monthYear].returns += 1;
          } else {
            monthlyData[monthYear].keeps += 1;
          }
        }
      }
    }
    
    // Convert to array and sort by date
    const returnData = Object.values(monthlyData).sort((a, b) => {
      const [yearA, monthA] = Object.keys(monthlyData).find(key => monthlyData[key] === a).split('-');
      const [yearB, monthB] = Object.keys(monthlyData).find(key => monthlyData[key] === b).split('-');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    
    res.json(returnData);
  } catch (error) {
    console.error('Error fetching return analysis:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category preferences
router.get('/category-preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedItems');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Group liked items by category
    const categoryCount = {};
    let totalItems = 0;
    
    if (user.likedItems && user.likedItems.length > 0) {
      for (const item of user.likedItems) {
        const category = item.category || 'Other';
        
        categoryCount[category] = (categoryCount[category] || 0) + 1;
        totalItems += 1;
      }
    }
    
    // Convert to array format for frontend
    const categoryPreferences = Object.keys(categoryCount).map(name => ({
      name,
      value: Math.round((categoryCount[name] / totalItems) * 100)
    }));
    
    res.json(categoryPreferences);
  } catch (error) {
    console.error('Error fetching category preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get price tier preferences
router.get('/price-preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('likedItems');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Define price tiers
    const priceTiers = {
      'Budget': { min: 0, max: 30, count: 0 },
      'Mid-range': { min: 30.01, max: 70, count: 0 },
      'Premium': { min: 70.01, max: Infinity, count: 0 }
    };
    
    let totalItems = 0;
    
    // Count items in each price tier
    if (user.likedItems && user.likedItems.length > 0) {
      for (const item of user.likedItems) {
        if (item.price) {
          for (const tier in priceTiers) {
            if (
              item.price >= priceTiers[tier].min && 
              item.price <= priceTiers[tier].max
            ) {
              priceTiers[tier].count += 1;
              totalItems += 1;
              break;
            }
          }
        }
      }
    }
    
    // Convert to array format for frontend
    const pricePreferences = Object.keys(priceTiers).map(name => ({
      name,
      value: totalItems > 0 
        ? Math.round((priceTiers[name].count / totalItems) * 100) 
        : 0
    }));
    
    res.json(pricePreferences);
  } catch (error) {
    console.error('Error fetching price preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recommendations based on user preferences
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('likedItems')
      .populate('swipedItems.itemId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's preferred categories
    const categoryPref = {};
    const colorPref = {};
    const tagPref = {};
    
    // Analyze liked items
    if (user.likedItems && user.likedItems.length > 0) {
      for (const item of user.likedItems) {
        if (item.category) {
          categoryPref[item.category] = (categoryPref[item.category] || 0) + 2; // Weighted higher
        }
        
        if (item.colors) {
          for (const color of item.colors) {
            colorPref[color] = (colorPref[color] || 0) + 2;
          }
        }
        
        if (item.tags) {
          for (const tag of item.tags) {
            tagPref[tag] = (tagPref[tag] || 0) + 2;
          }
        }
      }
    }
    
    // Analyze swiped items
    if (user.swipedItems && user.swipedItems.length > 0) {
      for (const swipedItem of user.swipedItems) {
        if (swipedItem.itemId && swipedItem.liked) {
          if (swipedItem.itemId.category) {
            categoryPref[swipedItem.itemId.category] = (categoryPref[swipedItem.itemId.category] || 0) + 1;
          }
          
          if (swipedItem.itemId.colors) {
            for (const color of swipedItem.itemId.colors) {
              colorPref[color] = (colorPref[color] || 0) + 1;
            }
          }
          
          if (swipedItem.itemId.tags) {
            for (const tag of swipedItem.itemId.tags) {
              tagPref[tag] = (tagPref[tag] || 0) + 1;
            }
          }
        }
      }
    }
    
    // Find top preferences
    const topCategories = Object.keys(categoryPref)
      .sort((a, b) => categoryPref[b] - categoryPref[a])
      .slice(0, 3);
    
    const topColors = Object.keys(colorPref)
      .sort((a, b) => colorPref[b] - colorPref[a])
      .slice(0, 3);
    
    const topTags = Object.keys(tagPref)
      .sort((a, b) => tagPref[b] - tagPref[a])
      .slice(0, 3);
    
    // Get user's size preferences
    const sizePrefs = user.stylePreferences?.sizes || {};
    
    // Get IDs of items user has already swiped or liked
    const excludeIds = [
      ...user.likedItems.map(item => item._id.toString()),
      ...user.swipedItems.map(item => item.itemId?._id?.toString()).filter(Boolean)
    ];
    
    // Find recommendations based on preferences
    const recommendations = await Product.find({
      _id: { $nin: excludeIds },
      status: 'active',
      isSecondHand: false,
      $or: [
        { category: { $in: topCategories } },
        { colors: { $in: topColors } },
        { tags: { $in: topTags } }
      ]
    })
    .limit(5);
    
    // Calculate confidence score for each recommendation
    const recommendationsWithScore = recommendations.map(product => {
      let score = 0;
      
      // Category match
      if (topCategories.includes(product.category)) {
        score += 30;
      }
      
      // Color match
      const colorMatches = product.colors.filter(color => topColors.includes(color)).length;
      score += colorMatches * 20;
      
      // Tag match
      const tagMatches = product.tags.filter(tag => topTags.includes(tag)).length;
      score += tagMatches * 15;
      
      // Size match
      const sizeMatch = product.sizes.some(s => {
        if (product.category === 'Shirts' || product.category === 'Sweaters' || product.category === 'Jackets' || product.category === 'Coats') {
          return s.size === sizePrefs.top;
        } else if (product.category === 'Pants') {
          return s.size === sizePrefs.bottom;
        } else if (product.category === 'Shoes') {
          return s.size === sizePrefs.shoe;
        }
        return false;
      });
      
      if (sizeMatch) {
        score += 10;
      }
      
      // Normalize to 0-100
      score = Math.min(Math.round(score), 100);
      
      return {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        confidence: score,
        reason: score > 80 
          ? 'Based on your swipe history and kept items'
          : score > 60
            ? 'Matches your style preferences'
            : 'You might like this based on your activity'
      };
    });
    
    // Sort by confidence score
    recommendationsWithScore.sort((a, b) => b.confidence - a.confidence);
    
    res.json(recommendationsWithScore);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;