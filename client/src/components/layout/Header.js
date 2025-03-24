// client/src/components/layout/Header.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Added proper import for navigate

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Badge, 
  Container,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Import cart context

const Header = () => {
  // useNavigate must be called inside the component
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);
  const { cart, getCartSize } = useCart(); // Use cart context

  const mainNavItems = [
    { title: 'Home', path: '/' },
    { title: 'Subscription', path: '/subscription' },
    { title: 'Marketplace', path: '/marketplace' },
    { title: 'Discover', path: '/discover' },
    { title: 'Try On', path: '/try-on' },
    { title: 'Analytics', path: '/analytics' }
  ];

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton 
              color="inherit" 
              aria-label="open drawer" 
              edge="start" 
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Typography 
            variant="h5" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            H&M Evolve
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', mx: 4 }}>
              {mainNavItems.map((item) => (
                <Button 
                  key={item.title}
                  component={Link}
                  to={item.path}
                  sx={{ 
                    mx: 1.5, 
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'background.paper' }
                  }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>
          )}
          
          {/* User tools */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <>
                <Button 
                  variant="text" 
                  color="inherit" 
                  sx={{ mr: 1 }}
                  component={Link}
                  to="/search"
                >
                  Search
                </Button>
                
                {isAuthenticated ? (
                  <IconButton onClick={handleProfileClick}>
                    <PersonIcon />
                  </IconButton>
                ) : (
                  <Button 
                    variant="text" 
                    color="inherit"
                    component={Link}
                    to="/login"
                  >
                    Sign in
                  </Button>
                )}
              </>
            )}
            
            <IconButton aria-label="favorites" sx={{ ml: 1 }} onClick={() => navigate('/favorites')}>
              <Badge badgeContent={isAuthenticated ? 5 : 0} color="primary">
                <FavoriteIcon />
              </Badge>
            </IconButton>
            
            <IconButton aria-label="shopping bag" sx={{ ml: 1 }} onClick={handleCartClick}>
              <Badge badgeContent={getCartSize()} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
      
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <List>
          {mainNavItems.map((item) => (
            <ListItem 
              button 
              key={item.title} 
              component={Link} 
              to={item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={item.title} />
            </ListItem>
          ))}
          {isAuthenticated && (
            <ListItem 
              button 
              onClick={() => {
                setMobileOpen(false);
                navigate('/profile');
              }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Header;