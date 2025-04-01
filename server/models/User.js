const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: ''
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  stylePreferences: {
    colors: [String],
    styles: [String],
    sizes: {
      top: String,
      bottom: String,
      shoe: String
    },
    excludedItems: [String]
  },
  swipedItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    liked: Boolean,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  likedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;