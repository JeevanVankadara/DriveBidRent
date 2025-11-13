const express = require("express");
const router = express.Router();
const dashboardControllers = require("../controllers/adminControllers/dashboard.controllers");
const manageUsersControllers = require("../controllers/adminControllers/manageUsers.controllers");
const analyticsControllers = require("../controllers/adminControllers/analytics.controllers");
const manageEarningsControllers = require("../controllers/adminControllers/manageEarnings.controllers");
const adminProfileControllers = require("../controllers/adminControllers/adminProfile.controllers");
const isAdminLoggedin = require("../middlewares/auth.middleware");

// Dashboard
router.get("/admin", isAdminLoggedin, dashboardControllers.getAdminDashboard);

// Manage Users
router.get("/manage-user", isAdminLoggedin, manageUsersControllers.getManageUsers);
router.post("/approve-user/:id", isAdminLoggedin, manageUsersControllers.approveMechanic);
router.post("/decline-user/:id", isAdminLoggedin, manageUsersControllers.declineUser);
router.post("/delete-buyer/:id", isAdminLoggedin, manageUsersControllers.deleteBuyer);
router.post("/delete-seller/:id", isAdminLoggedin, manageUsersControllers.deleteSeller);

// Analytics
router.get("/analytics", isAdminLoggedin, analyticsControllers.getAnalytics);

// Manage Earnings
router.get("/manage-earnings", isAdminLoggedin, manageEarningsControllers.getManageEarnings);

// Admin Profile
router.get("/admin-profile", isAdminLoggedin, adminProfileControllers.getAdminProfile);
router.post("/update-admin-password", isAdminLoggedin, adminProfileControllers.updateAdminPassword);

module.exports = router;