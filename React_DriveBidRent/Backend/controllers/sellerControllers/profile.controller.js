// Assuming this is the content for profileController.js - update based on old code if available
// Placeholder based on typical profile ops; user mentioned "similarly in same path profileController.js" but didn't provide code, so assuming standard

const User = require('../../models/User');

// GET: Get seller profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// POST: Update profile
const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated',
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// POST: Update notification preferences
const updatePreferences = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { notificationPreference: req.body.notificationPreference },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Preferences updated',
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

// POST: Change password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!await user.comparePassword(req.body.oldPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Old password incorrect'
      });
    }
    user.password = req.body.newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

module.exports = { getProfile, updateProfile, updatePreferences, changePassword };