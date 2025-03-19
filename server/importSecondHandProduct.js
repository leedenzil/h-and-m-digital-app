/**
 * Script to import second-hand products directly to MongoDB
 * Run with: node importSecondHandProducts.js
 * 
 * This script directly adds products to the database with empty image arrays
 * so you can manually upload images later through the admin interface.
 */

require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const Product = require('./models/Product'); // Path to your Product model

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    importProducts();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Second-hand subscription return products to import
const secondHandProducts = [
  {
    name: "Faded Denim Jacket",
    description: "Lightly worn denim jacket in classic blue. Perfect for casual outfits.",
    category: "Jackets",
    price: 39.99,
    originalPrice: 79.99,
    colors: ["Blue"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Casual", "Denim", "Sustainable"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 400,
    images: [], // Empty array to add images manually later
    status: "active"
  },
  {
    name: "Striped Cotton Sweater",
    description: "Comfortable striped sweater with minimal signs of wear. Perfect for layering.",
    category: "Sweaters",
    price: 29.99,
    originalPrice: 59.99,
    colors: ["Blue", "White"],
    sizes: [
      { size: "S", quantity: 1 },
      { size: "M", quantity: 1 }
    ],
    tags: ["Casual", "Winter", "Cozy"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 300,
    images: [],
    status: "active"
  },
  {
    name: "Loose Fit Linen Shirt",
    description: "Breathable linen shirt, perfect for summer. Minor signs of wear.",
    category: "Shirts",
    price: 24.99,
    originalPrice: 49.99,
    colors: ["White", "Beige"],
    sizes: [
      { size: "M", quantity: 1 }
    ],
    tags: ["Summer", "Casual", "Sustainable"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Good",
    returnable: true,
    rewardPoints: 250,
    images: [],
    status: "active"
  },
  {
    name: "Slim Fit Chino Pants",
    description: "Classic chino pants in excellent condition. Minimal wear visible.",
    category: "Pants",
    price: 34.99,
    originalPrice: 69.99,
    colors: ["Beige", "Navy"],
    sizes: [
      { size: "32", quantity: 1 },
      { size: "34", quantity: 1 }
    ],
    tags: ["Formal", "Business", "Classic"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Like New",
    returnable: true,
    rewardPoints: 350,
    images: [],
    status: "active"
  },
  {
    name: "Floral Summer Dress",
    description: "Beautiful floral pattern summer dress. Perfect for warm days.",
    category: "Dresses",
    price: 44.99,
    originalPrice: 89.99,
    colors: ["Pink", "Floral"],
    sizes: [
      { size: "S", quantity: 1 },
      { size: "M", quantity: 1 }
    ],
    tags: ["Summer", "Casual", "Floral"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 450,
    images: [],
    status: "active"
  },
  {
    name: "Leather Belt",
    description: "High-quality leather belt with minimal signs of use.",
    category: "Accessories",
    price: 19.99,
    originalPrice: 39.99,
    colors: ["Black", "Brown"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Classic", "Formal", "Essential"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 200,
    images: [],
    status: "active"
  },
  {
    name: "Wool Blend Coat",
    description: "Warm wool blend coat for winter. Lightly worn with minimal signs of use.",
    category: "Coats",
    price: 79.99,
    originalPrice: 159.99,
    colors: ["Black", "Grey"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Winter", "Formal", "Warm"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 800,
    images: [],
    status: "active"
  },
  {
    name: "Canvas Sneakers",
    description: "Comfortable canvas sneakers, light signs of wear on soles.",
    category: "Shoes",
    price: 24.99,
    originalPrice: 49.99,
    colors: ["White", "Black"],
    sizes: [
      { size: "40", quantity: 1 },
      { size: "41", quantity: 1 },
      { size: "42", quantity: 1 }
    ],
    tags: ["Casual", "Summer", "Comfortable"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Good",
    returnable: true,
    rewardPoints: 250,
    images: [],
    status: "active"
  },
  {
    name: "Patterned Silk Scarf",
    description: "Beautiful silk scarf with geometric pattern. Like new condition.",
    category: "Accessories",
    price: 29.99,
    originalPrice: 59.99,
    colors: ["Multicolor"],
    sizes: [
      { size: "One Size", quantity: 1 }
    ],
    tags: ["Elegant", "Colorful", "Versatile"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Like New",
    returnable: true,
    rewardPoints: 300,
    images: [],
    status: "active"
  },
  {
    name: "Knitted Beanie Hat",
    description: "Soft, warm beanie hat for winter. Minimal wear.",
    category: "Accessories",
    price: 14.99,
    originalPrice: 29.99,
    colors: ["Grey", "Navy"],
    sizes: [
      { size: "One Size", quantity: 1 }
    ],
    tags: ["Winter", "Casual", "Warm"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 150,
    images: [],
    status: "active"
  },
  {
    name: "Relaxed Fit T-Shirt",
    description: "Comfortable cotton t-shirt with minimal fading.",
    category: "Shirts",
    price: 12.99,
    originalPrice: 24.99,
    colors: ["White", "Black", "Grey"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 },
      { size: "XL", quantity: 1 }
    ],
    tags: ["Casual", "Basic", "Essential"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 130,
    images: [],
    status: "active"
  },
  {
    name: "Denim Jeans",
    description: "Classic denim jeans with slight fade. Still in great condition.",
    category: "Pants",
    price: 39.99,
    originalPrice: 79.99,
    colors: ["Blue", "Black"],
    sizes: [
      { size: "30", quantity: 1 },
      { size: "32", quantity: 1 },
      { size: "34", quantity: 1 }
    ],
    tags: ["Casual", "Denim", "Everyday"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 400,
    images: [],
    status: "active"
  },
  {
    name: "Leather Crossbody Bag",
    description: "Compact leather crossbody bag with minimal signs of use.",
    category: "Bags",
    price: 49.99,
    originalPrice: 99.99,
    colors: ["Black", "Brown"],
    sizes: [
      { size: "One Size", quantity: 1 }
    ],
    tags: ["Casual", "Practical", "Stylish"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 500,
    images: [],
    status: "active"
  },
  {
    name: "Pleated Midi Skirt",
    description: "Elegant pleated midi skirt in excellent condition.",
    category: "Dresses",
    price: 34.99,
    originalPrice: 69.99,
    colors: ["Navy", "Black"],
    sizes: [
      { size: "S", quantity: 1 },
      { size: "M", quantity: 1 }
    ],
    tags: ["Elegant", "Office", "Versatile"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Like New",
    returnable: true,
    rewardPoints: 350,
    images: [],
    status: "active"
  },
  {
    name: "Polo Shirt",
    description: "Classic polo shirt with minimal signs of wear.",
    category: "Shirts",
    price: 19.99,
    originalPrice: 39.99,
    colors: ["Navy", "White", "Red"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Casual", "Smart Casual", "Classic"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 200,
    images: [],
    status: "active"
  },
  {
    name: "Quilted Jacket",
    description: "Lightweight quilted jacket, perfect for spring/fall transitions.",
    category: "Jackets",
    price: 44.99,
    originalPrice: 89.99,
    colors: ["Navy", "Green"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Casual", "Lightweight", "Spring"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Excellent",
    returnable: true,
    rewardPoints: 450,
    images: [],
    status: "active"
  },
  {
    name: "Casual Shorts",
    description: "Comfortable casual shorts for summer. Good condition with minimal wear.",
    category: "Pants",
    price: 24.99,
    originalPrice: 49.99,
    colors: ["Beige", "Navy"],
    sizes: [
      { size: "30", quantity: 1 },
      { size: "32", quantity: 1 },
      { size: "34", quantity: 1 }
    ],
    tags: ["Summer", "Casual", "Comfortable"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Good",
    returnable: true,
    rewardPoints: 250,
    images: [],
    status: "active"
  },
  {
    name: "Leather Ankle Boots",
    description: "Stylish leather ankle boots with slight wear on heels.",
    category: "Shoes",
    price: 59.99,
    originalPrice: 119.99,
    colors: ["Black", "Brown"],
    sizes: [
      { size: "38", quantity: 1 },
      { size: "39", quantity: 1 },
      { size: "40", quantity: 1 }
    ],
    tags: ["Casual", "Winter", "Stylish"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 600,
    images: [],
    status: "active"
  },
  {
    name: "Cashmere Blend Sweater",
    description: "Luxurious cashmere blend sweater with minimal pilling.",
    category: "Sweaters",
    price: 69.99,
    originalPrice: 139.99,
    colors: ["Grey", "Navy", "Burgundy"],
    sizes: [
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Winter", "Luxury", "Warm"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Very Good",
    returnable: true,
    rewardPoints: 700,
    images: [],
    status: "active"
  },
  {
    name: "Graphic Print T-Shirt",
    description: "Fun graphic tee with minimal fading.",
    category: "Shirts",
    price: 14.99,
    originalPrice: 29.99,
    colors: ["White", "Black"],
    sizes: [
      { size: "S", quantity: 1 },
      { size: "M", quantity: 1 },
      { size: "L", quantity: 1 }
    ],
    tags: ["Casual", "Trendy", "Graphic"],
    isSecondHand: true,
    fromSubscription: true,
    condition: "Good",
    returnable: true,
    rewardPoints: 150,
    images: [],
    status: "active"
  }
];

// Function to import products
async function importProducts() {
  try {
    console.log(`Starting import of ${secondHandProducts.length} products...`);
    
    // Insert all products
    const result = await Product.insertMany(secondHandProducts);
    
    console.log(`Successfully imported ${result.length} products!`);
    console.log('Product IDs:');
    result.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${product._id}`);
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error importing products:', error);
    
    // Disconnect from MongoDB on error
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB due to error');
    
    process.exit(1);
  }
}