import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  Badge,
  Drawer,
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useNavigate } from 'react-router-dom';

/**
 * Standardized Cart Drawer component for use across the application
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {function} props.onClose - Function to call when closing the drawer
 * @param {Array} props.cart - Cart items array
 * @param {function} props.addToCart - Function to add an item to cart
 * @param {function} props.removeFromCart - Function to remove an item from cart
 * @param {function} props.updateQuantity - Function to update an item's quantity
 * @param {function} props.getCartTotal - Function to calculate cart total
 * @param {number} props.userRewardPoints - User's available reward points
 */
const CartDrawer = ({
  open,
  onClose,
  cart = [],
  addToCart,
  removeFromCart,
  updateQuantity,
  getCartTotal,
  userRewardPoints = 0
}) => {
  const navigate = useNavigate();
  
  // Calculate cart count and reward points
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
  const cartRewardPoints = cart.reduce((total, item) => total + ((item.rewardPoints || Math.round(item.price * 10)) * item.quantity), 0);
  
  // Safe formatter function to prevent errors
  const formatPrice = (price) => {
    return (price || 0).toFixed(2);
  };

  // Handle checkout button
  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  // Handle quantity updates
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity would be less than 1, remove the item
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle complete removal
  const handleRemoveItem = (itemId) => {
    // Remove all quantities of this item
    if (removeFromCart) {
      // If the removeFromCart function can handle removing all items
      for (const item of cart) {
        if (item.id === itemId) {
          for (let i = 0; i < item.quantity; i++) {
            removeFromCart(itemId);
          }
          break;
        }
      }
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': { 
          width: { xs: '85%', sm: 350 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 2 
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge badgeContent={cartCount} color="primary" sx={{ mr: 1 }}>
              <ShoppingCartIcon />
            </Badge>
            <Typography variant="h6">
              Your Cart {cartCount > 0 && `(${cartCount})`}
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Cart Contents */}
        {cart.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexGrow: 1,
            py: 4
          }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Add items by swiping right or using the "Add to Cart" button
            </Typography>
            <Button 
              variant="contained" 
              onClick={onClose}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <>
            {/* Cart Items - scrollable section */}
            <List sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              mb: 2,
              '& .MuiListItem-root': {
                px: 0,
                py: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }
            }}>
              {cart.map((item) => (
                <ListItem key={`cart-item-${item.id}`}>
                  <Box sx={{ display: 'flex', width: '100%' }}>
                    {/* Product Image */}
                    <Avatar
                      src={item.image}
                      alt={item.name}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    
                    {/* Product Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {item.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {item.size && `Size: ${item.size}`}
                        {item.size && item.condition && ' | '}
                        {item.condition && item.condition}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 0.5 
                      }}>
                        {/* Price */}
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ${formatPrice(item.price)}
                        </Typography>
                        
                        {/* Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            sx={{ 
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              p: 0.5,
                              minWidth: 30,
                              height: 30
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          
                          <Typography sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            size="small"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            sx={{ 
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              p: 0.5,
                              minWidth: 30,
                              height: 30
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                    
                    {/* Remove Button */}
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveItem(item.id)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
            
            {/* Cart Summary - fixed at bottom */}
            <Box sx={{ mt: 'auto' }}>
              <Divider sx={{ mb: 2 }} />
              
              {/* Subtotal */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${formatPrice(getCartTotal ? getCartTotal() : cart.reduce((total, item) => total + (item.price * item.quantity), 0))}
                </Typography>
              </Box>
              
              {/* Reward Points */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2
              }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  <LocalOfferIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Reward Points:
                </Typography>
                <Chip 
                  label={`${cartRewardPoints} points`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              {/* User's available points */}
              {userRewardPoints > 0 && (
                <Box sx={{ 
                  bgcolor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1, 
                  mb: 2 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <Typography variant="body2">Your Reward Points:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {userRewardPoints.toLocaleString()} points
                    </Typography>
                  </Box>
                  
                  {cartRewardPoints > userRewardPoints && (
                    <Alert severity="info" sx={{ mt: 1, py: 0 }}>
                      You'll need more points to use for this purchase
                    </Alert>
                  )}
                </Box>
              )}
              
              {/* Checkout Buttons */}
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                disabled={cart.length === 0}
                sx={{ mb: 1 }}
              >
                Proceed to Checkout
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;