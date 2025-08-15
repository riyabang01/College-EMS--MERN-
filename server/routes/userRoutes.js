const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Correct import
const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/update', protect, async (req, res) => { // Add protect middleware
    const { name, email } = req.body;
    try {
        const user = await User.findById(req.user._id); // Correct user ID retrieval
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            await user.save();
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;