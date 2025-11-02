const jwt = require("jsonwebtoken");
const User = require("../models/User");

const buyerMiddleware = async (req, res, next) => {
  let token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user || req.user.userType !== "buyer" || decoded.userType !== "buyer" || decoded.email !== req.user.email) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Buyer authentication required.'
        });
      }

      next();
    } catch (error) {
      console.error('Error in buyer.middleware:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login.'
    });
  }
};

module.exports = buyerMiddleware;