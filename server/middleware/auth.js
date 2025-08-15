const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Extract the token

    // Log token length for debugging instead of printing the entire token
    console.log("🔹 Received Token Length:", token.length);

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      req.user = await User.findById(decoded.id).select('-password'); // Attach user info

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware
    } catch (error) {
      console.error("❌ JWT Error:", error);

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please log in again' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(401).json({ message: 'Token verification failed' });
      }
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
