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
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item exists, increase quantity
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + (item.quantity || 1)
        };
        return newCart;
      } else {
        // Item doesn't exist, add new item with quantity
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
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
    // Add getCartSize as an alias for getCartCount for backward compatibility
    getCartSize: getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;