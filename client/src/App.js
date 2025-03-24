import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
  useMediaQuery,
  ThemeProvider,
  createTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import StoreIcon from '@mui/icons-material/Store';
import TuneIcon from '@mui/icons-material/Tune';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';

// Import components
import HomePage from './pages/HomePage';
import SubscriptionPage from './components/subscription/SubscriptionPage';
import MarketplacePage from './components/marketplace/MarketplacePage';
import SwipeFeature from './components/swipe/SwipeFeature';
import ARTryOn from './components/ar-tryout/ARTryOn';
import AnalyticsTool from './components/analytics/AnalyticsTool';
import ProductManagement from './components/admin/ProductManagement';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ProfilePage from './components/auth/ProfilePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CheckoutPage from './components/checkout/CheckoutPage';

// Import contexts
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// Create H&M-inspired theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#E50010', // H&M Red
      dark: '#C5000D',
      light: '#FF4D4D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#222222', // Rich Black
      dark: '#000000',
      light: '#444444',
      contrastText: '#FFFFFF',
    },
    digital: {
      main: '#00A0B0', // Digital accent color for new features
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F4F4F4',
    },
    text: {
      primary: '#222222',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Inter", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 500,
      fontSize: '2.25rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // H&M uses square buttons
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
  },
});

// Create a Header component
const Header = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { getCartSize } = useCart();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Subscription', icon: <CardGiftcardIcon />, path: '/subscription', protected: true },
    { text: 'Marketplace', icon: <StoreIcon />, path: '/marketplace' },
    { text: 'Discover', icon: <TuneIcon />, path: '/discover' },
    { text: 'Try On (AR)', icon: <CameraAltIcon />, path: '/try-on' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', protected: true },
  ];

  return (
    <AppBar position="sticky" color="default" sx={{ bgcolor: 'white' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Typography 
            variant="h5" 
            component="a" 
            href="/" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              textDecoration: 'none', 
              flexGrow: { xs: 1, md: 0 } 
            }}
          >
            H&M Evolve
          </Typography>
          
          {/* Main navigation - desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, mx: 'auto' }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text} 
                href={item.path} 
                sx={{ 
                  mx: 1.5, 
                  color: 'text.primary',
                  fontWeight: 'normal',
                  fontSize: '0.95rem'
                }}
                disabled={item.protected && !isAuthenticated()}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton aria-label="search" sx={{ color: 'text.primary' }}>
              <SearchIcon />
            </IconButton>
            
            <IconButton aria-label="favorites" sx={{ color: 'text.primary' }}>
              <Badge badgeContent={isAuthenticated() ? 5 : 0} color="primary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
            
            <IconButton 
              aria-label="shopping cart" 
              sx={{ color: 'text.primary', mr: { xs: 0, md: 1 } }}
              component="a"
              href="/checkout"
            >
              <Badge badgeContent={getCartSize()} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            
            {/* User profile - desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {isAuthenticated() ? (
                <>
                  <IconButton
                    edge="end"
                    onClick={handleProfileMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: user?.profileImage ? 'transparent' : 'primary.main'
                      }}
                      src={user?.profileImage}
                    >
                      {user?.firstName ? user.firstName.charAt(0) : <PersonIcon />}
                    </Avatar>
                  </IconButton>
                  
                  <IconButton
                    color="inherit"
                    onClick={handleNotificationsMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <Badge badgeContent={7} color="primary">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </>
              ) : (
                <Button 
                  color="inherit" 
                  href="/login"
                  sx={{ ml: 1 }}
                >
                  Sign in
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Main content component
function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { getCartSize } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Subscription', icon: <CardGiftcardIcon />, path: '/subscription' },
    { text: 'Marketplace', icon: <StoreIcon />, path: '/marketplace' },
    { text: 'Discover', icon: <TuneIcon />, path: '/discover' },
    { text: 'Try On (AR)', icon: <CameraAltIcon />, path: '/try-on' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          H&M Digital
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component="a" href={item.path}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {item.protected && !isAuthenticated() && (
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  <LockIcon fontSize="small" color="disabled" />
                </ListItemIcon>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {isAuthenticated() ? (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Your Reward Points
          </Typography>
          <Typography variant="h5" color="primary" gutterBottom>
            {user?.rewardPoints?.toLocaleString() || '0'}
          </Typography>
          <Button variant="outlined" size="small" fullWidth component="a" href="/rewards">
            View History
          </Button>
        </Box>
      ) : (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button variant="contained" fullWidth component="a" href="/login">
            Sign In
          </Button>
          <Button variant="outlined" fullWidth component="a" href="/register">
            Create Account
          </Button>
        </Box>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Custom AppBar replaced with Header component */}
      <Header />
      
      {/* Sidebar Drawer - Mobile only */}
      <Box
        component="nav"
        sx={{ width: { sm: 0 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, width: '100%' }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/subscription" 
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/discover" element={<SwipeFeature />} />
          <Route path="/try-on" element={<ARTryOn />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsTool />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute>
                <ProductManagement />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component="a" href="/profile">
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={Boolean(notificationsAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="subtitle2">New items in your size!</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="subtitle2">Your subscription box is on the way</Typography>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="subtitle2">Earn 2x reward points this weekend</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <Typography variant="body2" color="primary">See all notifications</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Import missing icons
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

// Main App with Auth Provider and Theme Provider
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;