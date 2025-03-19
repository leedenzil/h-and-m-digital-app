import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import UndoIcon from '@mui/icons-material/Undo';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

// Sample data - in a real app, this would come from an API
const userActivityData = {
  swipeData: [
    { category: 'Shirts', liked: 65, disliked: 35 },
    { category: 'Pants', liked: 42, disliked: 58 },
    { category: 'Dresses', liked: 78, disliked: 22 },
    { category: 'Accessories', liked: 53, disliked: 47 },
    { category: 'Shoes', liked: 39, disliked: 61 }
  ],
  returnData: [
    { month: 'Jan', returns: 12, keeps: 43 },
    { month: 'Feb', returns: 19, keeps: 38 },
    { month: 'Mar', returns: 7, keeps: 52 },
    { month: 'Apr', returns: 14, keeps: 41 },
    { month: 'May', returns: 10, keeps: 45 }
  ],
  categoryPreferences: [
    { name: 'Casual', value: 35 },
    { name: 'Formal', value: 15 },
    { name: 'Athletic', value: 20 },
    { name: 'Festive', value: 10 },
    { name: 'Accessories', value: 20 }
  ],
  pricePreferences: [
    { name: 'Budget', value: 30 },
    { name: 'Mid-range', value: 55 },
    { name: 'Premium', value: 15 }
  ]
};

// Top recommendations based on analysis
const recommendations = [
  { 
    id: 1, 
    name: 'Floral Summer Dress', 
    confidence: 92, 
    reason: 'Based on your swipe history and kept items' 
  },
  { 
    id: 2, 
    name: 'Silver Chain Necklace', 
    confidence: 87, 
    reason: 'Matches with 3 items in your current subscription' 
  },
  { 
    id: 3, 
    name: 'Casual Denim Jacket', 
    confidence: 85, 
    reason: 'Similar to items you frequently keep' 
  },
  { 
    id: 4, 
    name: 'Black Leather Belt', 
    confidence: 82, 
    reason: 'Complements your recent purchases' 
  },
  { 
    id: 5, 
    name: 'Striped Cotton T-shirt', 
    confidence: 79, 
    reason: 'Matches your color preferences' 
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsTool() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [insightGenerated, setInsightGenerated] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserData(userActivityData);
      setLoading(false);
    }, 1500);
  }, []);

  const generateInsights = () => {
    setInsightGenerated(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading your preference data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Preference Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Based on your subscription history, swipe patterns, and returns, we've analyzed your preferences to enhance your H&M experience.
      </Typography>

      {!insightGenerated && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<TrendingUpIcon />}
            onClick={generateInsights}
          >
            Generate Personalized Insights
          </Button>
        </Box>
      )}

      {insightGenerated && (
        <Grid container spacing={3}>
          {/* Top Recommendations */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon color="error" sx={{ mr: 1 }} /> Top Recommendations
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Match Confidence</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recommendations.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgressWithLabel value={item.confidence} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">{`${item.confidence}%`}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="contained" sx={{ mr: 1 }}>
                            Add to Box
                          </Button>
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Swipe Patterns */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Swipe Pattern Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your preferences based on swipe activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={userData.swipeData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="liked" fill="#8884d8" name="Liked" />
                    <Bar dataKey="disliked" fill="#82ca9d" name="Disliked" />
                  </BarChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Insight:</strong> You show a strong preference for dresses and shirts over pants and shoes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Return Analysis */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <UndoIcon sx={{ mr: 1 }} /> Return Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Items kept vs returned over time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={userData.returnData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="keeps" stroke="#8884d8" name="Items Kept" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="returns" stroke="#82ca9d" name="Items Returned" />
                  </LineChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Insight:</strong> Your satisfaction with subscription items is increasing, with March showing the lowest return rate.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Preferences */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Category Preferences
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userData.categoryPreferences}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userData.categoryPreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Recommendation:</strong> Consider increasing casual wear in your subscription plan.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Price Tier Preferences */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingBagIcon sx={{ mr: 1 }} /> Price Tier Preferences
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userData.pricePreferences}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userData.pricePreferences.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <strong>Insight:</strong> You tend to prefer mid-range items with occasional premium pieces.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

// Helper component for recommendation confidence
function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <div
          style={{
            height: 10,
            borderRadius: 5,
            background: `linear-gradient(90deg, #4caf50 ${props.value}%, #e0e0e0 ${props.value}%)`,
          }}
        />
      </Box>
    </Box>
  );
}