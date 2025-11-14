// routes/auth.routes.js
import express from 'express';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// LOGOUT: Clear cookie + return redirect
router.get('/logout', (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'strict'
  });
  return res.json({
    success: true,
    message: 'Logged out successfully',
    redirectUrl: '/'
  });
});

export default router;