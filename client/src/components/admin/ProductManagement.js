
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardMedia,
  FormControlLabel,
  Switch,
  OutlinedInput,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const categories = [
  'Shirts', 'Pants', 'Dresses', 'Accessories', 'Shoes', 
  'Jackets', 'Coats', 'Sweaters', 'Bags', 'Other'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'One Size'];
const conditions = ['New', 'Like New', 'Excellent', 'Very Good', 'Good', 'Fair'];
const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Brown', 'Grey', 'Beige', 'Navy', 'Gold', 'Silver'];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [searchQuery, setSearchQuery] = useState('');
  const [batchUploadOpen, setBatchUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [modelUploadOpen, setModelUploadOpen] = useState(false);
  const [currentModelProduct, setCurrentModelProduct] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Number of products per page
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    colors: [],
    sizes: [],
    tags: [],
    isSecondHand: false,
    fromSubscription: false,
    condition: 'New',
    returnable: true,
    rewardPoints: 0,
    images: []
  });


  // API Base URL - this allows us to easily change it if needed
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    fetchProducts();
  }, [page, limit]); // Add these dependencies

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products...');
      const response = await fetch(`${API_BASE_URL}/api/products?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products data:', data);
      
      // Handle both array and object response formats
      const productList = Array.isArray(data) ? data : (data.products || []);
      
      // Update total pages if available in response
      if (data.totalPages) {
        setTotalPages(data.totalPages);
      } else {
        // Estimate total pages if not provided
        const totalCount = data.total || productList.length;
        setTotalPages(Math.ceil(totalCount / limit));
      }
      
      setProducts(productList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message);
      setSnackbar({
        open: true,
        message: `Error fetching products: ${error.message}`,
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing limit
  };


// Add this function to handle page changes
const handlePageChange = (event, newPage) => {
  setPage(newPage);
};



  const handleOpenForm = (mode, product = null) => {
    setFormMode(mode);
    if (mode === 'edit' && product) {
      setCurrentProduct(product);
      // Format product data for form
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        colors: product.colors || [],
        sizes: product.sizes ? product.sizes.map(s => typeof s === 'object' ? s.size : s) : [],
        tags: product.tags || [],
        isSecondHand: product.isSecondHand || false,
        fromSubscription: product.fromSubscription || false,
        condition: product.condition || 'New',
        returnable: product.returnable !== false, // default to true
        rewardPoints: product.rewardPoints || 0,
        images: product.images || []
      });
    } else {
      // Reset form for adding new product
      setCurrentProduct(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        originalPrice: '',
        colors: [],
        tags: [],
        sizes: [],
        isSecondHand: false,
        fromSubscription: false,
        condition: 'New',
        returnable: true,
        rewardPoints: 0,
        images: []
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddImage = () => {
    document.getElementById('imageUploadInput').click();
  };

  // Improved image upload with compression
  const handleRealImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size before processing
    if (file.size > 10 * 1024 * 1024) { // 5MB
      setSnackbar({
        open: true,
        message: 'Image is too large. Please select an image under 10MB.',
        severity: 'error'
      });
      e.target.value = null;
      return;
    }
    
    // Use FileReader to get a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      // Create image for resizing
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if larger than maximum dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > MAX_WIDTH) {
          height = Math.floor(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = Math.floor(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed data URL (adjust quality as needed)
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        const newImages = [...formData.images];
        newImages.push({
          url: compressedUrl,
          alt: formData.name || 'Product image',
          isMain: newImages.length === 0 // First image is main by default
        });
        
        setFormData({
          ...formData,
          images: newImages
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again
    e.target.value = null;
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    // If we removed the main image, set a new one
    if (newImages.length > 0 && !newImages.some(img => img.isMain)) {
      newImages[0].isMain = true;
    }
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSetMainImage = (index) => {
    const newImages = [...formData.images].map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.description || !formData.category || 
        !formData.price || !formData.originalPrice) {
      setSnackbar({
        open: true,
        message: 'Please fill out all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Format sizes with quantity
    const formattedSizes = formData.sizes.map(size => {
      // Check if size is already an object
      if (typeof size === 'object' && size.size) {
        return size;
      }
      // Otherwise create a size object
      return {
        size,
        quantity: 10 // Default quantity
      };
    });
    
    // Create product object
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice),
      rewardPoints: parseInt(formData.rewardPoints || 0),
      sizes: formattedSizes
    };
    
    setUploading(true);
    
    try {
      let response;
      
      if (formMode === 'add') {
        // API call to create product
        console.log('Adding product:', productData);
        
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const newProduct = await response.json();
        console.log('New product created:', newProduct);
        
        // Update products list
        setProducts([...products, newProduct]);
        
        setSnackbar({
          open: true,
          message: 'Product added successfully',
          severity: 'success'
        });
        
        handleCloseForm();
      } else {
        // API call to update product
        console.log('Updating product:', productData);
        
        response = await fetch(`${API_BASE_URL}/api/products/${currentProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
        }
        
        const updatedProduct = await response.json();
        console.log('Product updated:', updatedProduct);
        
        // Update products list
        const updatedProducts = products.map(p => 
          p._id === currentProduct._id ? updatedProduct : p
        );
        
        setProducts(updatedProducts);
        
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success'
        });
        
        handleCloseForm();
      }
      
      // Refresh products list
      fetchProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: `Error saving product: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Update products list
        const updatedProducts = products.filter(p => p._id !== productId);
        setProducts(updatedProducts);
        
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        setSnackbar({
          open: true,
          message: `Error deleting product: ${error.message}`,
          severity: 'error'
        });
      }
    }
  };

  const handleBatchUploadOpen = () => {
    setBatchUploadOpen(true);
  };

  const handleBatchUploadClose = () => {
    setBatchUploadOpen(false);
    setUploadFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleBatchUpload = async () => {
    if (!uploadFile) {
      setSnackbar({
        open: true,
        message: 'Please select a file to upload',
        severity: 'error'
      });
      return;
    }
    
    setUploading(true);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', uploadFile);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // In a real app, this would be an API call
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Simulate success
        setTimeout(() => {
          setUploading(false);
          setSnackbar({
            open: true,
            message: 'Products imported successfully',
            severity: 'success'
          });
          
          // Fetch updated product list
          fetchProducts();
          
          handleBatchUploadClose();
        }, 500);
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
      setSnackbar({
        open: true,
        message: `Error uploading file: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const openModelUpload = (product) => {
    setCurrentModelProduct(product);
    setModelUploadOpen(true);
  };

  const handleModelFileChange = (e) => {
    setModelFile(e.target.files[0]);
  };

  const handleModelUpload = async () => {
    if (!modelFile) {
      setSnackbar({
        open: true,
        message: 'Please select a 3D model file to upload',
        severity: 'error'
      });
      return;
    }
    
    setUploading(true);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // In a real app, this would upload the file to a server
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Update product with simulated model URL
        setTimeout(() => {
          const updatedProducts = products.map(p => 
            p._id === currentModelProduct._id 
              ? { ...p, modelUrl: `/models/${modelFile.name}` } 
              : p
          );
          
          setProducts(updatedProducts);
          
          setUploading(false);
          setSnackbar({
            open: true,
            message: '3D model uploaded successfully',
            severity: 'success'
          });
          
          handleModelUploadClose();
        }, 500);
      }, 2000);
    } catch (error) {
      console.error('Error uploading model:', error);
      setUploading(false);
      setSnackbar({
        open: true,
        message: `Error uploading model: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleModelUploadClose = () => {
    setModelUploadOpen(false);
    setCurrentModelProduct(null);
    setModelFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Product Management
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpenForm('add')}
          >
            Add Product
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<CloudUploadIcon />}
            onClick={handleBatchUploadOpen}
          >
            Batch Import
          </Button>
        </Box>
        <TextField
          placeholder="Search products..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="products table">
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Sizes</TableCell>
                <TableCell>Second-hand</TableCell>
                <TableCell>3D Model</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.images && product.images.length > 0 
                          ? product.images.find(img => img.isMain)?.url || product.images[0].url 
                          : '/api/placeholder/40/40'}
                        alt={product.name}
                        sx={{ width: 40, height: 40, objectFit: 'cover' }}
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {product.sizes && product.sizes.length > 0 
                        ? product.sizes.map(s => typeof s === 'object' ? s.size : s).join(', ')
                        : 'No sizes'}
                    </TableCell>
                    <TableCell>
                      {product.isSecondHand ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>
                      {product.modelUrl ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <Button size="small" onClick={() => openModelUpload(product)}>
                          Upload
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenForm('edit', product)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(product._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
      Rows per page:
    </Typography>
    <Select
      value={limit}
      onChange={handleLimitChange}
      size="small"
      sx={{ minWidth: 80 }}
    >
      <MenuItem value={5}>5</MenuItem>
      <MenuItem value={10}>10</MenuItem>
      <MenuItem value={25}>25</MenuItem>
      <MenuItem value={50}>50</MenuItem>
    </Select>
  </Box>
  
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Button 
      disabled={page === 1}
      onClick={() => handlePageChange(null, page - 1)}
      variant="outlined"
      size="small"
      sx={{ minWidth: 'unset', mr: 1 }}
    >
      Previous
    </Button>
    <Typography variant="body2" sx={{ mx: 2 }}>
      Page {page} of {totalPages}
    </Typography>
    <Button 
      disabled={page === totalPages}
      onClick={() => handlePageChange(null, page + 1)}
      variant="outlined"
      size="small"
      sx={{ minWidth: 'unset', ml: 1 }}
    >
      Next
    </Button>
  </Box>
</Box>
      {/* Product Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {formMode === 'add' ? 'Add New Product' : 'Edit Product'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Product Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  name="price"
                  label="Price"
                  type="number"
                  fullWidth
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
                
                <TextField
                  name="originalPrice"
                  label="Original Price"
                  type="number"
                  fullWidth
                  required
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Box>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Colors</InputLabel>
                <Select
                  name="colors"
                  multiple
                  value={formData.colors}
                  onChange={(e) => handleSelectChange(e)}
                  input={<OutlinedInput label="Colors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {colors.map((color) => (
                    <MenuItem key={color} value={color}>
                      {color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Sizes</InputLabel>
                <Select
                  name="sizes"
                  multiple
                  value={formData.sizes}
                  onChange={(e) => handleSelectChange(e)}
                  input={<OutlinedInput label="Sizes" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                name="rewardPoints"
                label="Reward Points"
                type="number"
                fullWidth
                value={formData.rewardPoints}
                onChange={handleInputChange}
                margin="normal"
              />
              
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isSecondHand}
                      onChange={handleCheckboxChange}
                      name="isSecondHand"
                    />
                  }
                  label="Second-hand Item"
                />
                
                {formData.isSecondHand && (
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      label="Condition"
                    >
                      {conditions.map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.fromSubscription}
                      onChange={handleCheckboxChange}
                      name="fromSubscription"
                    />
                  }
                  label="From Subscription Return"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.returnable}
                      onChange={handleCheckboxChange}
                      name="returnable"
                    />
                  }
                  label="Returnable"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={4}
                required
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Tags</InputLabel>
                <Select
                  name="tags"
                  multiple
                  value={formData.tags}
                  onChange={(e) => handleSelectChange(e)}
                  input={<OutlinedInput label="Tags" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {['Casual', 'Formal', 'Summer', 'Winter', 'Spring', 'Fall', 'Sustainable', 'Limited Edition', 'Sale', 'Denim', 'Cotton', 'Silk', 'Wool', 'Linen', 'Organic', 'Vintage', 'Trending'].map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Images will be automatically resized. Maximum 10MB per image.
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {formData.images.map((image, index) => (
                    <Card key={index} sx={{ width: 100, position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="100"
                        image={image.url}
                        alt={image.alt || formData.name}
                      />
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        bgcolor: 'rgba(255,255,255,0.7)',
                        p: 0.5,
                        borderRadius: '0 0 0 4px'
                      }}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      {image.isMain && (
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          p: 0.5,
                          textAlign: 'center',
                          fontSize: '0.75rem'
                        }}>
                          Main
                        </Box>
                      )}
                      {!image.isMain && (
                        <Box sx={{ 
                          position: 'absolute', 
                          bottom: 0, 
                          left: 0, 
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          p: 0.5,
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSetMainImage(index)}
                        >
                          Set as Main
                        </Box>
                      )}
                    </Card>
                  ))}
                  
                  <Box
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      border: '1px dashed grey',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={handleAddImage}
                  >
                    <AddIcon />
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  Click on "Set as Main" to set the main product image.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {formMode === 'add' ? 'Adding...' : 'Saving...'}
              </Box>
            ) : (
              formMode === 'add' ? 'Add Product' : 'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Batch Upload Dialog */}
      <Dialog
        open={batchUploadOpen}
        onClose={handleBatchUploadClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Products</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Upload a CSV or Excel file with product data to import multiple products at once.
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: 100, border: '1px dashed grey' }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography>
                  {uploadFile ? uploadFile.name : 'Click to select file'}
                </Typography>
              </Box>
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
              />
            </Button>
          </Box>
          
          {uploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(uploadProgress)}%`}</Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
            Template format:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            name, description, category, price, originalPrice, colors (comma-separated), sizes (comma-separated), tags (comma-separated), isSecondHand (true/false), condition
          </Typography>
          
          <Button 
            variant="text" 
            color="primary" 
            sx={{ mt: 1 }}
            onClick={() => {
              // In a real app, this would download a template file
              alert('In a real app, this would download a template file');
            }}
          >
            Download Template
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBatchUploadClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleBatchUpload}
            disabled={!uploadFile || uploading}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* 3D Model Upload Dialog */}
      <Dialog
        open={modelUploadOpen}
        onClose={handleModelUploadClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload 3D Model</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Upload a 3D model file (.glb or .gltf) for {currentModelProduct?.name}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ height: 100, border: '1px dashed grey' }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box component="svg" viewBox="0 0 24 24" sx={{ fontSize: 40, mb: 1 }}>
                  <path
                    fill="currentColor"
                    d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"
                  />
                </Box>
                <Typography>
                  {modelFile ? modelFile.name : 'Click to select 3D model file'}
                </Typography>
              </Box>
              <input
                type="file"
                hidden
                onChange={handleModelFileChange}
                accept=".glb,.gltf"
              />
            </Button>
          </Box>
          
          {uploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(uploadProgress)}%`}</Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Supported formats: .GLB, .GLTF
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Max file size: 50MB
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModelUploadClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleModelUpload}
            disabled={!modelFile || uploading}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hidden file input for image upload */}
      <input
        type="file"
        id="imageUploadInput"
        hidden
        accept="image/*"
        onChange={handleRealImageUpload}
      />
      
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductManagement;