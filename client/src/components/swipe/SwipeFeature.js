import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Tab,
  Tabs,
  useTheme,
  Paper,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ReplayIcon from '@mui/icons-material/Replay';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../common/CartDrawer';

// Component for swipeable card
const SwipeCard = ({ product, onSwipe, isActive }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(null);
  const cardRef = useRef(null);
  const theme = useTheme();

  // Reset position when a new card becomes active
  useEffect(() => {
    if (isActive) {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setDirection(null);
    }
  }, [isActive]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;

    // Calculate rotation based on horizontal movement
    const newRotation = deltaX * 0.1; // Adjust factor for rotation sensitivity

    setPosition({ x: deltaX, y: deltaY });
    setRotation(newRotation);

    // Set direction for overlay display
    if (deltaX > 50) {
      setDirection('right');
    } else if (deltaX < -50) {
      setDirection('left');
    } else if (deltaY < -100) {
      setDirection('up');
    } else {
      setDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Determine if it's a swipe
    if (Math.abs(position.x) > 100) {
      onSwipe(position.x > 0 ? 'right' : 'left');
    } else if (position.y < -100) {
      onSwipe('up');  // Super like
    } else {
      // Reset position and rotation if not swiped far enough
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setDirection(null);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startPos.x;
    const deltaY = e.touches[0].clientY - startPos.y;

    const newRotation = deltaX * 0.1;

    setPosition({ x: deltaX, y: deltaY });
    setRotation(newRotation);

    // Set direction for overlay display
    if (deltaX > 50) {
      setDirection('right');
    } else if (deltaX < -50) {
      setDirection('left');
    } else if (deltaY < -100) {
      setDirection('up');
    } else {
      setDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Determine if it's a swipe
    if (Math.abs(position.x) > 100) {
      onSwipe(position.x > 0 ? 'right' : 'left');
    } else if (position.y < -100) {
      onSwipe('up');  // Super like
    } else {
      // Reset position and rotation if not swiped far enough
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setDirection(null);
    }
  };

  const getDirectionOverlay = () => {
    if (!direction) return null;

    if (direction === 'right') {
      return (
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            right: 40,
            transform: 'rotate(24deg)',
            border: '2px solid #4CAF50',
            borderRadius: 2,
            padding: '10px 20px',
            color: '#4CAF50',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 10
          }}
        >
          LIKE
        </Box>
      );
    } else if (direction === 'left') {
      return (
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: 40,
            transform: 'rotate(-24deg)',
            border: '2px solid #F44336',
            borderRadius: 2,
            padding: '10px 20px',
            color: '#F44336',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 10
          }}
        >
          NOPE
        </Box>
      );
    } else if (direction === 'up') {
      return (
        <Box
          sx={{
            position: 'absolute',
            top: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            border: '2px solid #2196F3',
            borderRadius: 2,
            padding: '10px 20px',
            color: '#2196F3',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            backgroundColor: 'rgba(255,255,255,0.8)',
            zIndex: 10
          }}
        >
          SUPER LIKE
        </Box>
      );
    }

    return null;
  };

  if (!product) return null;

  return (
    <Box
      ref={cardRef}
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        zIndex: isActive ? 2 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        display: !isActive && position.x === 0 ? 'none' : 'block', // Hide non-active cards that aren't being swiped
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Direction overlay */}
        {getDirectionOverlay()}

        {/* Percentage match indicator */}
        {product.matchPercentage && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.8)',
              borderRadius: 10,
              padding: '4px 8px'
            }}
          >
            <LocalFireDepartmentIcon
              sx={{
                color: parseFloat(product.matchPercentage) > 80 ? '#ff4d4d' : '#ff9800',
                mr: 0.5
              }}
            />
            <Typography
              variant="body2"
              fontWeight="bold"
              color={parseFloat(product.matchPercentage) > 80 ? '#ff4d4d' : '#ff9800'}
            >
              {product.matchPercentage}% Match
            </Typography>
          </Box>
        )}

        {/* Image */}
        <Box sx={{
          position: 'relative',
          flexGrow: 1,
          minHeight: 0,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Box
            component="img"
            src={product.images && product.images.length > 0
              ? product.images.find(img => img.isMain)?.url || product.images[0].url
              : '/api/placeholder/500/700'}
            alt={product.name}
            sx={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
        </Box>

        {/* Product details */}
        <Box sx={{
          padding: 2,
          backgroundColor: '#fff',
          borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" component="div" fontWeight="bold">
                {product.name}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="medium">
                ${parseFloat(product.price).toFixed(2)}
                {product.originalPrice && product.price < product.originalPrice && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through', ml: 1 }}
                  >
                    ${parseFloat(product.originalPrice).toFixed(2)}
                  </Typography>
                )}
              </Typography>
            </Box>

            {product.category && (
              <Chip
                label={product.category}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  color: 'white',
                  fontWeight: 'medium'
                }}
              />
            )}
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          >
            {product.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {product.tags && product.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default function SwipeFeature() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal, updateQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [lastSwipedProduct, setLastSwipedProduct] = useState(null);
  const [lastSwipeDirection, setLastSwipeDirection] = useState(null);
  const [canRewind, setCanRewind] = useState(false);
  const [remainingRewinds, setRemainingRewinds] = useState(3); // Limited rewinds for free users
  const [cartOpen, setCartOpen] = useState(false);
  // Added onboarding state variables
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [swipesNeeded, setSwipesNeeded] = useState(15);
  const [swipesDone, setSwipesDone] = useState(0);
  const theme = useTheme();

  // Filter states
  const [filterOptions, setFilterOptions] = useState({
    category: 'All Categories',
    priceRange: [0, 100],
    searchQuery: '',
    onlyOnSale: false,
    sizes: [],
    colors: []
  });

  // Available categories and sizes
  const categories = ['All Categories', 'Shirts', 'Pants', 'Dresses', 'Accessories', 'Shoes', 'Jackets', 'Coats', 'Sweaters'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink'];

  // Helper to get current product
  const currentProduct = filteredProducts.length > 0 && currentIndex < filteredProducts.length
    ? filteredProducts[currentIndex]
    : null;

  // Check if user has enough swipe data and determine if onboarding is needed
  useEffect(() => {
    const checkSwipeHistory = async () => {
      // Load values from localStorage first
      const savedOnboardingState = localStorage.getItem('onboardingActive');
      const savedSwipesDone = parseInt(localStorage.getItem('onboardingSwipesDone') || '0');
      const savedSwipesNeeded = parseInt(localStorage.getItem('onboardingSwipesNeeded') || '15');
      
      // Initialize state with localStorage values to prevent resets on refresh
      setSwipesDone(savedSwipesDone);
      setSwipesNeeded(savedSwipesNeeded);
      
      // First check if user was directed from subscription page or if we're continuing onboarding
      if ((location.state?.fromOnboarding) || savedOnboardingState === 'true') {
        // Store that we're in onboarding mode
        localStorage.setItem('onboardingActive', 'true');
        
        // Store swipesNeeded if provided from location state
        if (location.state?.swipesNeeded) {
          const newSwipesNeeded = location.state.swipesNeeded;
          setSwipesNeeded(newSwipesNeeded);
          localStorage.setItem('onboardingSwipesNeeded', newSwipesNeeded.toString());
        } else {
          // Use default or previously saved value
          localStorage.setItem('onboardingSwipesNeeded', savedSwipesNeeded.toString());
        }
        
        try {
          // Get token from localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('User not authenticated, using local storage swipe count');
            setIsOnboarding(true);
            return;
          }
  
          // Fetch user's swipe history count from database
          const response = await fetch('http://localhost:5001/api/swipe/history/count', {
            headers: {
              'x-auth-token': token
            }
          });
  
          if (!response.ok) {
            throw new Error(`Error fetching swipe history: ${response.status}`);
          }
  
          const data = await response.json();
          const swipeCount = data.count || 0;
          
          console.log(`User has ${swipeCount} swipes in history`);
          
          // If database count is higher than localStorage count, use database count
          const finalSwipeCount = Math.max(swipeCount, savedSwipesDone);
          
          // If user doesn't have enough swipes, show onboarding
          if (finalSwipeCount < savedSwipesNeeded) {
            setIsOnboarding(true);
            // Update both state and localStorage
            setSwipesDone(finalSwipeCount);
            localStorage.setItem('onboardingSwipesDone', finalSwipeCount.toString());
            
            // Show notification about continuing onboarding
            setSnackbar({
              open: true,
              message: `You need ${savedSwipesNeeded - finalSwipeCount} more swipes to complete your style profile.`,
              severity: 'info'
            });
          } else {
            // User already has enough swipe data
            // Clear all onboarding data
            localStorage.removeItem('onboardingActive');
            localStorage.removeItem('onboardingSwipesDone');
            localStorage.removeItem('onboardingSwipesNeeded');
            
            setSnackbar({
              open: true,
              message: 'You already have a style profile! Continue exploring or return to subscriptions.',
              severity: 'success'
            });
            
            // Ask if they want to return to subscription page
            setTimeout(() => {
              if (window.confirm('Your style profile is complete. Would you like to return to the subscription page?')) {
                navigate('/subscription');
              }
            }, 1500);
          }
        } catch (error) {
          console.error('Error checking swipe history:', error);
          // If there's an error, use localStorage values
          setIsOnboarding(true);
        }
      }
    };
    
    checkSwipeHistory();
  }, [location.state, navigate]);

  // Add a useEffect for handling potential onboarding completion
  useEffect(() => {
    // Check if onboarding is active and user has completed required swipes
    if (isOnboarding && swipesDone >= swipesNeeded) {
      // Also update the database to mark onboarding as complete
      const token = localStorage.getItem('token');
      if (token) {
        fetch('http://localhost:5001/api/users/complete-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }).catch(err => console.error('Failed to mark onboarding as complete:', err));
      }
      setSnackbar({
        open: true,
        message: 'Style profile complete! You can now create a subscription with personalized recommendations.',
        severity: 'success'
      });
      
      // Update onboarding status and clear localStorage if done
      setIsOnboarding(false);
      // Clear all onboarding localStorage data
      localStorage.removeItem('onboardingActive');
      localStorage.removeItem('onboardingSwipesDone');
      localStorage.removeItem('onboardingSwipesNeeded');
      
      // Offer to return to subscription page
      setTimeout(() => {
        if (window.confirm('Style profile complete! Would you like to return to the subscription page?')) {
          navigate('/subscription');
        }
      }, 1500);
    }
  }, [swipesDone, swipesNeeded, isOnboarding, navigate]);

  // Fetch products from API when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5001/api/swipe/products');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();

        // Add match percentage (simulated for demo)
        data = data.map(product => ({
          ...product,
          matchPercentage: Math.floor(Math.random() * 51 + 50).toString() // 50-100%
        }));

        // Sort by match percentage
        data.sort((a, b) => parseInt(b.matchPercentage) - parseInt(a.matchPercentage));

        setProducts(data);
        setFilteredProducts(data);
        setCurrentIndex(0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching swipe products:', error);
        setError(error.message);

        // Fallback to some default products if API fails
        const fallbackProducts = [
          {
            _id: '1',
            name: 'Relaxed Fit T-shirt',
            description: 'A T-shirt in soft cotton jersey with a relaxed fit.',
            price: 14.99,
            originalPrice: 19.99,
            image: '/api/placeholder/500/700',
            images: [{ url: '/api/placeholder/500/700', isMain: true }],
            colors: ['Black', 'White'],
            category: 'Shirts',
            tags: ['Casual', 'Cotton'],
            matchPercentage: '87',
            sizes: ['S', 'M', 'L', 'XL']
          },
          {
            _id: '2',
            name: 'Straight Regular Jeans',
            description: '5-pocket jeans in washed denim with a regular waist.',
            price: 34.99,
            originalPrice: 39.99,
            image: '/api/placeholder/500/700',
            images: [{ url: '/api/placeholder/500/700', isMain: true }],
            colors: ['Blue', 'Black'],
            category: 'Pants',
            tags: ['Denim', 'Casual'],
            matchPercentage: '75',
            sizes: ['30', '32', '34', '36']
          },
          {
            _id: '3',
            name: 'Summer Dress',
            description: 'A light cotton dress perfect for summer days.',
            price: 29.99,
            originalPrice: 39.99,
            image: '/api/placeholder/500/700',
            images: [{ url: '/api/placeholder/500/700', isMain: true }],
            colors: ['Pink', 'White'],
            category: 'Dresses',
            tags: ['Summer', 'Casual'],
            matchPercentage: '82',
            sizes: ['S', 'M', 'L']
          }
        ];

        setProducts(fallbackProducts);
        setFilteredProducts(fallbackProducts);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters when filter options change
  useEffect(() => {
    if (products.length === 0) return;

    let filtered = [...products];

    // Apply category filter
    if (filterOptions.category !== 'All Categories') {
      filtered = filtered.filter(p => p.category === filterOptions.category);
    }

    // Apply price range filter
    filtered = filtered.filter(p =>
      p.price >= filterOptions.priceRange[0] &&
      p.price <= filterOptions.priceRange[1]
    );

    // Apply search query filter
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply on sale filter
    if (filterOptions.onlyOnSale) {
      filtered = filtered.filter(p => p.originalPrice && p.price < p.originalPrice);
    }

    // Apply size filter
    if (filterOptions.sizes.length > 0) {
      filtered = filtered.filter(p => {
        // Handle different size formats (array of strings or array of objects)
        const productSizes = p.sizes ?
          p.sizes.map(s => typeof s === 'object' ? s.size : s) :
          [];

        // Check if any of the filtered sizes are included in product sizes
        return filterOptions.sizes.some(size => productSizes.includes(size));
      });
    }

    // Apply color filter
    if (filterOptions.colors.length > 0) {
      filtered = filtered.filter(p => {
        // Check if product has any of the selected colors
        return p.colors && p.colors.some(color =>
          filterOptions.colors.includes(color)
        );
      });
    }

    setFilteredProducts(filtered);
    setCurrentIndex(0); // Reset to first product when filters change
  }, [filterOptions, products]);

  const handleSwipe = (direction) => {
    if (filteredProducts.length === 0 || currentIndex >= filteredProducts.length) {
      return;
    }
    
    const swiped = filteredProducts[currentIndex];
    
    // Save the swiped product and direction for potential rewind
    setLastSwipedProduct(swiped);
    setLastSwipeDirection(direction);
    setCanRewind(true);
  
    // Update onboarding progress if in onboarding mode
    if (isOnboarding) {
      const newSwipeCount = swipesDone + 1;
      setSwipesDone(newSwipeCount);
      // Store the updated count in localStorage
      localStorage.setItem('onboardingSwipesDone', newSwipeCount.toString());
      
      // Check if onboarding is complete
      if (newSwipeCount >= swipesNeeded) {
        // Will be handled by the completion useEffect
      }
    }
    
    // Determine if it's a like based on direction
    const liked = direction === 'right' || direction === 'up';
    
    // Make actual API call to record the swipe
    fetch('http://localhost:5001/api/swipe/record', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        productId: swiped._id,
        liked: liked,
        isOnboarding: isOnboarding
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Swipe recorded in database:', data);
    })
    .catch(error => {
      console.error('Error recording swipe:', error);
      // Even if API call fails, we still want to keep local count
    });
    
    // Rest of your existing handleSwipe code...
    if (direction === 'right') {
      // User liked the product
      setLikedProducts(prev => [...prev, swiped]);
    
      // Show success message
      setSnackbar({
        open: true,
        message: `Added ${swiped.name} to your favorites!`,
        severity: 'success'
      });
    
      console.log('Liked:', swiped);
    } else if (direction === 'left') {
      // Record dislike
      console.log('Disliked:', swiped);
    
      // Optional feedback
      setSnackbar({
        open: true,
        message: `You passed on ${swiped.name}`,
        severity: 'info'
      });
    } else if (direction === 'up') {
      // Super like
      setLikedProducts(prev => [...prev, swiped]);
    
      console.log('Super Liked:', swiped);
    
      setSnackbar({
        open: true,
        message: `Super liked ${swiped.name}!`,
        severity: 'success'
      });
    }
    
    // Move to the next product
    if (currentIndex < filteredProducts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // We've gone through all products, reload with new ones
      setLoading(true);
      setTimeout(() => {
        // In a real app, this would be an API call to get new products
        // For demo purposes, we'll just shuffle the existing ones
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setProducts(shuffled);
    
        // Reapply filters
        let filtered = [...shuffled];
        if (filterOptions.category !== 'All Categories') {
          filtered = filtered.filter(p => p.category === filterOptions.category);
        }
        // Apply other filters similarly...
    
        setFilteredProducts(filtered);
        setCurrentIndex(0);
        setLoading(false);
      }, 1500);
    }
  };

  const handleManualSwipe = (direction) => {
    handleSwipe(direction);
  };

  const handleRewind = () => {
    // User can only rewind if they have just swiped and have remaining rewinds
    if (!canRewind || remainingRewinds <= 0) return;

    // Decrement the current index to go back to previous card
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // If we're at the first card, we need to reinsert the last swiped card
      const updatedProducts = [lastSwipedProduct, ...filteredProducts];
      setFilteredProducts(updatedProducts);
    }

    // If the last swipe was a like, remove it from liked products
    if (lastSwipeDirection === 'right' || lastSwipeDirection === 'up') {
      const updatedLiked = likedProducts.filter(p => p._id !== lastSwipedProduct._id);
      setLikedProducts(updatedLiked);
    }

    // Reset rewind state
    setCanRewind(false);
    setRemainingRewinds(remainingRewinds - 1);

    // Show feedback
    setSnackbar({
      open: true,
      message: `Returned to ${lastSwipedProduct.name}. ${remainingRewinds - 1} rewinds left today.`,
      severity: 'info'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleProductInfoClick = () => {
    setProductDetailOpen(true);
  };

  const handleProductDetailClose = () => {
    setProductDetailOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (property, value) => {
    setFilterOptions({
      ...filterOptions,
      [property]: value
    });
  };

  const handleToggleSize = (size) => {
    setFilterOptions(prev => {
      if (prev.sizes.includes(size)) {
        return {
          ...prev,
          sizes: prev.sizes.filter(s => s !== size)
        };
      } else {
        return {
          ...prev,
          sizes: [...prev.sizes, size]
        };
      }
    });
  };

  const handleToggleColor = (color) => {
    setFilterOptions(prev => {
      if (prev.colors.includes(color)) {
        return {
          ...prev,
          colors: prev.colors.filter(c => c !== color)
        };
      } else {
        return {
          ...prev,
          colors: [...prev.colors, color]
        };
      }
    });
  };

  const resetFilters = () => {
    setFilterOptions({
      category: 'All Categories',
      priceRange: [0, 100],
      searchQuery: '',
      onlyOnSale: false,
      sizes: [],
      colors: []
    });
  };

  const handleRemoveLikedItem = (productId) => {
    setLikedProducts(prev => prev.filter(p => p._id !== productId));

    setSnackbar({
      open: true,
      message: "Item removed from favorites",
      severity: "info"
    });
  };

  const handleAddToCart = (product) => {
    // Ensure the product has the correct format for the cart
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images.length > 0
        ? product.images.find(img => img.isMain)?.url || product.images[0].url
        : product.image || '/api/placeholder/500/700',
      quantity: 1
    };

    addToCart(cartItem);

    // Show success message
    setSnackbar({
      open: true,
      message: `Added ${product.name} to your cart`,
      severity: 'success'
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove the item if quantity would be less than 1
      removeFromCart(productId);
    } else {
      // Otherwise update the quantity
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);

    setSnackbar({
      open: true,
      message: "Item removed from cart",
      severity: "info"
    });
  };

  const handleGoToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" color="text.secondary">
          Finding products for you...
        </Typography>
      </Box>
    );
  }

  if (error && products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Products
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '90vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Box sx={{
        bgcolor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          maxWidth: 1000,
          mx: 'auto'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Discover
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setFiltersOpen(true)}>
              <FilterListIcon />
            </IconButton>
            <Badge badgeContent={likedProducts.length} color="primary" sx={{ mx: 1 }}>
              <IconButton color="primary" onClick={() => setActiveTab(1)}>
                <FavoriteIcon />
              </IconButton>
            </Badge>
            {/* Calculate cart count from cart array */}
            <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="primary">
              <IconButton color="primary" onClick={() => setCartOpen(true)}>
                <ShoppingCartIcon />
              </IconButton>
            </Badge>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{
            '& .MuiTab-root': {
              fontWeight: 'bold',
              textTransform: 'none',
              minWidth: 120
            },
            '& .Mui-selected': {
              color: theme.palette.primary.main
            }
          }}
        >
          <Tab label="Discover" />
          <Tab label="Favorites" />
        </Tabs>
      </Box>

      {/* Onboarding progress bar */}
      {isOnboarding && (
        <Box 
          sx={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10, 
            bgcolor: 'primary.main', 
            color: 'white',
            py: 1,
            px: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="body1">
            Onboarding: Swipe to establish your style preferences
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              width: 200, 
              bgcolor: 'rgba(255,255,255,0.2)', 
              borderRadius: 5,
              mx: 2,
              position: 'relative',
              height: 10
            }}>
              <Box sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${(swipesDone / swipesNeeded) * 100}%`,
                bgcolor: 'white',
                borderRadius: 5
              }} />
            </Box>
            <Typography variant="body2">
              {swipesDone}/{swipesNeeded}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Content based on active tab */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Discover Tab */}
        {activeTab === 0 && (
          <Box sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            backgroundColor: '#f5f5f5'
          }}>
            {/* Card Container */}
            <Box sx={{
              width: '100%',
              maxWidth: 400,
              height: { xs: 500, md: 600 },
              position: 'relative',
              my: 2,
              mx: 'auto',
              flex: 1
            }}>
              {/* Render the stack of products, with current one on top */}
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(currentIndex, currentIndex + 3).map((product, index) => (
                  <SwipeCard
                    key={`${product._id}-${index}`}
                    product={product}
                    onSwipe={handleSwipe}
                    isActive={index === 0}
                  />
                ))
              ) : (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 3,
                  backgroundColor: 'white',
                  p: 3,
                  textAlign: 'center'
                }}>
                  <SentimentSatisfiedAltIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6">
                    No products match your filters
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Try adjusting your filters to see more products
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={resetFilters}
                    startIcon={<FormatColorResetIcon />}
                  >
                    Reset Filters
                  </Button>
                </Box>
              )}

              {/* No more products placeholder */}
              {filteredProducts.length > 0 && currentIndex >= filteredProducts.length && (
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px dashed #ccc',
                  borderRadius: 3,
                  backgroundColor: 'white'
                }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="h6" align="center">
                    Looking for more products...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                display: 'flex',
                justifyContent: 'space-around',
                width: '100%',
                maxWidth: 500,
                borderRadius: 3,
                mt: 'auto',
                mb: 2
              }}
            >
              <IconButton
                onClick={handleRewind}
                sx={{
                  bgcolor: canRewind && remainingRewinds > 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
                  color: canRewind && remainingRewinds > 0 ? 'text.primary' : 'text.disabled',
                  '&:hover': {
                    bgcolor: canRewind && remainingRewinds > 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
                  }
                }}
                disabled={!canRewind || remainingRewinds <= 0}
              >
                <ReplayIcon fontSize="large" />
              </IconButton>

              <IconButton
                onClick={() => handleManualSwipe('left')}
                sx={{
                  bgcolor: '#ff4d4d',
                  color: 'white',
                  width: 60,
                  height: 60,
                  '&:hover': { bgcolor: '#ff3333' }
                }}
                disabled={filteredProducts.length === 0 || currentIndex >= filteredProducts.length}
              >
                <CloseIcon fontSize="large" />
              </IconButton>

              <IconButton
                onClick={handleProductInfoClick}
                sx={{
                  bgcolor: '#1890ff',
                  color: 'white',
                  '&:hover': { bgcolor: '#40a9ff' }
                }}
                disabled={filteredProducts.length === 0 || currentIndex >= filteredProducts.length}
              >
                <InfoIcon />
              </IconButton>

              <IconButton
                onClick={() => handleManualSwipe('up')}
                sx={{
                  bgcolor: '#52c41a',
                  color: 'white',
                  '&:hover': { bgcolor: '#73d13d' }
                }}
                disabled={filteredProducts.length === 0 || currentIndex >= filteredProducts.length}
              >
                <StarIcon />
              </IconButton>

              <IconButton
                onClick={() => handleManualSwipe('right')}
                sx={{
                  bgcolor: '#ff4d85',
                  color: 'white',
                  width: 60,
                  height: 60,
                  '&:hover': { bgcolor: '#ff85a2' }
                }}
                disabled={filteredProducts.length === 0 || currentIndex >= filteredProducts.length}
              >
                <FavoriteIcon fontSize="large" />
              </IconButton>
            </Paper>
          </Box>
        )}

        {/* Liked Items Tab */}
        {activeTab === 1 && (
          <Box sx={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {likedProducts.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <SentimentSatisfiedAltIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  You haven't liked any items yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start swiping to discover products you love!
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => setActiveTab(0)}
                >
                  Discover Products
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: 2,
                  pb: 8 // Add padding at bottom to make space for the fixed checkout button
                }}>
                  {likedProducts.map((product) => (
                    <Card key={`${product._id || product.id}-${Math.random()}`} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={product.images && product.images.length > 0
                          ? product.images.find(img => img.isMain)?.url || product.images[0].url
                          : product.image || '/api/placeholder/160/160'}
                        alt={product.name}
                      />
                      <CardContent sx={{ p: 1, flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${parseFloat(product.price).toFixed(2)}
                        </Typography>
                      </CardContent>
                      <Box sx={{ display: 'flex', p: 1, pt: 0 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AddShoppingCartIcon />}
                          fullWidth
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </Box>
                    </Card>
                  ))}
                </Box>

                {/* Checkout Button - Fixed at the bottom */}
                <Box sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'white',
                  p: 2,
                  borderTop: '1px solid #eee',
                  zIndex: 10,
                  maxWidth: '100%',
                  width: '100%'
                }}>
                  <Container maxWidth="lg">
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={handleGoToCheckout}
                      startIcon={<ShoppingCartIcon />}
                    >
                      Proceed to Checkout
                    </Button>
                  </Container>
                </Box>
              </>
            )}
          </Box>
        )}
      </Box>

      {/* Product Detail Dialog */}
      <Dialog
        open={productDetailOpen}
        onClose={handleProductDetailClose}
        maxWidth="sm"
        fullWidth
      >
        {currentProduct && (
          <>
            <DialogTitle>
              {currentProduct.name}
              <IconButton
                aria-label="close"
                onClick={handleProductDetailClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Box
                  component="img"
                  sx={{ width: { xs: '100%', sm: 200 }, objectFit: 'cover' }}
                  src={currentProduct.images && currentProduct.images.length > 0
                    ? currentProduct.images.find(img => img.isMain)?.url || currentProduct.images[0].url
                    : currentProduct.image || '/api/placeholder/400/400'}
                  alt={currentProduct.name}
                />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      ${parseFloat(currentProduct.price).toFixed(2)}
                    </Typography>
                    {currentProduct.matchPercentage && (
                      <Chip
                        label={`${currentProduct.matchPercentage}% Match`}
                        size="small"
                        sx={{
                          bgcolor: parseFloat(currentProduct.matchPercentage) > 80 ? '#ff4d4d' : '#ff9800',
                          color: 'white'
                        }}
                        icon={<LocalFireDepartmentIcon sx={{ color: 'white' }} />}
                      />
                    )}
                  </Box>
                  <Typography variant="body1" paragraph>
                    {currentProduct.description}
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    Category:
                  </Typography>
                  <Chip label={currentProduct.category} size="small" sx={{ mb: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Available Colors:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {currentProduct.colors && currentProduct.colors.map((color) => (
                      <Chip key={color} label={color} size="small" />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Available Sizes:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {currentProduct.sizes && (Array.isArray(currentProduct.sizes) ? currentProduct.sizes : []).map((size) => (
                      <Chip
                        key={typeof size === 'object' ? size.size : size}
                        label={typeof size === 'object' ? size.size : size}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Typography variant="subtitle2" gutterBottom>
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {currentProduct.tags && currentProduct.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleProductDetailClose}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => {
                  handleManualSwipe('left');
                  handleProductDetailClose();
                }}
              >
                Not Interested
              </Button>
              <Button
                variant="contained"
                startIcon={<FavoriteIcon />}
                color="primary"
                onClick={() => {
                  handleManualSwipe('right');
                  handleProductDetailClose();
                }}
              >
                Like
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { width: { xs: '80%', sm: 350 } }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFiltersOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            placeholder="Search products..."
            value={filterOptions.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>Category</Typography>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <Select
              value={filterOptions.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              displayEmpty
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
          <Box sx={{ px: 1, mb: 3 }}>
            <Slider
              value={filterOptions.priceRange}
              onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">${filterOptions.priceRange[0]}</Typography>
              <Typography variant="body2">${filterOptions.priceRange[1]}</Typography>
            </Box>
          </Box>

          <Typography variant="subtitle1" gutterBottom>Sizes</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {availableSizes.map((size) => (
              <Chip
                key={size}
                label={size}
                onClick={() => handleToggleSize(size)}
                color={filterOptions.sizes.includes(size) ? "primary" : "default"}
                variant={filterOptions.sizes.includes(size) ? "filled" : "outlined"}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <Typography variant="subtitle1" gutterBottom>Colors</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
            {availableColors.map((color) => (
              <Chip
                key={color}
                label={color}
                onClick={() => handleToggleColor(color)}
                color={filterOptions.colors.includes(color) ? "primary" : "default"}
                variant={filterOptions.colors.includes(color) ? "filled" : "outlined"}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.onlyOnSale}
                onChange={(e) => handleFilterChange('onlyOnSale', e.target.checked)}
                color="primary"
              />
            }
            label="Only show items on sale"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={resetFilters}
              startIcon={<FormatColorResetIcon />}
              fullWidth
            >
              Reset Filters
            </Button>
            <Button
              variant="contained"
              onClick={() => setFiltersOpen(false)}
              fullWidth
            >
              Apply Filters
            </Button>
          </Box>

          {/* Filter summary if filters are active */}
          {(filterOptions.category !== 'All Categories' ||
            filterOptions.priceRange[0] !== 0 ||
            filterOptions.priceRange[1] !== 100 ||
            filterOptions.searchQuery ||
            filterOptions.onlyOnSale ||
            filterOptions.sizes.length > 0 ||
            filterOptions.colors.length > 0) && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <List dense>
                  {filterOptions.category !== 'All Categories' && (
                    <ListItem dense>
                      <ListItemText
                        primary={`Category: ${filterOptions.category}`}
                      />
                    </ListItem>
                  )}

                  {(filterOptions.priceRange[0] !== 0 || filterOptions.priceRange[1] !== 100) && (
                    <ListItem dense>
                      <ListItemText
                        primary={`Price: $${filterOptions.priceRange[0]} - $${filterOptions.priceRange[1]}`}
                      />
                    </ListItem>
                  )}

                  {filterOptions.searchQuery && (
                    <ListItem dense>
                      <ListItemText
                        primary={`Search: "${filterOptions.searchQuery}"`}
                      />
                    </ListItem>
                  )}

                  {filterOptions.onlyOnSale && (
                    <ListItem dense>
                      <ListItemText
                        primary="Only items on sale"
                      />
                    </ListItem>
                  )}

                  {filterOptions.sizes.length > 0 && (
                    <ListItem dense>
                      <ListItemText
                        primary={`Sizes: ${filterOptions.sizes.join(', ')}`}
                      />
                    </ListItem>
                  )}

                  {filterOptions.colors.length > 0 && (
                    <ListItem dense>
                      <ListItemText
                        primary={`Colors: ${filterOptions.colors.join(', ')}`}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
        </Box>
      </Drawer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        addToCart={handleAddToCart}
        removeFromCart={removeFromCart}
        updateQuantity={handleUpdateQuantity}
        getCartTotal={getCartTotal}
        userRewardPoints={1500} // Use actual user reward points from context if available
      />
    </Box>
  );
}