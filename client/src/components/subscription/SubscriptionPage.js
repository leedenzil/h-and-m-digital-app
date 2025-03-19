import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Divider,
  Chip,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CelebrationIcon from '@mui/icons-material/Celebration';

// Subscription plan options
const planTypes = [
  {
    id: "monthly",
    title: "Monthly Refresh",
    description: "Get new styles every month",
    interval: "monthly",
    priceMultiplier: 1
  },
  {
    id: "quarterly",
    title: "Quarterly Collection",
    description: "Seasonal styles every 3 months",
    interval: "quarterly",
    priceMultiplier: 2.8 // Slight discount for quarterly
  }
];

const packageTypes = [
  {
    id: "full",
    title: "Full Set",
    description: "Complete outfit including shirt, pants, and accessories",
    includes: ["Shirt", "Pants", "Accessories"],
    basePrice: 89.99
  },
  {
    id: "tops",
    title: "Tops Only",
    description: "Selection of shirts and tops",
    includes: ["Shirt/Top"],
    basePrice: 49.99
  },
  {
    id: "accessories",
    title: "Accessories Only",
    description: "Selection of accessories (rings, necklaces, sunglasses, etc.)",
    includes: ["Accessories"],
    basePrice: 39.99
  }
];

const tierOptions = [
  {
    id: "budget",
    title: "Budget Friendly",
    description: "Quality basics at affordable prices",
    priceMultiplier: 1,
    itemQuality: "Basic essentials"
  },
  {
    id: "mid",
    title: "Premium Selection",
    description: "Higher quality materials and trendy styles",
    priceMultiplier: 1.5,
    itemQuality: "Premium materials"
  },
  {
    id: "luxury",
    title: "Luxury Collection",
    description: "Designer collaborations and exclusive pieces",
    priceMultiplier: 2.2,
    itemQuality: "Exclusive designs"
  }
];

const festiveOptions = [
  {
    id: "none",
    title: "No Festive Package",
    description: "Regular subscription without festive items",
    priceAddon: 0
  },
  {
    id: "cny",
    title: "Chinese New Year Collection",
    description: "Special CNY outfits and accessories",
    priceAddon: 29.99,
    icon: <CelebrationIcon />
  },
  {
    id: "christmas",
    title: "Holiday Season Package",
    description: "Festive outfits for the holiday season",
    priceAddon: 29.99,
    icon: <CelebrationIcon />
  },
  {
    id: "summer",
    title: "Summer Special",
    description: "Beach-ready outfits and accessories",
    priceAddon: 24.99,
    icon: <CelebrationIcon />
  }
];

// Available colors for preferences
const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Grey'];

// Available styles for preferences
const availableStyles = ['Casual', 'Formal', 'Business', 'Sporty', 'Vintage', 'Minimalist', 'Bohemian', 'Street'];

