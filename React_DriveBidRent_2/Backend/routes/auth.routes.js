// routes/auth.routes.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import authController from '../controllers/auth.controller.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Signup validation rules
const signupValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('userType')
    .isIn(['buyer', 'seller', 'driver', 'mechanic', 'admin', 'auction_manager'])
    .withMessage('Invalid user type'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const dob = new Date(value);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        throw new Error('You must be at least 18 years old');
      }
      return true;
    })
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Apply validation to routes
router.post('/signup', signupValidation, validate, authController.signup);
router.post('/login', loginValidation, validate, authController.login);

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