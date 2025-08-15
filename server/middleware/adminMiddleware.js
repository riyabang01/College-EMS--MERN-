const User = require('../models/User');

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User Role:', user.role);  // Log the role of the user
    if (user.role === 'admin') {
      next();
    } else {
      console.log('Access denied for role:', user.role);
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = admin;
