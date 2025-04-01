// Update your Subscription.js model to better handle the new data structure

const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'quarterly'],
    required: true
  },
  packageType: {
    type: String,
    enum: ['full', 'tops', 'accessories'],
    required: true
  },
  tier: {
    type: String,
    enum: ['budget', 'mid', 'luxury'],
    required: true
  },
  includeSecondHand: {
    type: Boolean,
    default: false
  },
  festivePackage: {
    type: String,
    enum: ['none', 'cny', 'christmas', 'summer'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  },
  nextDeliveryDate: {
    type: Date,
    required: true
  },
  price: {
    base: {
      type: Number,
      required: true
    },
    festiveAddon: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  preferences: {
    explorationLevel: {
      type: String,
      enum: ['no', 'moderate', 'yes'],
      default: 'moderate'
    },
    sizes: {
      top: String,
      bottom: String,
      shoe: String
    },
    notes: String
  },
  deliveryHistory: [{
    date: Date,
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      returned: {
        type: Boolean,
        default: false
      },
      returnReason: String,
      returnDate: Date
    }],
    feedback: {
      rating: Number,
      comments: String
    }
  }],
  paymentHistory: [{
    date: Date,
    amount: Number,
    method: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
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

// Pre-save hook to update the 'updatedAt' field
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to calculate next delivery date
SubscriptionSchema.statics.calculateNextDeliveryDate = function(plan, currentDate = new Date()) {
  const date = new Date(currentDate);
  
  if (plan === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (plan === 'quarterly') {
    date.setMonth(date.getMonth() + 3);
  }
  
  return date;
};

// Method to calculate total price
SubscriptionSchema.methods.calculateTotalPrice = function() {
  return this.price.base + this.price.festiveAddon - this.price.discount;
};

// Method to check if subscription is active
SubscriptionSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to pause subscription
SubscriptionSchema.methods.pause = function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume subscription
SubscriptionSchema.methods.resume = function() {
  this.status = 'active';
  return this.save();
};

// Method to cancel subscription
SubscriptionSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;