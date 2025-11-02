const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.json({
    success: true,
    message: 'Logged out successfully',
    data: { redirectUrl: '/' }
  });
});

module.exports = router;