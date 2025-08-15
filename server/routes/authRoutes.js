const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// ✅ Generate JWT Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '100d' });
};

// ✅ Generate JWT Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_REFRESH, { expiresIn: '100d' });
};

// ✅ Register a new user
router.post('/register', async (req, res) => {
  try {
    console.log("📝 Registration Request:", req.body);

    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email is already in use
    const existingUser = await User.isEmailTaken(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use. Please login.' });
    }

    // Create a new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ✅ Login User
router.post('/login', async (req, res) => {
  console.log("Login Request Received:", req.body); // ✅ Debugging

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found"); // ✅ Debugging
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password mismatch"); // ✅ Debugging
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    console.log("Generated Access Token:", accessToken); // ✅ Debugging
    console.log("Generated Refresh Token:", refreshToken); // ✅ Debugging

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Refresh Token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // ✅ Generate new access token
    const newAccessToken = generateAccessToken(user.id);

    console.log("✅ Generated New Access Token:", newAccessToken);

    res.status(200).json({ accessToken: newAccessToken });
  });
});

module.exports = router;
