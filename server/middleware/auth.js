const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {

    // DEVELOPMENT ONLY: Skip authentication

  if (process.env.NODE_ENV === 'development') {
    req.user = { id: '123456789012345678901234' }; // Mock user ID
    return next();
  }

  // Get token from header
  const token = req.header('x-auth-token');
  
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Set user in request
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};