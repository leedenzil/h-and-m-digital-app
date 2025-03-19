import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../common/CartDrawer';


const categories = [
  'All Categories',
  'Shirts',
  'Pants',
  'Dresses',
  'Jackets',
  'Coats',
  'Sweaters',
  'Accessories',
  'Bags',
  'Shoes',
  'Other'
];

const conditions = ['All Conditions', 'New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'];
const sizes = ['All Sizes', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'One Size'];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, updateQuantity, getCartCount, getCartTotal } = useCart();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('newest');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    onlySubscriptionItems: false,
    onlyReturnable: false
  });
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const [userRewardPoints, setUserRewardPoints] = useState(1500); // Mock user reward points
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        console.log('Fetching marketplace products...');
        const response = await fetch('http://localhost:5001/api/marketplace');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Marketplace data:', data);

        // Handle different response formats
        const productList = data.products || data;

        setProducts(productList);
        setFilteredProducts(productList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching marketplace products:', error);
        setError(error.message);
        setLoading(false);

        // Show error in snackbar
        setSnackbar({
          open: true,
          message: `Error loading products: ${error.message}`,
          severity: 'error'
        });
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((product) =>
        product.category === selectedCategory
      );
    }

    // Size filter
    if (selectedSize !== 'All Sizes') {
      filtered = filtered.filter((product) => {
        if (!product.sizes) return false;

        // Handle both array of strings and array of objects
        return product.sizes.some(size => {
          if (typeof size === 'string') return size === selectedSize;
          return size.size === selectedSize;
        });
      });
    }

    // Condition filter
    if (selectedCondition !== 'All Conditions') {
      filtered = filtered.filter((product) =>
        product.condition === selectedCondition
      );
    }

    // Price range filter
    filtered = filtered.filter((product) =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Additional filters
    if (filterOptions.onlySubscriptionItems) {
      filtered = filtered.filter((product) => product.fromSubscription);
    }

    if (filterOptions.onlyReturnable) {
      filtered = filtered.filter((product) => product.returnable);
    }

    // Sort
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high-low':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
        // Sort by popularity or rating if available
        filtered.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
        break;
      default:
        // Default sort by newest (assuming newer items have higher IDs or newer dates)
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredProducts(filtered);
    setPage(1);
  }, [products, searchQuery, selectedCategory, selectedSize, selectedCondition, priceRange, sortBy, filterOptions]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSizeChange = (event) => {
    setSelectedSize(event.target.value);
  };

  const handleConditionChange = (event) => {
    setSelectedCondition(event.target.value);
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleFilterToggle = () => {
    setFiltersOpen(!filtersOpen);
  };

  const handleCartToggle = () => {
    setCartOpen(!cartOpen);
  };

  const handleAddToCart = (product) => {
    addToCart(product);

    // Show success message
    setSnackbar({
      open: true,
      message: `Added ${product.name} to your cart`,
      severity: 'success'
    });
  };


  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setProductDetailOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTryOn = (product) => {
    setSelectedProduct(product);
    setTryOnOpen(true);
  };

  const handleCheckout = () => {
    // Navigate to checkout page instead of processing checkout here
    navigate('/checkout');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedSize('All Sizes');
    setSelectedCondition('All Conditions');
    setPriceRange([0, 100]);
    setFilterOptions({
      onlySubscriptionItems: false,
      onlyReturnable: false
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate total cart value
  const cartTotal = getCartTotal();
  const cartRewardPoints = cart.reduce((total, item) => total + (item.rewardPoints * item.quantity), 0);

  // Calculate current page items
  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading marketplace items...
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Second-hand Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Browse quality second-hand items, including returns from our subscription service
      </Typography>

      {/* Search and Filter Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
              size="small"
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              size="small"
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low-high">Price: Low to High</MenuItem>
              <MenuItem value="price-high-low">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleFilterToggle}
          >
            Filters
          </Button>

          <Badge badgeContent={getCartCount()} color="primary">
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleCartToggle}
            >
              Cart
            </Button>
          </Badge>
        </Box>
      </Box>

      {/* Active Filters */}
      {(searchQuery ||
        selectedCategory !== 'All Categories' ||
        selectedSize !== 'All Sizes' ||
        selectedCondition !== 'All Conditions' ||
        priceRange[0] > 0 ||
        priceRange[1] < 100 ||
        filterOptions.onlySubscriptionItems ||
        filterOptions.onlyReturnable) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              Active Filters:
            </Typography>

            {searchQuery && (
              <Chip
                label={`Search: ${searchQuery}`}
                onDelete={() => setSearchQuery('')}
                size="small"
              />
            )}

            {selectedCategory !== 'All Categories' && (
              <Chip
                label={`Category: ${selectedCategory}`}
                onDelete={() => setSelectedCategory('All Categories')}
                size="small"
              />
            )}

            {selectedSize !== 'All Sizes' && (
              <Chip
                label={`Size: ${selectedSize}`}
                onDelete={() => setSelectedSize('All Sizes')}
                size="small"
              />
            )}

            {selectedCondition !== 'All Conditions' && (
              <Chip
                label={`Condition: ${selectedCondition}`}
                onDelete={() => setSelectedCondition('All Conditions')}
                size="small"
              />
            )}

            {(priceRange[0] > 0 || priceRange[1] < 100) && (
              <Chip
                label={`Price: $${priceRange[0]} - $${priceRange[1]}`}
                onDelete={() => setPriceRange([0, 100])}
                size="small"
              />
            )}

            {filterOptions.onlySubscriptionItems && (
              <Chip
                label="Subscription Returns Only"
                onDelete={() => setFilterOptions({ ...filterOptions, onlySubscriptionItems: false })}
                size="small"
              />
            )}

            {filterOptions.onlyReturnable && (
              <Chip
                label="Returnable Only"
                onDelete={() => setFilterOptions({ ...filterOptions, onlyReturnable: false })}
                size="small"
              />
            )}

            <Button
              variant="text"
              size="small"
              startIcon={<FormatColorResetIcon />}
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </Box>
        )}

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} results
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RecyclingIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Your Reward Points: <strong>{userRewardPoints.toLocaleString()}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Typography variant="h6" color="text.secondary">
            No products match your filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentItems.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {product.fromSubscription && (
                  <Chip
                    label="Subscription Return"
                    color="primary"
                    size="small"
                    icon={<RecyclingIcon />}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      zIndex: 1
                    }}
                  />
                )}

                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.images && product.images.length > 0
                      ? product.images.find(img => img.isMain)?.url || product.images[0].url
                      : '/api/placeholder/300/400'}
                    alt={product.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleProductClick(product)}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="caption">
                      Condition: {product.condition || 'New'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Rating value={product.ratings?.average || 0} precision={0.5} size="small" readOnly />
                    </Box>
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {product.name}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" color="primary" component="span">
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1, textDecoration: 'line-through' }}>
                        ${parseFloat(product.originalPrice).toFixed(2)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((1 - product.price / product.originalPrice) * 100)}% off`}
                      size="small"
                      color="secondary"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={product.category}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={product.sizes && product.sizes.length > 0
                        ? (typeof product.sizes[0] === 'object' ? product.sizes[0].size : product.sizes[0])
                        : 'One Size'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description?.length > 60
                      ? `${product.description.substring(0, 60)}...`
                      : product.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalOfferIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {product.rewardPoints || Math.round(product.price * 10)} reward points
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleTryOn(product)}
                    sx={{ mr: 1 }}
                  >
                    Try On
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* Filters Drawer */}
      <Drawer
        anchor="right"
        open={filtersOpen}
        onClose={handleFilterToggle}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={handleFilterToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Price Range
          </Typography>
          <Box sx={{ px: 2, mb: 3 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={100}
              valueLabelFormat={(value) => `$${value}`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">${priceRange[0]}</Typography>
              <Typography variant="body2">${priceRange[1]}</Typography>
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Size</InputLabel>
            <Select
              value={selectedSize}
              label="Size"
              onChange={handleSizeChange}
            >
              {sizes.map((size) => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={selectedCondition}
              label="Condition"
              onChange={handleConditionChange}
            >
              {conditions.map((condition) => (
                <MenuItem key={condition} value={condition}>{condition}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle1" gutterBottom>
            Additional Filters
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.onlySubscriptionItems}
                  onChange={(e) => setFilterOptions({ ...filterOptions, onlySubscriptionItems: e.target.checked })}
                />
              }
              label="Subscription Returns Only"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterOptions.onlyReturnable}
                  onChange={(e) => setFilterOptions({ ...filterOptions, onlyReturnable: e.target.checked })}
                />
              }
              label="Returnable Items Only"
            />
          </FormGroup>

          <Button
            variant="contained"
            fullWidth
            onClick={handleFilterToggle}
            sx={{ mt: 3 }}
          >
            Apply Filters
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleClearFilters}
            sx={{ mt: 1 }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Drawer>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onClose={handleCartToggle}
        cart={cart}
        addToCart={handleAddToCart}
        removeFromCart={handleRemoveFromCart}
        updateQuantity={handleUpdateQuantity}
        getCartTotal={getCartTotal}
        userRewardPoints={userRewardPoints}
      />

      {/* Product Detail Dialog */}
      <Dialog
        open={productDetailOpen}
        onClose={() => setProductDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              {selectedProduct.name}
              <IconButton
                aria-label="close"
                onClick={() => setProductDetailOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedProduct.images && selectedProduct.images.length > 0
                      ? selectedProduct.images.find(img => img.isMain)?.url || selectedProduct.images[0].url
                      : '/api/placeholder/600/400'}
                    alt={selectedProduct.name}
                    sx={{ width: '100%', borderRadius: '4px' }}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setProductDetailOpen(false);
                        handleTryOn(selectedProduct);
                      }}
                      fullWidth
                    >
                      Try On (AR)
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* Product details would go here */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {selectedProduct.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={selectedProduct.ratings?.average || 0} precision={0.5} readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({selectedProduct.ratings?.count || 0} reviews)
                        </Typography>
                      </Box>
                    </Box>
                    {selectedProduct.fromSubscription && (
                      <Chip
                        label="Subscription Return"
                        color="primary"
                        icon={<RecyclingIcon />}
                      />
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary" component="span">
                      ${parseFloat(selectedProduct.price).toFixed(2)}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" component="span" sx={{ ml: 1, textDecoration: 'line-through' }}>
                      ${parseFloat(selectedProduct.originalPrice).toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% off`}
                      color="secondary"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Description:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedProduct.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Category:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.category}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Sizes:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.sizes && selectedProduct.sizes.length > 0
                          ? selectedProduct.sizes.map(s => typeof s === 'object' ? s.size : s).join(', ')
                          : 'One Size'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Condition:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.condition || 'New'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Returnable:
                      </Typography>
                      <Typography variant="body1">
                        {selectedProduct.returnable !== false ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setProductDetailOpen(false);
                      }}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setProductDetailOpen(false);
                        handleCartToggle();
                      }}
                    >
                      Buy Now
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Try On Dialog - Simplified for this example */}
      <Dialog
        open={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              Try On: {selectedProduct.name}
              <IconButton
                aria-label="close"
                onClick={() => setTryOnOpen(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  AR Try-On Experience
                </Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                  In a complete implementation, this would open the AR try-on feature where you can see how this item looks on you.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box component="svg" viewBox="0 0 24 24" sx={{ fontSize: 100, color: 'primary.main' }}>
                    <path
                      fill="currentColor"
                      d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    setTryOnOpen(false);
                    window.location.href = '/try-on';
                  }}
                >
                  Go to AR Try-On Page
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// These icons aren't defined in the original code
const RemoveIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M19 13H5v-2h14v2z" />
  </svg>
);

const AddIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);