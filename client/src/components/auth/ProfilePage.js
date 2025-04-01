import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  TablePagination,
  Chip,
  Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HistoryIcon from '@mui/icons-material/History';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { AuthContext } from '../../context/AuthContext';

// Profile tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Order row component with expandable details
function OrderRow({ order, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {order._id}
        </TableCell>
        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
        <TableCell>
          ${parseFloat(order.total).toFixed(2)}
        </TableCell>
        <TableCell>
          <Chip
            label={order.status}
            color={
              order.status === 'Confirmed' || order.status === 'Delivered' ? 'success' :
                order.status === 'Shipped' ? 'info' :
                  order.status === 'Processing' ? 'warning' : 'default'
            }
            size="small"
          />
        </TableCell>
        <TableCell>
          {order.items.length} items
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, py: 2 }}>
              <Typography variant="h6" gutterBottom component="div">
                Order Details
              </Typography>
              <Table size="small" aria-label="order items">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            alt={item.name}
                            src={item.image}
                            variant="square"
                            sx={{ width: 40, height: 40, mr: 1 }}
                          />
                          <Box>
                            <Typography variant="body2">{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{item.size || 'Standard'}</TableCell>
                      <TableCell align="right">${parseFloat(item.price).toFixed(2)}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell colSpan={3} />
                    <TableCell>Subtotal</TableCell>
                    <TableCell align="right">
                      ${parseFloat(order.subtotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell colSpan={3} />
                    <TableCell>Shipping</TableCell>
                    <TableCell align="right">
                      ${parseFloat(order.shippingCost || 4.99).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#f5f5f5', '& > td': { fontWeight: 'bold' } }}>
                    <TableCell colSpan={3} />
                    <TableCell>Total</TableCell>
                    <TableCell align="right">
                      ${parseFloat(order.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Payment method and points used/earned */}
              <Box sx={{ mt: 2, bgcolor: '#f8f8f8', p: 2, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Payment Method:</Typography>
                    <Typography variant="body2">
                      {order.useRewardPoints
                        ? 'Reward Points'
                        : 'Credit Card'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {order.useRewardPoints ? (
                      <>
                        <Typography variant="subtitle2">Reward Points Used:</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="medium">
                          {(order.rewardPointsUsed || 0).toLocaleString()} points
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle2">Reward Points Earned:</Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="medium">
                          {(order.rewardPointsEarned || 0).toLocaleString()} points
                        </Typography>
                      </>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Add shipping address if available */}
              {order.shippingInfo && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Shipping Address:</Typography>
                  <Typography variant="body2">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingInfo.address}
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                  </Typography>
                  <Typography variant="body2">
                    {order.shippingInfo.country}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const ProfilePage = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleUpdateSubscriptionStatus = async (subscriptionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(`http://localhost:5001/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating subscription: ${response.status}`);
      }
      
      // Update the subscription in the state
      setSubscriptions(prev => prev.map(sub => 
        sub._id === subscriptionId ? { ...sub, status: newStatus } : sub
      ));
      
      setSnackbar({
        open: true,
        message: `Subscription ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      setSnackbar({
        open: true,
        message: `Failed to update subscription: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: ''
  });

  // Load user data into form when available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  // Fetch subscription data from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (activeTab === 1) {
        setLoadingSubscriptions(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          console.log('Fetching user subscriptions...');

          const response = await fetch('http://localhost:5001/api/subscriptions/user', {
            headers: {
              'x-auth-token': token
            }
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            if (response.status === 404) {
              // No active subscription found, which is normal
              console.log('No active subscriptions found');
              setSubscriptions([]);
              return;
            }
            throw new Error(`Error fetching subscriptions: ${response.status}`);
          }

          const data = await response.json();
          console.log('Subscription data:', data);

          // If data is an array, use it directly, otherwise wrap it in an array
          const subscriptionData = Array.isArray(data) ? data : [data];
          setSubscriptions(subscriptionData);
        } catch (error) {
          console.error('Error fetching subscriptions:', error);
          setError(`Failed to load subscription data: ${error.message}`);

          // Set empty array if error occurs
          setSubscriptions([]);
        } finally {
          setLoadingSubscriptions(false);
        }
      }
    };

    fetchSubscriptions();
  }, [activeTab]);

  // Fetch order history from API

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (activeTab === 2) {
        setLoadingOrders(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          // Get purchases from the marketplace API
          const response = await fetch('http://localhost:5001/api/marketplace/purchases', {
            headers: {
              'x-auth-token': token
            }
          });

          if (!response.ok) {
            throw new Error(`Error fetching order history: ${response.status}`);
          }

          // The backend now returns already grouped orders by orderId
          const orders = await response.json();
          console.log('Order history data:', orders);

          setOrders(orders);
        } catch (error) {
          console.error('Error with order history:', error);
          setError(`Failed to load order history: ${error.message}`);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrderHistory();
  }, [activeTab]);


  // Fetch delivery data from subscriptions
  useEffect(() => {
    const fetchDeliveries = async () => {
      if (activeTab === 3) {
        setLoadingDeliveries(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          // Get all active subscriptions first
          const subsResponse = await fetch('http://localhost:5001/api/subscriptions/user', {
            headers: {
              'x-auth-token': token
            }
          });

          if (!subsResponse.ok) {
            if (subsResponse.status === 404) {
              // No active subscription found, which is normal
              setDeliveries([]);
              return;
            }
            throw new Error(`Error fetching subscriptions: ${subsResponse.status}`);
          }

          const subsData = await subsResponse.json();
          const subscriptionData = Array.isArray(subsData) ? subsData : [subsData];

          // Extract delivery history from each subscription
          let allDeliveries = [];

          for (const subscription of subscriptionData) {
            if (subscription._id && subscription.deliveryHistory && subscription.deliveryHistory.length > 0) {
              // Fetch detailed delivery history for this subscription
              const historyResponse = await fetch(`http://localhost:5001/api/subscriptions/${subscription._id}/history`, {
                headers: {
                  'x-auth-token': token
                }
              });

              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                allDeliveries = [...allDeliveries, ...historyData];
              }
            }
          }

          // Sort deliveries by date, newest first
          allDeliveries.sort((a, b) => new Date(b.date) - new Date(a.date));

          setDeliveries(allDeliveries);
        } catch (error) {
          console.error('Error fetching deliveries:', error);
          setError(`Failed to load delivery data: ${error.message}`);
          setDeliveries([]);
        } finally {
          setLoadingDeliveries(false);
        }
      }
    };

    fetchDeliveries();
  }, [activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (editing) {
      // If canceling edit, reset form to user data
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }
    setEditing(!editing);
    // Clear any previous status messages
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call updateProfile from AuthContext
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        profileImage: formData.profileImage
      });

      setSuccess(true);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left side - Profile info */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user.profileImage}
                alt={user.firstName}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {!user.profileImage && user.firstName ? user.firstName.charAt(0) : <PersonIcon />}
              </Avatar>

              <Typography variant="h5">
                {user.firstName} {user.lastName}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.email}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Chip
                  label={`${user.rewardPoints?.toLocaleString() || '0'} Reward Points`}
                  color="primary"
                  sx={{ fontSize: '1rem', py: 2 }}
                />
              </Box>

              <Divider sx={{ width: '100%', mb: 2 }} />

              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Account Details
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body2">
                    {new Date(user.createdAt || new Date()).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subscription Status
                  </Typography>
                  <Chip
                    label={user.isSubscribed ? 'Active' : 'Inactive'}
                    color={user.isSubscribed ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Orders Placed
                  </Typography>
                  <Typography variant="body2">
                    {orders.length}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right side - Tabs and content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                label="Profile"
                icon={<PersonIcon />}
                iconPosition="start"
              />
              <Tab
                label="Subscriptions"
                icon={<CardGiftcardIcon />}
                iconPosition="start"
              />
              <Tab
                label="Order History"
                icon={<HistoryIcon />}
                iconPosition="start"
              />
              <Tab
                label="Deliveries"
                icon={<LocalShippingIcon />}
                iconPosition="start"
              />
            </Tabs>

            {/* Profile Info Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ p: 2 }}>
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Profile updated successfully!
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Personal Information
                  </Typography>
                  <IconButton
                    color={editing ? 'error' : 'primary'}
                    onClick={handleEditToggle}
                  >
                    {editing ? <CloseIcon /> : <EditIcon />}
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      variant={editing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!editing}
                      variant={editing ? 'outlined' : 'filled'}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      disabled={true} // Email can't be edited
                      variant="filled"
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Profile Image URL"
                      name="profileImage"
                      value={formData.profileImage}
                      onChange={handleInputChange}
                      disabled={!editing}
                      variant={editing ? 'outlined' : 'filled'}
                      margin="normal"
                      helperText={editing ? "Enter a URL for your profile image" : ""}
                    />
                  </Grid>
                </Grid>

                {editing && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      sx={{ mr: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Subscriptions Tab */}
            <TabPanel value={activeTab} index={1}>
              {loadingSubscriptions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : subscriptions.length > 0 ? (
                <Box>
                  {subscriptions.map((subscription, index) => (
                    <Card key={subscription._id || index} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            {subscription.packageType === 'full' ? 'Full Set' :
                              subscription.packageType === 'tops' ? 'Tops Only' : 'Accessories Only'}
                          </Typography>
                          <Chip
                            label={subscription.status || 'Active'}
                            color={subscription.status === 'active' ? 'success' : 'default'}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Plan
                            </Typography>
                            <Typography variant="body1">
                              {subscription.plan === 'monthly' ? 'Monthly' : 'Quarterly'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Quality Tier
                            </Typography>
                            <Typography variant="body1">
                              {subscription.tier === 'budget' ? 'Budget Friendly' :
                                subscription.tier === 'mid' ? 'Premium Selection' : 'Luxury Collection'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Next Delivery
                            </Typography>
                            <Typography variant="body1">
                              {subscription.nextDeliveryDate ? new Date(subscription.nextDeliveryDate).toLocaleDateString() : 'Not scheduled'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="text.secondary">
                              Price
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              ${subscription.price?.total?.toFixed(2) || '0.00'}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Display additional information */}
                        <Box sx={{ mt: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Subscription Details:
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Include Second Hand Items:
                              </Typography>
                              <Typography variant="body2">
                                {subscription.includeSecondHand ? 'Yes' : 'No'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Festive Package:
                              </Typography>
                              <Typography variant="body2">
                                {subscription.festivePackage === 'none' ? 'None' :
                                  subscription.festivePackage === 'cny' ? 'Chinese New Year' :
                                    subscription.festivePackage === 'christmas' ? 'Holiday Season' :
                                      subscription.festivePackage === 'summer' ? 'Summer Special' : 'None'}
                              </Typography>
                            </Grid>
                            {subscription.preferences && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                  Style Preferences:
                                </Typography>
                                <Typography variant="body2">
                                  Exploration Level: {subscription.preferences.explorationLevel === 'no' ? 'Conservative' :
                                    subscription.preferences.explorationLevel === 'moderate' ? 'Moderate' :
                                      subscription.preferences.explorationLevel === 'yes' ? 'Adventurous' : 'Not specified'}
                                </Typography>
                                {subscription.preferences.sizes && (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                    {subscription.preferences.sizes.top && (
                                      <Chip size="small" label={`Top: ${subscription.preferences.sizes.top}`} />
                                    )}
                                    {subscription.preferences.sizes.bottom && (
                                      <Chip size="small" label={`Bottom: ${subscription.preferences.sizes.bottom}`} />
                                    )}
                                    {subscription.preferences.sizes.shoe && (
                                      <Chip size="small" label={`Shoe: ${subscription.preferences.sizes.shoe}`} />
                                    )}
                                  </Box>
                                )}
                              </Grid>
                            )}
                          </Grid>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate(`/subscription/details/${subscription._id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            color={subscription.status === 'active' ? 'warning' : 'primary'}
                            onClick={() => handleUpdateSubscriptionStatus(subscription._id, subscription.status === 'active' ? 'paused' : 'active')}
                          >
                            {subscription.status === 'active' ? 'Pause Subscription' : 'Resume Subscription'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No active subscriptions
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/subscription')}
                    sx={{ mt: 2 }}
                  >
                    Start a Subscription
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Order History Tab */}
            <TabPanel value={activeTab} index={2}>
              {loadingOrders ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : orders.length > 0 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Order History
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table aria-label="order history table">
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>Order ID</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Items</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((order, index) => (
                            <OrderRow key={order._id || order.id} order={order} index={index} />
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={orders.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No order history found
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/marketplace"
                    sx={{ mt: 2 }}
                  >
                    Shop Now
                  </Button>
                </Box>
              )}
            </TabPanel>

            {/* Deliveries Tab */}
            <TabPanel value={activeTab} index={3}>
              {loadingDeliveries ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : deliveries.length > 0 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Subscription Deliveries
                  </Typography>

                  {deliveries.map((delivery, index) => (
                    <Card key={index} sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle1">
                            Delivery Date: {new Date(delivery.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={delivery.items.some(item => item.returned) ? 'Partially Returned' : 'Delivered'}
                            color={delivery.items.some(item => item.returned) ? 'warning' : 'success'}
                            size="small"
                          />
                        </Box>

                        <Typography variant="subtitle2" gutterBottom>
                          Items Received:
                        </Typography>

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {delivery.items.map((item, itemIndex) => (
                                <TableRow key={itemIndex}>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Avatar
                                        variant="square"
                                        src={item.product?.images?.[0]?.url || '/api/placeholder/40/40'}
                                        sx={{ width: 40, height: 40, mr: 1 }}
                                      />
                                      <Box>
                                        <Typography variant="body2">
                                          {item.product?.name || 'Product'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {item.product?.category || ''}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={item.returned ? 'Returned' : 'Kept'}
                                      color={item.returned ? 'default' : 'success'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {!item.returned && (
                                      <Button
                                        variant="outlined"
                                        size="small"
                                      >
                                        Return Item
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {delivery.feedback && delivery.feedback.rating > 0 && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Your Feedback:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                Rating:
                              </Typography>
                              <Rating value={delivery.feedback.rating} readOnly size="small" />
                            </Box>
                            {delivery.feedback.comments && (
                              <Typography variant="body2">
                                "{delivery.feedback.comments}"
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No delivery history found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your delivery information will appear here once you receive items from your subscription.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href="/subscription"
                    sx={{ mt: 2 }}
                  >
                    Start a Subscription
                  </Button>
                </Box>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;