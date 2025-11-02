const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const authController = {
  signup: async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        userType,
        dateOfBirth,
        drivingLicense,
        shopName,
        termsAccepted,
        phone,
        experienceYears,
        approved_status
      } = req.body;
      
      const googleAddressLink = userType === 'mechanic' ? req.body.googleAddressLink : undefined;

      let doorNo, street, city, state;
      
      if (req.body.doorNo) {
        doorNo = Array.isArray(req.body.doorNo) 
          ? req.body.doorNo.find(val => val && val.trim() !== '') 
          : req.body.doorNo;
      }
      
      if (req.body.street) {
        street = Array.isArray(req.body.street) 
          ? req.body.street.find(val => val && val.trim() !== '') 
          : req.body.street;
      }
      
      if (req.body.city) {
        city = Array.isArray(req.body.city) 
          ? req.body.city.find(val => val && val.trim() !== '') 
          : req.body.city;
      }
      
      if (req.body.state) {
        state = Array.isArray(req.body.state) 
          ? req.body.state.find(val => val && val.trim() !== '') 
          : req.body.state;
      }
      
      const repairBikes = req.body.repairBikes === "on" || req.body.repairBikes === true;
      const repairCars = req.body.repairCars === "on" || req.body.repairCars === true;

      // Validation checks
      if (!phone || !phone.match(/^\d{10}$/)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits"
        });
      }

      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          success: false,
          message: "You must be at least 18 years old to sign up"
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match"
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters long"
        });
      }

      if (!termsAccepted) {
        return res.status(400).json({
          success: false,
          message: "You must accept the terms and conditions"
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists"
        });
      }

      // Check for existing phone number
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists"
        });
      }

      const parsedExperienceYears = experienceYears ? parseInt(experienceYears) : undefined;

      const userData = {
        firstName,
        lastName,
        email,
        password,
        userType,
        dateOfBirth,
        phone,
        experienceYears: parsedExperienceYears,
        approved_status: approved_status || 'No',
        repairBikes,
        repairCars
      };
      
      if (doorNo) userData.doorNo = doorNo;
      if (street) userData.street = street;
      if (city) userData.city = city;
      if (state) userData.state = state;
      if (drivingLicense) userData.drivingLicense = drivingLicense;
      if (shopName) userData.shopName = shopName;
      if (googleAddressLink) userData.googleAddressLink = googleAddressLink;
      
      const user = new User(userData);
      await user.save();

      return res.status(201).json({
        success: true,
        message: "Account created successfully! Redirecting to login...",
        data: { userId: user._id, userType: user.userType }
      });
      
    } catch (err) {
      console.error("Error in signup process:", err);
      
      let errorMessage = "An error occurred during signup";
      
      // Handle specific error types
      if (err.name === 'ValidationError') {
        errorMessage = "Validation failed: " + Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessage
        });
      }
      
      if (err.code === 11000) {
        errorMessage = "User already exists with this email or phone number";
        return res.status(409).json({
          success: false,
          message: errorMessage
        });
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
    
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }

      const token = generateToken(user);
      res.cookie('jwt', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      let redirectUrl = '/';
      switch (user.userType) {
        case "buyer":
          redirectUrl = "/buyer-dashboard";
          break;
        case "seller":
          redirectUrl = "/seller-dashboard";
          break;
        case "driver":
          redirectUrl = "/driver-dashboard";
          break;
        case "mechanic":
          redirectUrl = "/mechanic-dashboard";
          break;
        case "admin":
          redirectUrl = "/admin-dashboard";
          break;
        case "auction_manager":
          redirectUrl = "/auction-manager-dashboard";
          break;
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType
          },
          redirectUrl
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login"
      });
    }
  }
};

module.exports = authController;