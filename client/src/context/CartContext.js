import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};

// Provider component
export const CartProvider = ({ children }) => {
  // Initialize cart state from localStorage if available
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Add checkout status state
  const [checkoutStatus, setCheckoutStatus] = useState({
    loading: false,
    error: null,
    success: false,
    orderId: null
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (item) => {
    // Create a properly formatted cart item that handles both _id and id
    const formattedItem = {
      id: item._id || item.id, // Handle both MongoDB _id and regular id
      name: item.name,
      price: parseFloat(item.price),
      image: item.images && item.images.length > 0 
        ? item.images.find(img => img.isMain)?.url || item.images[0].url
        : item.image || '/placeholder.jpg',
      size: item.size || (item.sizes && item.sizes.length > 0 ? 
        (typeof item.sizes[0] === 'object' ? item.sizes[0].size : item.sizes[0]) : 'One Size'),
      quantity: item.quantity || 1,
      // Add additional properties that might be useful during checkout
      category: item.category || '',
      condition: item.condition || 'New',
      isSecondHand: item.isSecondHand || false,
      rewardPoints: item.rewardPoints || Math.round(parseFloat(item.price) * 10)
    };
    
    setCart(prevCart => {
      // Check if item already exists in cart using the normalized id
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === formattedItem.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + formattedItem.quantity
        };
        return newCart;
      } else {
        // Item doesn't exist, add the formatted item
        return [...prevCart, formattedItem];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        // If quantity is 1, remove the item
        if (newCart[existingItemIndex].quantity === 1) {
          return newCart.filter(item => item.id !== itemId);
        } else {
          // Otherwise, decrease quantity
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity - 1
          };
          return newCart;
        }
      }
      return prevCart;
    });
  };

  // Remove all quantities of an item from cart
  const removeItemCompletely = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Calculate total price
  const getCartTotal = () => {
    if (!cart || cart.length === 0) return 0;
    return cart.reduce(
      (total, item) => total + (parseFloat(item.price || 0) * (item.quantity || 1)),
      0
    );
  };

  // Get total number of items in cart
  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Update item quantity directly
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeItemCompletely(itemId);
      return;
    }
    
    setCart(prevCart => {
      return prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: quantity }
          : item
      );
    });
  };

  // Process checkout with a single order ID for all items
  const checkout = async (shippingInfo, paymentInfo) => {
    // Reset checkout status
    setCheckoutStatus({
      loading: true,
      error: null,
      success: false,
      orderId: null
    });

    if (cart.length === 0) {
      setCheckoutStatus({
        loading: false,
        error: 'Cart is empty',
        success: false,
        orderId: null
      });
      return { success: false, message: 'Cart is empty' };
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Generate a single order ID for all items in this checkout
      // Format: ORD-YYYYMMDD-TIMESTAMP-RANDOMCHARS
      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const timestamp = now.getTime();
      const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderId = `ORD-${dateStr}-${timestamp}-${randomChars}`;
      
      const results = [];

      // Process each cart item with the same order ID
      for (const item of cart) {
        const purchaseData = {
          productId: item.id,
          quantity: item.quantity,
          useRewardPoints: paymentInfo?.useRewardPoints || false,
          rewardPointsUsed: paymentInfo?.rewardPointsUsed || 0,
          orderId: orderId // Use the same order ID for all items
        };
        
        // Make the API call
        const response = await fetch('http://localhost:5001/api/marketplace/purchase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(purchaseData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to process purchase');
        }

        const data = await response.json();
        results.push(data);
      }
      
      // Clear the cart after successful checkout
      clearCart();
      
      // Update checkout status
      setCheckoutStatus({
        loading: false,
        error: null,
        success: true,
        orderId: orderId
      });
      
      return { 
        success: true, 
        message: 'Checkout completed successfully',
        orderId: orderId,
        results: results
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      
      setCheckoutStatus({
        loading: false,
        error: error.message || 'Failed to complete checkout',
        success: false,
        orderId: null
      });
      
      return { 
        success: false, 
        message: error.message || 'Failed to complete checkout' 
      };
    }
  };

  // Calculate total reward points
  const getTotalRewardPoints = () => {
    return cart.reduce((total, item) => 
      total + ((item.rewardPoints || Math.round(parseFloat(item.price) * 10)) * item.quantity), 0);
  };

  // Context value
  const value = {
    cart,
    addToCart,
    removeFromCart,
    removeItemCompletely,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartSize: getCartCount, // Alias for backward compatibility
    checkout,
    checkoutStatus,
    getTotalRewardPoints
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;