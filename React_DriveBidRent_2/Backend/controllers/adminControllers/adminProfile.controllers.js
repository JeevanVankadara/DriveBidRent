import User from '../../models/User.js';
import bcrypt from 'bcrypt';

const getAdminProfile = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);

    if (!adminUser || adminUser.userType !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Admin profile fetched successfully",
      data: adminUser,
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const adminUser = await User.findById(req.user._id);

    if (!adminUser || adminUser.userType !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
        data: null,
      });
    }

    const isMatch = await adminUser.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        data: null,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
        data: null,
      });
    }

    adminUser.password = newPassword;
    await adminUser.save();

    res.json({
      success: true,
      message: "Password updated successfully",
      data: null,
    });
  } catch (err) {
    console.error("Error updating admin password:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      data: null,
    });
  }
};

const updateAdminAddress = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);

    if (!adminUser || adminUser.userType !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
        data: null,
      });
    }

    // Only the address fields are editable here; name, email, phone and
    // userType stay read-only.
    const fields = ["doorNo", "street", "city", "state"];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        adminUser[field] = String(req.body[field]).trim();
      }
    }

    await adminUser.save();

    res.json({
      success: true,
      message: "Address updated successfully",
      data: {
        doorNo: adminUser.doorNo,
        street: adminUser.street,
        city: adminUser.city,
        state: adminUser.state,
      },
    });
  } catch (err) {
    console.error("Error updating admin address:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
      data: null,
    });
  }
};

export default { getAdminProfile, updateAdminPassword, updateAdminAddress };