// client/src/components/marketplace/ProductCard.js
// Create a reusable product card component

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { Link } from 'react-router-dom';

const ProductCard = ({ product, isFavorite, onFavoriteToggle, onAddToCart }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="300"
          image={product.images && product.images.length > 0 
            ? product.images.find(img => img.isMain)?.url || product.images[0].url 
            : '/api/placeholder/300/400'}
          alt={product.name}
        />
        
        {/* Favorite button */}
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            bgcolor: 'rgba(255,255,255,0.8)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
          }}
          onClick={() => onFavoriteToggle(product._id)}
        >
          {isFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
        </IconButton>
        
        {/* Digital feature badges */}
        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {product.modelUrl && (
            <Chip 
              label="AR Try-On" 
              size="small"
              icon={<CameraAltIcon fontSize="small" />}
              sx={{ 
                bgcolor: 'digital.main', 
                color: 'white',
                fontSize: '0.75rem'
              }} 
            />
          )}
          
          {product.isSecondHand && (
            <Chip 
              label="Second Hand" 
              size="small" 
              sx={{ 
                bgcolor: 'secondary.light', 
                color: 'white',
                fontSize: '0.75rem'
              }} 
            />
          )}
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.category}
        </Typography>
        
        <Typography variant="subtitle1" component="div" noWrap>
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            ${parseFloat(product.price).toFixed(2)}
          </Typography>
          
          {product.originalPrice && product.originalPrice > product.price && (
            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
              ${parseFloat(product.originalPrice).toFixed(2)}
            </Typography>
          )}
        </Box>
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0 }}>
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mb: 1 }}
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </Button>
        
        {product.modelUrl && (
          <Button 
            fullWidth 
            variant="outlined" 
            component={Link}
            to={`/try-on/${product._id}`}
            startIcon={<CameraAltIcon />}
          >
            Try On
          </Button>
        )}
      </Box>
    </Card>
  );
};

export default ProductCard;