const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Shirts', 'Pants', 'Dresses', 'Accessories', 'Shoes', 'Jackets', 'Coats', 'Sweaters', 'Bags', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    url: String,
    alt: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  modelUrl: {
    type: String,
    default: ''
  },
  colors: [String],
  sizes: [{
    size: String,
    quantity: {
      type: Number,
      min: 0,
      default: 0
    }
  }],
  tags: [String],
  isSecondHand: {
    type: Boolean,
    default: false
  },
  fromSubscription: {
    type: Boolean,
    default: false
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'],
    required: function() {
      return this.isSecondHand === true;
    }
  },
  returnable: {
    type: Boolean,
    default: true
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  popularity: {
    type: Number,
    default: 0
  },
  swipeStats: {
    likes: {
      type: Number,
      default: 0
    },
    dislikes: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the 'updatedAt' field
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate and update average rating
ProductSchema.methods.calculateRating = function() {
  if (this.ratings.reviews.length === 0) {
    this.ratings.average = 0;
    return 0;
  }
  
  const sum = this.ratings.reviews.reduce((total, review) => total + review.rating, 0);
  this.ratings.average = sum / this.ratings.reviews.length;
  this.ratings.count = this.ratings.reviews.length;
  
  return this.ratings.average;
};

// Method to add a new review
ProductSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already left a review
  const existingReviewIndex = this.ratings.reviews.findIndex(
    review => review.user && review.user.toString() === userId.toString()
  );
  
  if (existingReviewIndex >= 0) {
    // Update existing review
    this.ratings.reviews[existingReviewIndex].rating = rating;
    this.ratings.reviews[existingReviewIndex].comment = comment;
    this.ratings.reviews[existingReviewIndex].date = Date.now();
  } else {
    // Add new review
    this.ratings.reviews.push({
      user: userId,
      rating,
      comment
    });
  }
  
  // Recalculate average rating
  this.calculateRating();
  
  return this.ratings;
};

// Index for text search
ProductSchema.index({ 
  name: 'text', 
  description: 'text', 
  category: 'text',
  tags: 'text' 
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;