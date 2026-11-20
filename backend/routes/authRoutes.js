const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  loginAdmin,
  logoutAdmin,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.post('/admin/logout', logoutAdmin);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
