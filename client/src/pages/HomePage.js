import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Container,
  Paper,
  Divider,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import StoreIcon from '@mui/icons-material/Store';
import TuneIcon from '@mui/icons-material/Tune';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import RecyclingIcon from '@mui/icons-material/Recycling';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import heroBannerImage from '../assets/hero-banner.jpg';
import ARBannerImage from '../assets/AR-banner.jpg';
import AnalyticsBannerImage from '../assets/analytics.jpg'

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box>
      {/* Hero Section */}
      {/* Hero Section */}
      <Box 
        sx={{ 
          height: { xs: '70vh', md: '80vh' }, 
          backgroundImage: `url(${heroBannerImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        {/* Banner Section */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            width: '100%', 
            bgcolor: theme.palette.primary.main,
            color: 'white',
            py: 2,
            textAlign: 'center',
            zIndex: 2
          }}
        >
          <Container>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              New Season Alert: 20% Off Your First Subscription Box + Free AR Try-On Experience!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
              Use code DIGITAL20 at checkout. Limited time offer.
            </Typography>
          </Container>
        </Box>

        <Container sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ maxWidth: 600, color: 'white' }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 500,
                letterSpacing: -0.5,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Fashion Reinvented
            </Typography>
            <Typography variant="h5" paragraph>
              Discover a new way to experience H&M with our digital subscription service and personalized recommendations.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large" 
                component={Link}
                to="/subscription"
                sx={{ 
                  borderRadius: 0, 
                  px: 4, 
                  py: 1.5,
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Start Subscription
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                to="/discover"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  borderRadius: 0,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Explore Products
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      {/* Feature Introduction */}
      <Container sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          Digital Fashion Experience
        </Typography>
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary" 
          paragraph 
          sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
        >
          Experience the future of fashion shopping with innovative digital solutions that transform how you discover, try, and enjoy H&M products.
        </Typography>
        
        <Grid container spacing={4}>
          {/* Subscription Feature */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
              },
              border: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 60, height: 60 }}>
                  <CardGiftcardIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Fashion Subscription
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Monthly or quarterly curated boxes based on your style preferences. 
                  Choose from full outfits, tops only, or accessories packages.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 0,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }} 
                  component={Link} 
                  to="/subscription"
                  endIcon={<KeyboardArrowRightIcon />}
                >
                  Start Your Subscription
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Marketplace Feature */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
              },
              border: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 60, height: 60 }}>
                  <StoreIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Second-hand Marketplace
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Browse and purchase quality second-hand items, including returns 
                  from our subscription service at discounted prices.
                </Typography>
                <Button 
                  variant="outlined"
                  sx={{ 
                    mt: 2,
                    borderRadius: 0,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }} 
                  component={Link} 
                  to="/marketplace"
                  endIcon={<KeyboardArrowRightIcon />}
                >
                  Shop Marketplace
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Swipe Feature */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)',
              },
              border: 'none',
              boxShadow: 'rgba(0, 0, 0, 0.04) 0px 3px 5px'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Avatar sx={{ bgcolor: '#ff4d85', width: 60, height: 60 }}>
                  <TuneIcon sx={{ fontSize: 35 }} />
                </Avatar>
              </Box>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Product Discovery
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Swipe through products to like or skip. Your preferences help us 
                  personalize your subscription boxes and recommendations.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ 
                    mt: 2,
                    borderRadius: 0,
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.dark,
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }} 
                  component={Link} 
                  to="/discover"
                  endIcon={<KeyboardArrowRightIcon />}
                >
                  Start Discovering
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* AR Try-On Section */}
      <Box sx={{ bgcolor: '#f8f8f8', py: { xs: 6, md: 8 } }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Virtual Try-On Experience
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Try before you buy with our augmented reality technology. See how clothes 
                look on you without physically trying them on.
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Our AR feature works with items from both the main collection and the 
                second-hand marketplace, giving you confidence in every purchase.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<CameraAltIcon />}
                size="large"
                component={Link}
                to="/try-on"
                sx={{ 
                  mt: 2, 
                  borderRadius: 0, 
                  px: 4,
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark
                  }
                }}
              >
                Try AR Feature
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  overflow: 'hidden', 
                  borderRadius: 0,
                  position: 'relative'
                }}
              >
                <Box
                  component="img"
                  src={ARBannerImage}
                  alt="AR Try-On Demo"
                  sx={{ 
                    width: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                />
                <Chip 
                  icon={<AutoAwesomeIcon />} 
                  label="AR TECHNOLOGY" 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    bgcolor: theme.palette.digital.main,
                    color: 'white',
                    fontWeight: 500,
                    px: 1
                  }} 
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Analytics Section */}
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                overflow: 'hidden', 
                borderRadius: 0,
                position: 'relative'
              }}
            >
              <Box
                component="img"
                src={AnalyticsBannerImage}
                alt="Analytics Dashboard"
                sx={{ 
                  width: '100%',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.03)'
                  }
                }}
              />
              <Chip 
                icon={<BarChartIcon />} 
                label="AI POWERED" 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: 16,
                  bgcolor: theme.palette.digital.main,
                  color: 'white',
                  fontWeight: 500,
                  px: 1
                }} 
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Personalized Analytics
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Gain insights into your fashion preferences with our analytics dashboard. 
              See patterns in what you like, keep, and return.
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Our AI-powered recommendation engine uses this data to suggest items 
              you're likely to love, improving your subscription experience over time.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<BarChartIcon />}
              size="large"
              component={Link}
              to="/analytics"
              sx={{ 
                mt: 2, 
                borderRadius: 0, 
                px: 4,
                bgcolor: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: theme.palette.secondary.dark
                }
              }}
            >
              View Your Analytics
            </Button>
          </Grid>
        </Grid>
      </Container>
      
      {/* Sustainability Section */}
      <Box sx={{ bgcolor: '#e8f5e9', py: { xs: 6, md: 8 } }}>
        <Container>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <RecyclingIcon 
              color="primary" 
              sx={{ 
                fontSize: 60, 
                mb: 2,
                color: '#388e3c' // Green color for sustainability
              }} 
            />
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Sustainable Fashion
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: 800, 
                mx: 'auto',
                color: 'text.secondary'
              }}
            >
              Our digital approach to fashion reduces waste and promotes sustainability 
              by encouraging reuse through our second-hand marketplace.
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                border: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 15px'
                },
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                    Reward Points
                  </Typography>
                  <Typography variant="body2" paragraph color="text.secondary">
                    Return items you don't want in exchange for reward points that can be 
                    used to purchase from our second-hand marketplace or reduce your subscription cost.
                  </Typography>
                  <Chip 
                    label="Reduce Waste" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      color: '#2e7d32',
                      borderColor: '#2e7d32'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                border: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 15px'
                },
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                    Second Life
                  </Typography>
                  <Typography variant="body2" paragraph color="text.secondary">
                    Items returned from subscription boxes find new homes through our 
                    marketplace, extending their lifecycle and reducing environmental impact.
                  </Typography>
                  <Chip 
                    label="Circular Fashion" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      color: '#2e7d32',
                      borderColor: '#2e7d32'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                height: '100%',
                border: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 15px'
                },
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                    Carbon Footprint
                  </Typography>
                  <Typography variant="body2" paragraph color="text.secondary">
                    By optimizing deliveries and promoting reuse, we're working to reduce 
                    the carbon footprint associated with fashion consumption.
                  </Typography>
                  <Chip 
                    label="Eco-Friendly" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ 
                      color: '#2e7d32',
                      borderColor: '#2e7d32'
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action */}
      <Box sx={{ 
        bgcolor: theme.palette.primary.main, 
        color: 'white', 
        py: { xs: 6, md: 8 } 
      }}>
        <Container>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Ready to Transform Your Fashion Experience?
            </Typography>
            <Typography 
              variant="body1" 
              paragraph 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                opacity: 0.9
              }}
            >
              Join H&M Digital today and discover a new way to shop, try on, and enjoy fashion. 
              Start with our subscription service or explore our second-hand marketplace.
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/subscription"
                sx={{ 
                  mx: 1, 
                  mb: 2, 
                  bgcolor: 'white', 
                  color: theme.palette.primary.main,
                  borderRadius: 0,
                  px: 4,
                  '&:hover': {
                    bgcolor: '#f8f8f8'
                  }
                }}
              >
                Start Subscription
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                to="/discover"
                sx={{ 
                  mx: 1, 
                  mb: 2, 
                  color: 'white', 
                  borderColor: 'white',
                  borderRadius: 0,
                  px: 4,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Explore Products
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 4 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ fontWeight: 500 }}
              >
                H&M Digital
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Reimagining fashion for the digital age with personalized subscriptions, 
                second-hand marketplace, and innovative AR technology.
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Features
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={Link} to="/subscription" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Subscription</Button>
                    <Button component={Link} to="/marketplace" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Marketplace</Button>
                    <Button component={Link} to="/discover" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Discover</Button>
                    <Button component={Link} to="/try-on" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>AR Try-On</Button>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Company
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={Link} to="/about" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>About Us</Button>
                    <Button component={Link} to="/sustainability" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Sustainability</Button>
                    <Button component={Link} to="/careers" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Careers</Button>
                    <Button component={Link} to="/press" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Press</Button>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Help
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button component={Link} to="/faq" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>FAQ</Button>
                    <Button component={Link} to="/contact" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Contact Us</Button>
                    <Button component={Link} to="/terms" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Terms & Conditions</Button>
                    <Button component={Link} to="/privacy" color="inherit" sx={{ justifyContent: 'flex-start', px: 0 }}>Privacy Policy</Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} H&M Digital. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;