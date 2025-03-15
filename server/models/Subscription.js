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
    colors: [String],
    styles: [String],
    sizes: {
      top: String,
      bottom: String,
      shoe: String
    },
    excludedItems: [String],
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

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;