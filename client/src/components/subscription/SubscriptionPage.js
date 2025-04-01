import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ExploreIcon from '@mui/icons-material/Explore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SwipeIcon from '@mui/icons-material/Swipe';
import EditIcon from '@mui/icons-material/Edit';
import { AuthContext } from '../../context/AuthContext';

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

// Willingness to explore options
const explorationOptions = [
  {
    id: "no",
    title: "Stick to my preferences",
    description: "I want items that match my style preferences closely",
    icon: <CheckIcon />,
    details: "We'll recommend items that closely align with your established preferences based on your swipe history and previous purchases."
  },
  {
    id: "moderate",
    title: "Some variety",
    description: "I'm open to some new styles while mostly sticking to my preferences",
    icon: <AutorenewIcon />,
    details: "We'll recommend a mix of items that match your preferences and some new styles that our stylists think you might like to try."
  },
  {
    id: "yes",
    title: "Surprise me",
    description: "I'm open to exploring new styles and trends",
    icon: <ExploreIcon />,
    details: "We'll recommend a diverse range of styles including trends and items outside your typical preferences to help you discover new looks."
  }
];

// Size options
const sizeOptions = {
  top: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  bottom: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoe: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedFestive, setSelectedFestive] = useState(festiveOptions[0]);
  const [includeSecondHand, setIncludeSecondHand] = useState(false);
  
  // Replace detailed preferences with willingness to explore
  const [explorationLevel, setExplorationLevel] = useState(null);
  
  // Basic sizing info is still needed
  const [sizes, setSizes] = useState({
    top: '',
    bottom: '',
    shoe: ''
  });

  // Onboarding state
  const [isNewUser, setIsNewUser] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingOption, setOnboardingOption] = useState(null);
  const [swipesNeeded, setSwipesNeeded] = useState(15); // Minimum swipes required

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

  const steps = ['Select Plan', 'Customize Package', 'Exploration Level', 'Review & Confirm'];

  // Check if user is authenticated and if they are new
  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated && user) {
        // Check if user has preference data
        // This is a simplified check - in a real app, you'd check for preference data in the backend
        const hasPreferenceData = user.swipedItems && user.swipedItems.length > 10;
        setIsNewUser(!hasPreferenceData);
        
        // If new user, show onboarding dialog
        if (!hasPreferenceData && !onboardingComplete) {
          setShowOnboarding(true);
        }
      } else {
        // Not authenticated
        setSnackbar({
          open: true,
          message: 'Please log in to create a subscription',
          severity: 'warning'
        });
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, onboardingComplete]);

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
    setExplorationLevel(null);
    setSizes({
      top: '',
      bottom: '',
      shoe: ''
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

  // State for showing the preference questionnaire
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [preferredColors, setPreferredColors] = useState([]);
  const [preferredStyles, setPreferredStyles] = useState([]);
  
  // Available colors and styles for questionnaire
  const availableColors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Brown', 'Grey'];
  const availableStyles = ['Casual', 'Formal', 'Sporty', 'Vintage', 'Minimalist', 'Street', 'Bohemian', 'Preppy'];

  // Handle onboarding option selection
  const handleOnboardingOption = (option) => {
    setOnboardingOption(option);
    
    if (option === 'form') {
      // Show the questionnaire instead of just closing the dialog
      setShowOnboarding(false);
      setShowQuestionnaire(true);
    } else if (option === 'swipe') {
      // Redirect to swipe feature with swipesNeeded parameter
      setShowOnboarding(false);
      navigate('/discover', { state: { fromOnboarding: true, swipesNeeded } });
    }
  };
  
  // Handle completion of the questionnaire
  const handleQuestionnaireComplete = () => {
    // In a real implementation, this would save the preferences to the user profile
    console.log('Saving preferences:', { preferredColors, preferredStyles, sizes });
    setShowQuestionnaire(false);
    setOnboardingComplete(true);
    
    setSnackbar({
      open: true,
      message: 'Your preferences have been saved!',
      severity: 'success'
    });
  };

  // Handle size change
  const handleSizeChange = (type, value) => {
    setSizes(prev => ({
      ...prev,
      [type]: value
    }));
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
        if (!explorationLevel) {
          newErrors.exploration = 'Please select how willing you are to explore';
        }
        if (!sizes.top) {
          newErrors.topSize = 'Please select your top size';
        }
        if (!sizes.bottom) {
          newErrors.bottomSize = 'Please select your bottom size';
        }
        if (!sizes.shoe) {
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
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Prepare subscription data - ensuring compatibility with backend
      const subscriptionData = {
        plan: selectedPlan.id,
        packageType: selectedPackage.id,
        tier: selectedTier.id,
        includeSecondHand: includeSecondHand,
        festivePackage: selectedFestive.id,
        preferences: {
          // Include both new exploration level and traditional preference data
          explorationLevel: explorationLevel.id,
          sizes: sizes,
          // Include color and style preferences if they were collected during onboarding
          colors: preferredColors.length > 0 ? preferredColors : undefined,
          styles: preferredStyles.length > 0 ? preferredStyles : undefined,
          notes: `Exploration Level: ${explorationLevel?.title || 'Not specified'}`
        }
      };

      console.log('Sending subscription data:', subscriptionData);

      // Make the API call
      const response = await fetch('http://localhost:5001/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }

      const data = await response.json();
      console.log('Subscription created:', data);

      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setSnackbar({
        open: true,
        message: 'Subscription created successfully! Your first box will arrive soon.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      setSubmissionError(error.message || "An error occurred. Please try again.");
      setSnackbar({
        open: true,
        message: error.message || "Failed to create subscription. Please try again.",
        severity: 'error'
      });
      setIsSubmitting(false);
    }
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

  const renderExplorationLevel = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Exploration Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Tell us how adventurous you want us to be with your style recommendations
        </Typography>

        {errors.exploration && (
          <Alert severity="error" sx={{ mb: 2 }}>{errors.exploration}</Alert>
        )}

        <Grid container spacing={3}>
          {explorationOptions.map((option) => (
            <Grid item xs={12} key={option.id}>
              <Card
                variant={explorationLevel === option ? "outlined" : "elevation"}
                sx={{
                  cursor: 'pointer',
                  border: explorationLevel === option ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => setExplorationLevel(option)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: explorationLevel === option ? 'primary.main' : 'grey.200',
                      color: explorationLevel === option ? 'white' : 'text.primary',
                      mr: 2
                    }}>
                      {option.icon}
                    </Box>
                    <Typography variant="h6">
                      {option.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mt: 1, ml: 7 }}>
                    {option.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 7 }}>
                    {option.details}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Your Size Information
          </Typography>
          
          {(errors.topSize || errors.bottomSize || errors.shoeSize) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.topSize && <div>{errors.topSize}</div>}
              {errors.bottomSize && <div>{errors.bottomSize}</div>}
              {errors.shoeSize && <div>{errors.shoeSize}</div>}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.topSize}>
                <InputLabel>Top Size</InputLabel>
                <Select
                  value={sizes.top}
                  label="Top Size"
                  onChange={(e) => handleSizeChange('top', e.target.value)}
                >
                  {sizeOptions.top.map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.bottomSize}>
                <InputLabel>Bottom Size</InputLabel>
                <Select
                  value={sizes.bottom}
                  label="Bottom Size"
                  onChange={(e) => handleSizeChange('bottom', e.target.value)}
                >
                  {sizeOptions.bottom.map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.shoeSize}>
                <InputLabel>Shoe Size</InputLabel>
                <Select
                  value={sizes.shoe}
                  label="Shoe Size"
                  onChange={(e) => handleSizeChange('shoe', e.target.value)}
                >
                  {sizeOptions.shoe.map(size => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
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
                Your Preferences
              </Typography>
              <ListItem>
                <ListItemIcon><ExploreIcon /></ListItemIcon>
                <ListItemText
                  primary="Exploration Level"
                  secondary={explorationLevel?.title || 'Not selected'}
                />
              </ListItem>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Your Sizes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {sizes.top && <Chip label={`Top: ${sizes.top}`} size="small" />}
                {sizes.bottom && <Chip label={`Bottom: ${sizes.bottom}`} size="small" />}
                {sizes.shoe && <Chip label={`Shoe: ${sizes.shoe}`} size="small" />}
              </Box>
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
        return renderExplorationLevel();
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
        return !explorationLevel || !sizes.top || !sizes.bottom || !sizes.shoe;
      case 3:
        return isSubmitting || submissionSuccess;
      default:
        return false;
    }
  };

  // Replace the entire return statement in SubscriptionPage.js with this fixed version
return (
  <Box sx={{ p: { xs: 2, md: 3 } }}>
    {/* Style Preference Questionnaire Dialog */}
    {showQuestionnaire && (
      <Paper elevation={3} sx={{ p: 3, mb: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Tell Us About Your Style Preferences
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This information will help us personalize your subscription recommendations.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Which colors do you prefer? (Select up to 5)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableColors.map((color) => (
                <Chip
                  key={color}
                  label={color}
                  onClick={() => {
                    if (preferredColors.includes(color)) {
                      setPreferredColors(preferredColors.filter(c => c !== color));
                    } else if (preferredColors.length < 5) {
                      setPreferredColors([...preferredColors, color]);
                    }
                  }}
                  color={preferredColors.includes(color) ? "primary" : "default"}
                  variant={preferredColors.includes(color) ? "filled" : "outlined"}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Which styles do you prefer? (Select up to 3)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableStyles.map((style) => (
                <Chip
                  key={style}
                  label={style}
                  onClick={() => {
                    if (preferredStyles.includes(style)) {
                      setPreferredStyles(preferredStyles.filter(s => s !== style));
                    } else if (preferredStyles.length < 3) {
                      setPreferredStyles([...preferredStyles, style]);
                    }
                  }}
                  color={preferredStyles.includes(style) ? "primary" : "default"}
                  variant={preferredStyles.includes(style) ? "filled" : "outlined"}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Your Size Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Top Size</InputLabel>
                  <Select
                    value={sizes.top}
                    label="Top Size"
                    onChange={(e) => handleSizeChange('top', e.target.value)}
                  >
                    {sizeOptions.top.map(size => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Bottom Size</InputLabel>
                  <Select
                    value={sizes.bottom}
                    label="Bottom Size"
                    onChange={(e) => handleSizeChange('bottom', e.target.value)}
                  >
                    {sizeOptions.bottom.map(size => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Shoe Size</InputLabel>
                  <Select
                    value={sizes.shoe}
                    label="Shoe Size"
                    onChange={(e) => handleSizeChange('shoe', e.target.value)}
                  >
                    {sizeOptions.shoe.map(size => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button 
            variant="contained"
            onClick={handleQuestionnaireComplete}
            disabled={preferredColors.length === 0 || preferredStyles.length === 0 || !sizes.top || !sizes.bottom || !sizes.shoe}
          >
            Save Preferences
          </Button>
        </Box>
      </Paper>
    )}
    
    {!showQuestionnaire && (
      <>
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
      </>
    )}

    {/* New User Onboarding Dialog */}
    <Dialog
      open={showOnboarding}
      onClose={() => setShowOnboarding(false)}
      aria-labelledby="onboarding-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="onboarding-dialog-title">
        Welcome to H&M Subscription Service!
      </DialogTitle>
      <DialogContent>
        <DialogContentText paragraph>
          To offer you the best personalized fashion recommendations, we need to understand your style preferences.
          You can choose one of the following options:
        </DialogContentText>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                border: onboardingOption === 'form' ? '2px solid #1976d2' : '1px solid #e0e0e0',
              }}
              onClick={() => setOnboardingOption('form')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <EditIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Fill in Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete a simple questionnaire about your style preferences
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                },
                border: onboardingOption === 'swipe' ? '2px solid #1976d2' : '1px solid #e0e0e0',
              }}
              onClick={() => setOnboardingOption('swipe')}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <SwipeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Use Swipe Feature
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Swipe through {swipesNeeded} items to help us learn your style
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button 
          startIcon={<HelpOutlineIcon />}
          onClick={() => setShowOnboarding(false)}
        >
          Skip for Now
        </Button>
        <Button 
          variant="contained" 
          onClick={() => handleOnboardingOption(onboardingOption)}
          disabled={!onboardingOption}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>

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