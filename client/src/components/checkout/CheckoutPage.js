import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  MenuItem,
  Select,
  InputLabel,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RedeemIcon from '@mui/icons-material/Redeem';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import contexts
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';

const steps = ['Review Cart', 'Shipping Information', 'Payment Method', 'Order Confirmation'];

// Sample countries for the form
const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Japan',
  'China',
  'India',
  'Brazil',
  'Mexico',
  'South Korea'
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { 
    cart, 
    getCartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    checkout 
  } = useCart();
    const { user, isAuthenticated } = useContext(AuthContext);
  
  // Safe formatter function
  const safeToFixed = (value, digits = 2) => {
    if (value === undefined || value === null) return "0.00";
    return Number(value).toFixed(digits);
  };

  // Calculate reward points based on cart total (typically 10 points per dollar)
  const getCartRewardPoints = () => {
    return Math.round(getCartTotal() * 10);
  };
  
  const [activeStep, setActiveStep] = useState(0);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    email: user?.email || ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderId, setOrderId] = useState(null);
  const [orderDate, setOrderDate] = useState(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('new');
  const [userRewardPoints, setUserRewardPoints] = useState(user?.rewardPoints || 1500);

  // Load saved addresses when component mounts
  useEffect(() => {
    const loadSavedAddresses = async () => {
      // In a real app, this would call an API to get saved addresses
      // For now, simulating with mock data
      const mockSavedAddresses = [
        {
          id: 'addr1',
          nickname: 'Home',
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          address1: '123 Main St',
          address2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
          phone: '212-555-1234',
          isDefault: true
        },
        {
          id: 'addr2',
          nickname: 'Work',
          firstName: user?.firstName || 'John',
          lastName: user?.lastName || 'Doe',
          address1: '456 Market St',
          address2: 'Floor 3',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'United States',
          phone: '415-555-6789',
          isDefault: false
        }
      ];
      
      setSavedAddresses(mockSavedAddresses);
    };
    
    if (isAuthenticated()) {
      loadSavedAddresses();
    }
  }, [isAuthenticated, user]);

  // Check if cart is empty and navigate back if it is
  useEffect(() => {
    if (cart.length === 0 && activeStep === 0) {
      // Navigate back to previous page if cart is empty
      navigate(-1);
    }
  }, [cart, navigate, activeStep]);

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate shipping information
      const errors = validateShippingForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0);
  };

  const validateShippingForm = () => {
    const errors = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.address1.trim()) errors.address1 = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State/Province is required';
    if (!shippingInfo.zipCode.trim()) errors.zipCode = 'ZIP/Postal code is required';
    if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      errors.email = 'Email is invalid';
    }
    
    return errors;
  };

  const handleShippingInfoChange = (event) => {
    const { name, value } = event.target;
    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });
    
    // Clear error for the field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleUseRewardPointsChange = (event) => {
    setUseRewardPoints(event.target.checked);
  };

  const handleSavedAddressChange = (event) => {
    const addressId = event.target.value;
    setSelectedSavedAddress(addressId);
    
    if (addressId === 'new') {
      // Reset shipping info if "new address" is selected
      setShippingInfo({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        phone: '',
        email: user?.email || ''
      });
    } else {
      // Find selected address and populate form
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setShippingInfo({
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          address1: selectedAddress.address1,
          address2: selectedAddress.address2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
          phone: selectedAddress.phone,
          email: user?.email || ''
        });
      }
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare shipping information
      const shippingData = {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address: shippingInfo.address1,
        address2: shippingInfo.address2,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone,
        email: shippingInfo.email
      };
      
      // Prepare payment information
      const paymentInfo = {
        method: paymentMethod,
        useRewardPoints: useRewardPoints,
        rewardPointsUsed: useRewardPoints ? Math.min(userRewardPoints, getCartTotal() * 10) : 0
      };
      
      // Use the checkout function from CartContext
      const result = await checkout(shippingInfo, paymentInfo);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to place order');
      }
      
      // Set order details for the confirmation page
      setOrderId(result.orderId);
      setOrderDate(new Date().toISOString());
      
      // Set estimated delivery date (current date + 7 days)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);
      setEstimatedDelivery(deliveryDate.toISOString());
      
      // Move to confirmation step
      setActiveStep(3);
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.message || 'Failed to place order. Please try again.');
      
      setSnackbar({
        open: true,
        message: error.message || 'Failed to place order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleReturnToShopping = () => {
    navigate('/marketplace');
  };

  const handleViewOrderDetails = () => {
    navigate('/profile');
  };

  const renderCartReview = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Review Your Cart
        </Typography>
        
        {cart.length === 0 ? (
          <Typography variant="body1" sx={{ my: 4 }}>
            Your cart is empty. Please add items before proceeding to checkout.
          </Typography>
        ) : (
          <>
            <Paper sx={{ mb: 3, p: 2 }}>
              <List>
                {cart.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeFromCart(item.id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={item.image} 
                          alt={item.name} 
                          variant="square"
                          sx={{ width: 60, height: 60, mr: 2, borderRadius: 1 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={
                          <React.Fragment>
                            <Typography variant="body2" component="span">
                              Size: {item.size} {item.isSecondHand && `| Condition: ${item.condition}`}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" color="primary" sx={{ fontWeight: 'bold' }}>
                              ${parseFloat(item.price).toFixed(2)} x {item.quantity}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', minWidth: 120 }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ minWidth: 30, p: 0 }}
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Typography sx={{ mx: 1 }}>
                          {item.quantity}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          sx={{ minWidth: 30, p: 0 }}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </Box>
                      <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold', minWidth: 100, textAlign: 'right' }}>
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                >
                  Continue Shopping
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {cart.reduce((total, item) => total + item.quantity, 0)} items in your cart
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">${safeToFixed(getCartTotal())}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1">FREE</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax:</Typography>
                <Typography variant="body1">${safeToFixed(getCartTotal() * 0.07)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${safeToFixed(getCartTotal() + (getCartTotal() * 0.07))}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Reward Points Value: {getCartRewardPoints()} points
                </Typography>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    );
  };

  const renderShippingInfo = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Shipping Information
        </Typography>
        
        {isAuthenticated() && savedAddresses.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="saved-address-label">Choose Address</InputLabel>
              <Select
                labelId="saved-address-label"
                id="saved-address"
                value={selectedSavedAddress}
                label="Choose Address"
                onChange={handleSavedAddressChange}
              >
                <MenuItem value="new">Add New Address</MenuItem>
                {savedAddresses.map((address) => (
                  <MenuItem key={address.id} value={address.id}>
                    {address.nickname} - {address.address1}, {address.city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="firstName"
              name="firstName"
              label="First Name"
              fullWidth
              variant="outlined"
              value={shippingInfo.firstName}
              onChange={handleShippingInfoChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="lastName"
              name="lastName"
              label="Last Name"
              fullWidth
              variant="outlined"
              value={shippingInfo.lastName}
              onChange={handleShippingInfoChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="address1"
              name="address1"
              label="Street Address"
              fullWidth
              variant="outlined"
              value={shippingInfo.address1}
              onChange={handleShippingInfoChange}
              error={!!formErrors.address1}
              helperText={formErrors.address1}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="address2"
              name="address2"
              label="Apt, Suite, Unit, etc. (optional)"
              fullWidth
              variant="outlined"
              value={shippingInfo.address2}
              onChange={handleShippingInfoChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="city"
              name="city"
              label="City"
              fullWidth
              variant="outlined"
              value={shippingInfo.city}
              onChange={handleShippingInfoChange}
              error={!!formErrors.city}
              helperText={formErrors.city}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="state"
              name="state"
              label="State/Province/Region"
              fullWidth
              variant="outlined"
              value={shippingInfo.state}
              onChange={handleShippingInfoChange}
              error={!!formErrors.state}
              helperText={formErrors.state}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              id="zipCode"
              name="zipCode"
              label="ZIP / Postal Code"
              fullWidth
              variant="outlined"
              value={shippingInfo.zipCode}
              onChange={handleShippingInfoChange}
              error={!!formErrors.zipCode}
              helperText={formErrors.zipCode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="country-label">Country</InputLabel>
              <Select
                labelId="country-label"
                id="country"
                name="country"
                value={shippingInfo.country}
                label="Country"
                onChange={handleShippingInfoChange}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="phone"
              name="phone"
              label="Phone Number"
              fullWidth
              variant="outlined"
              value={shippingInfo.phone}
              onChange={handleShippingInfoChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="email"
              name="email"
              label="Email Address"
              fullWidth
              variant="outlined"
              value={shippingInfo.email}
              onChange={handleShippingInfoChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </Grid>
          {isAuthenticated() && (
            <Grid item xs={12}>
              <FormControlLabel
                control={<Radio checked={true} />}
                label="Save address to my account for future orders"
              />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const renderPaymentMethod = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Payment Method
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Select Payment Method</FormLabel>
                <RadioGroup
                  aria-label="payment method"
                  name="payment-method"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  <FormControlLabel 
                    value="credit_card" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon sx={{ mr: 1 }} />
                        Credit / Debit Card
                      </Box>
                    } 
                  />
                  
                  {isAuthenticated() && (
                    <FormControlLabel 
                      value="reward_points" 
                      control={<Radio />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <RedeemIcon sx={{ mr: 1 }} />
                          Pay with Reward Points
                          <Chip 
                            label={`${userRewardPoints} points available`} 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      disabled={userRewardPoints < getCartRewardPoints()}
                    />
                  )}
                </RadioGroup>
              </FormControl>
              
              {paymentMethod === 'credit_card' && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Card Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        id="cardName"
                        label="Name on Card"
                        fullWidth
                        variant="outlined"
                        defaultValue={`${shippingInfo.firstName} ${shippingInfo.lastName}`}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        id="cardNumber"
                        label="Card Number"
                        fullWidth
                        variant="outlined"
                        placeholder="XXXX XXXX XXXX XXXX"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        id="expDate"
                        label="Expiry Date"
                        fullWidth
                        variant="outlined"
                        placeholder="MM/YY"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        required
                        id="cvv"
                        label="CVV"
                        fullWidth
                        variant="outlined"
                        placeholder="XXX"
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {paymentMethod === 'reward_points' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f8f8', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Reward Points Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Your Available Points:</Typography>
                    <Typography variant="body2" fontWeight="bold">{userRewardPoints}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Points Required for This Order:</Typography>
                    <Typography variant="body2" fontWeight="bold" color={getCartRewardPoints() > userRewardPoints ? 'error' : 'inherit'}>
                      {getCartRewardPoints()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Remaining Points After Purchase:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.max(0, userRewardPoints - getCartRewardPoints())}
                    </Typography>
                  </Box>
                  
                  {getCartRewardPoints() > userRewardPoints && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      You don't have enough reward points for this purchase. Please select a different payment method.
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">${safeToFixed(getCartTotal())}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Shipping:</Typography>
                <Typography variant="body1">FREE</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax:</Typography>
                <Typography variant="body1">${safeToFixed(getCartTotal() * 0.07)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${safeToFixed(getCartTotal() + (getCartTotal() * 0.07))}</Typography>
              </Box>
              
              {paymentMethod === 'reward_points' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <LocalOfferIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {getCartRewardPoints()} reward points will be used
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <LocalOfferIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    You'll earn {getCartRewardPoints()} reward points
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Shipping to:
                </Typography>
                <Typography variant="body2">
                  {shippingInfo.firstName} {shippingInfo.lastName}
                </Typography>
                <Typography variant="body2">
                  {shippingInfo.address1}
                  {shippingInfo.address2 && `, ${shippingInfo.address2}`}
                </Typography>
                <Typography variant="body2">
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                </Typography>
                <Typography variant="body2">
                  {shippingInfo.country}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderConfirmation = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Order Confirmed!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Order #{orderId}
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for your purchase. We've received your order and will begin processing it right away.
        </Typography>
        
        <Paper sx={{ maxWidth: 600, mx: 'auto', p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Order Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Order Date:</Typography>
            <Typography variant="body2">{orderDate ? new Date(orderDate).toLocaleDateString() : '-'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
            <Typography variant="body2">
              {paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 'Reward Points'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Estimated Delivery:</Typography>
            <Typography variant="body2">{estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString() : '-'}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2">Shipping Address:</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2">
                {shippingInfo.firstName} {shippingInfo.lastName}
              </Typography>
              <Typography variant="body2">
                {shippingInfo.address1}{shippingInfo.address2 && `, ${shippingInfo.address2}`}
              </Typography>
              <Typography variant="body2">
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleReturnToShopping}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            onClick={handleViewOrderDetails}
          >
            View Order Details
          </Button>
        </Box>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderCartReview();
      case 1:
        return renderShippingInfo();
      case 2:
        return renderPaymentMethod();
      case 3:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box sx={{ mb: 4 }}>
        {getStepContent(activeStep)}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        {activeStep > 0 && activeStep < 3 && (
          <Button 
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
        )}
        
        {activeStep === 3 ? null : (
          activeStep === 2 ? (
            <Button 
              variant="contained" 
              onClick={handlePlaceOrder}
              disabled={loading || (paymentMethod === 'reward_points' && getCartRewardPoints() > userRewardPoints)}
              sx={{ ml: 'auto' }}
            >
              {loading ? (
                <React.Fragment>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" /> 
                  Processing...
                </React.Fragment>
              ) : (
                'Place Order'
              )}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={(activeStep === 0 && cart.length === 0)}
              sx={{ ml: 'auto' }}
            >
              Continue
            </Button>
          )
        )}
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}