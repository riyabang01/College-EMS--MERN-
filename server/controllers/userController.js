const express = require('express');
const { loginUser, logoutUser } = require('../controllers/authController');
const { getUsers, updateUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', protect, admin, getUsers);
router.put('/update', protect, updateUser);

module.exports = router;