export default function SubscriptionPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedFestive, setSelectedFestive] = useState(festiveOptions[0]);
  const [includeSecondHand, setIncludeSecondHand] = useState(false);
  const [preferences, setPreferences] = useState({
    colors: [],
    styles: [],
    sizes: {
      top: '',
      bottom: '',
      shoe: ''
    },
    excludedItems: [],
    notes: ''
  });
  
  // Added states for form validation and API integration
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const steps = ['Select Plan', 'Customize Package', 'Style Preferences', 'Review & Confirm'];

  // Check if user is authenticated
  useEffect(() => {
    // Simplified authentication check for the prototype
    const isAuthenticated = true; // Mock authentication
    
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to create a subscription',
        severity: 'warning'
      });
    }
  }, []);

  const handleNext = () => {
    // Validate current step before proceeding
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      window.scrollTo(0, 0); // Scroll to top when changing steps
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    window.scrollTo(0, 0); // Scroll to top when changing steps
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedPlan(null);
    setSelectedPackage(null);
    setSelectedTier(null);
    setSelectedFestive(festiveOptions[0]);
    setIncludeSecondHand(false);
    setPreferences({
      colors: [],
      styles: [],
      sizes: {
        top: '',
        bottom: '',
        shoe: ''
      },
      excludedItems: [],
      notes: ''
    });
    setErrors({});
    setSubmissionError(null);
    setSubmissionSuccess(false);
  };

  const calculateTotalPrice = () => {
    if (!selectedPlan || !selectedPackage || !selectedTier) return 0;
    
    const basePrice = selectedPackage.basePrice;
    const tierMultiplier = selectedTier.priceMultiplier;
    const planMultiplier = selectedPlan.priceMultiplier;
    const festiveAddon = selectedFestive.priceAddon;
    const secondHandDiscount = includeSecondHand ? 0.9 : 1; // 10% discount if including second hand items
    
    return ((basePrice * tierMultiplier * planMultiplier) + festiveAddon) * secondHandDiscount;
  };

  // Validate each step
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (activeStep) {
      case 0:
        if (!selectedPlan) {
          newErrors.plan = 'Please select a subscription plan';
        }
        break;
      case 1:
        if (!selectedPackage) {
          newErrors.package = 'Please select a package type';
        }
        if (!selectedTier) {
          newErrors.tier = 'Please select a quality tier';
        }
        break;
      case 2:
        if (preferences.colors.length === 0) {
          newErrors.colors = 'Please select at least one color preference';
        }
        if (preferences.styles.length === 0) {
          newErrors.styles = 'Please select at least one style preference';
        }
        if (!preferences.sizes.top) {
          newErrors.topSize = 'Please select your top size';
        }
        if (!preferences.sizes.bottom) {
          newErrors.bottomSize = 'Please select your bottom size';
        }
        if (!preferences.sizes.shoe) {
          newErrors.shoeSize = 'Please select your shoe size';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit the subscription
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    setSubmissionError(null);
    
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionSuccess(true);
        setSnackbar({
          open: true,
          message: 'Subscription created successfully! Your first box will arrive soon.',
          severity: 'success'
        });
      }, 2000);
    } catch (error) {
      setSubmissionError("An error occurred. Please try again.");
      setSnackbar({
        open: true,
        message: "Failed to create subscription. Please try again.",
        severity: 'error'
      });
      setIsSubmitting(false);
    }
  };

  // Toggle color selection
  const toggleColorSelection = (color) => {
    setPreferences((prev) => {
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

  // Toggle style selection
  const toggleStyleSelection = (style) => {
    setPreferences((prev) => {
      if (prev.styles.includes(style)) {
        return {
          ...prev,
          styles: prev.styles.filter(s => s !== style)
        };
      } else {
        return {
          ...prev,
          styles: [...prev.styles, style]
        };
      }
    });
  };

  // Update preferences size
  const handleSizeChange = (type, value) => {
    setPreferences({
      ...preferences,
      sizes: {
        ...preferences.sizes,
        [type]: value
      }
    });
  };

  // Toggle excluded item
  const toggleExcludedItem = (item) => {
    setPreferences((prev) => {
      if (prev.excludedItems.includes(item)) {
        return {
          ...prev,
          excludedItems: prev.excludedItems.filter(i => i !== item)
        };
      } else {
        return {
          ...prev,
          excludedItems: [...prev.excludedItems, item]
        };
      }
    });
  };

  // Update notes
  const handleNotesChange = (event) => {
    setPreferences({
      ...preferences,
      notes: event.target.value
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const renderPlanSelection = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Choose Your Subscription Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Select how often you'd like to receive your fashion box
        </Typography>
        
        {errors.plan && (
          <Alert severity="error" sx={{ mb: 2 }}>{errors.plan}</Alert>
        )}
        
        <Grid container spacing={3}>
          {planTypes.map((plan) => (
            <Grid item xs={12} md={6} key={plan.id}>
              <Card 
                variant={selectedPlan === plan ? "outlined" : "elevation"}
                sx={{ 
                  cursor: 'pointer',
                  border: selectedPlan === plan ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => setSelectedPlan(plan)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AutorenewIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {plan.interval === 'monthly' ? 'Every month' : 'Every 3 months'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {plan.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  {selectedPlan === plan ? (
                    <Chip 
                      label="Selected" 
                      color="primary" 
                      icon={<CheckIcon />} 
                      variant="filled" 
                    />
                  ) : (
                    <Button size="small" color="primary">
                      Select
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderPackageSelection = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Customize Your Package
        </Typography>
        
        {(errors.package || errors.tier) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.package && <div>{errors.package}</div>}
            {errors.tier && <div>{errors.tier}</div>}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Package Type
            </Typography>
            <Grid container spacing={2}>
              {packageTypes.map((pkg) => (
                <Grid item xs={12} md={4} key={pkg.id}>
                  <Card 
                    variant={selectedPackage === pkg ? "outlined" : "elevation"}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedPackage === pkg ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {pkg.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {pkg.description}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Includes:
                      </Typography>
                      <List dense>
                        {pkg.includes.map((item, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardActions>
                      <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                        ${pkg.basePrice.toFixed(2)}
                      </Typography>
                      {selectedPackage === pkg && (
                        <Chip 
                          label="Selected" 
                          color="primary" 
                          size="small" 
                          sx={{ ml: 'auto' }} 
                        />
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Quality Tier
            </Typography>
            <Grid container spacing={2}>
              {tierOptions.map((tier) => (
                <Grid item xs={12} md={4} key={tier.id}>
                  <Card 
                    variant={selectedTier === tier ? "outlined" : "elevation"}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedTier === tier ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setSelectedTier(tier)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {tier.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {tier.description}
                      </Typography>
                      <Typography variant="body2">
                        {tier.itemQuality}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Chip 
                        label={tier.id === 'budget' ? 'Budget' : tier.id === 'mid' ? 'Standard' : 'Premium'} 
                        color={tier.id === 'budget' ? 'default' : tier.id === 'mid' ? 'primary' : 'secondary'} 
                      />
                      {selectedTier === tier && (
                        <Chip 
                          label="Selected" 
                          color="primary" 
                          size="small" 
                          sx={{ ml: 'auto' }} 
                        />
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Festive Special (Optional)
            </Typography>
            <Grid container spacing={2}>
              {festiveOptions.map((option) => (
                <Grid item xs={12} md={3} key={option.id}>
                  <Card 
                    variant={selectedFestive === option ? "outlined" : "elevation"}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedFestive === option ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      height: '100%',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => setSelectedFestive(option)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </CardContent>
                    {option.id !== 'none' && (
                      <CardActions>
                        <Typography variant="body2" color="primary">
                          +${option.priceAddon.toFixed(2)}
                        </Typography>
                        {selectedFestive === option && (
                          <Chip 
                            label="Selected" 
                            color="primary" 
                            size="small" 
                            sx={{ ml: 'auto' }} 
                          />
                        )}
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={includeSecondHand}
                    onChange={(e) => setIncludeSecondHand(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Include second-hand items (10% discount)</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sustainable fashion option with quality-checked returned items
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Your Subscription Summary
              </Typography>
              
              {selectedPlan && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Plan:
                  </Typography>
                  <Typography variant="body1">
                    {selectedPlan.title}
                  </Typography>
                </Box>
              )}
              
              {selectedPackage && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Package:
                  </Typography>
                  <Typography variant="body1">
                    {selectedPackage.title}
                  </Typography>
                </Box>
              )}
              
              {selectedTier && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quality Tier:
                  </Typography>
                  <Typography variant="body1">
                    {selectedTier.title}
                  </Typography>
                </Box>
              )}
              
              {selectedFestive && selectedFestive.id !== 'none' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Festive Package:
                  </Typography>
                  <Typography variant="body1">
                    {selectedFestive.title}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Second-hand Items:
                </Typography>
                <Typography variant="body1">
                  {includeSecondHand ? 'Included' : 'Not included'}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  Total Price:
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${calculateTotalPrice().toFixed(2)}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {selectedPlan?.id === 'monthly' 
                  ? 'Billed monthly' 
                  : 'Billed quarterly'}
              </Typography>
              
              {includeSecondHand && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  You're saving 10% by including second-hand items!
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderStylePreferences = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Your Style Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tell us what you like so we can personalize your fashion box
        </Typography>
        
        {(errors.colors || errors.styles || errors.topSize || errors.bottomSize || errors.shoeSize) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.colors && <div>{errors.colors}</div>}
            {errors.styles && <div>{errors.styles}</div>}
            {errors.topSize && <div>{errors.topSize}</div>}
            {errors.bottomSize && <div>{errors.bottomSize}</div>}
            {errors.shoeSize && <div>{errors.shoeSize}</div>}
          </Alert>
        )}
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Color Preferences
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select your favorite colors</FormLabel>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {availableColors.map((color) => (
                  <Grid item key={color}>
                    <Chip 
                      label={color}
                      clickable
                      color={preferences.colors.includes(color) ? 'primary' : 'default'}
                      onClick={() => toggleColorSelection(color)}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormControl>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Style Preferences
            </Typography>
            <FormControl component="fieldset">
              <FormLabel component="legend">Select your preferred styles</FormLabel>
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {availableStyles.map((style) => (
                  <Grid item key={style}>
                    <Chip 
                      label={style}
                      clickable
                      color={preferences.styles.includes(style) ? 'primary' : 'default'}
                      onClick={() => toggleStyleSelection(style)}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Size Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Top Size</InputLabel>
                  <Select
                    value={preferences.sizes.top || ''}
                    label="Top Size"
                    onChange={(e) => handleSizeChange('top', e.target.value)}
                    error={!!errors.topSize}
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Bottom Size</InputLabel>
                  <Select
                    value={preferences.sizes.bottom || ''}
                    label="Bottom Size"
                    onChange={(e) => handleSizeChange('bottom', e.target.value)}
                    error={!!errors.bottomSize}
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Shoe Size</InputLabel>
                  <Select
                    value={preferences.sizes.shoe || ''}
                    label="Shoe Size"
                    onChange={(e) => handleSizeChange('shoe', e.target.value)}
                    error={!!errors.shoeSize}
                  >
                    {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map((size) => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Additional Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Tell us more about your style preferences, specific things you like or dislike, etc."
              variant="outlined"
              value={preferences.notes || ''}
              onChange={handleNotesChange}
            />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Items You Don't Want
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={preferences.excludedItems.includes('sleeveless')}
                    onChange={() => toggleExcludedItem('sleeveless')}
                  />
                }
                label="No sleeveless tops"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={preferences.excludedItems.includes('skinny')}
                    onChange={() => toggleExcludedItem('skinny')}
                  />
                }
                label="No skinny jeans"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={preferences.excludedItems.includes('flashy')}
                    onChange={() => toggleExcludedItem('flashy')}
                  />
                }
                label="No flashy prints"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderReviewAndConfirm = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom align="center">
          Review Your Subscription
        </Typography>
        
        {submissionError && (
          <Alert severity="error" sx={{ mb: 3 }}>{submissionError}</Alert>
        )}
        
        {submissionSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your subscription has been created successfully! Your first box will be delivered soon.
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Subscription Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><EventIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Plan Type" 
                    secondary={selectedPlan?.title || 'Not selected'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Package" 
                    secondary={selectedPackage?.title || 'Not selected'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ShoppingBagIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Quality Tier" 
                    secondary={selectedTier?.title || 'Not selected'} 
                  />
                </ListItem>
                {selectedFestive && selectedFestive.id !== 'none' && (
                  <ListItem>
                    <ListItemIcon><CelebrationIcon /></ListItemIcon>
                    <ListItemText 
                      primary="Festive Package" 
                      secondary={selectedFestive?.title || 'None'} 
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon><AutorenewIcon /></ListItemIcon>
                  <ListItemText 
                    primary="Includes Second-hand Items" 
                    secondary={includeSecondHand ? 'Yes' : 'No'} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocalShippingIcon /></ListItemIcon>
                  <ListItemText 
                    primary="First Delivery" 
                    secondary="Estimated within 5-7 business days"
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Style Preferences
              </Typography>
              {preferences.colors.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Preferred Colors:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {preferences.colors.map((color) => (
                      <Chip key={color} label={color} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {preferences.styles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Preferred Styles:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {preferences.styles.map((style) => (
                      <Chip key={style} label={style} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {Object.keys(preferences.sizes).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Sizes:
                  </Typography>
                  <List dense>
                    {Object.entries(preferences.sizes).map(([key, value]) => (
                      value && (
                        <ListItem key={key} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`} 
                          />
                        </ListItem>
                      )
                    ))}
                  </List>
                </Box>
              )}
              
              {preferences.excludedItems.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Items you don't want:
                  </Typography>
                  <List dense>
                    {preferences.excludedItems.map((item) => (
                      <ListItem key={item} sx={{ py: 0 }}>
                        <ListItemText 
                          primary={
                            item === 'sleeveless' ? 'No sleeveless tops' :
                            item === 'skinny' ? 'No skinny jeans' :
                            item === 'flashy' ? 'No flashy prints' : item
                          } 
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {preferences.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Additional Notes:
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {preferences.notes}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="primary">
                Total: ${calculateTotalPrice().toFixed(2)} 
                {selectedPlan?.id === 'monthly' ? '/month' : '/quarter'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your first box will be shipped within 5-7 business days
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large" 
              color="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || submissionSuccess}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Processing...
                </>
              ) : submissionSuccess ? (
                <>
                  <CheckIcon sx={{ mr: 1 }} />
                  Subscribed
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </Box>
        </Paper>
        
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Subscription Terms:</strong> You can cancel or pause your subscription at any time. 
            Unwanted items can be returned for reward points that can be used to purchase items from 
            the second-hand marketplace or to reduce the cost of your subscription.
          </Typography>
        </Box>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPlanSelection();
      case 1:
        return renderPackageSelection();
      case 2:
        return renderStylePreferences();
      case 3:
        return renderReviewAndConfirm();
      default:
        return 'Unknown step';
    }
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0:
        return !selectedPlan;
      case 1:
        return !selectedPackage || !selectedTier;
      case 2:
        return preferences.colors.length === 0 || preferences.styles.length === 0 || 
               !preferences.sizes.top || !preferences.sizes.bottom || !preferences.sizes.shoe;
      case 3:
        return isSubmitting || submissionSuccess;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        align="center"
        sx={{ 
          fontWeight: 'medium',
          mb: 3
        }}
      >
        H&M Subscription Service
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        paragraph 
        align="center"
        sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
      >
        Create your personalized fashion subscription box
      </Typography>
      
      <Stepper 
        activeStep={activeStep} 
        sx={{ 
          mb: 4,
          '& .MuiStepLabel-root': {
            color: 'text.secondary'
          },
          '& .MuiStepIcon-root.Mui-active': {
            color: 'primary.main'
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: 'primary.main'
          }
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {getStepContent(activeStep)}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0 || isSubmitting}
          onClick={handleBack}
          sx={{ 
            color: 'text.primary',
            borderColor: 'text.primary',
            '&:hover': {
              borderColor: 'text.primary',
              bgcolor: 'rgba(0,0,0,0.04)'
            }
          }}
          variant="outlined"
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={isNextDisabled()}
          sx={{ 
            bgcolor: 'primary.main', 
            '&:hover': { 
              bgcolor: 'primary.dark' 
            },
            px: 4
          }}
        >
          {activeStep === steps.length - 1 ? 'Subscribe' : 'Next'}
        </Button>
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}