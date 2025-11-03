// Backend/routes/auctionManager.routes.js
const express = require('express');
const router = express.Router();

// Import controllers
const dashboard = require('../controllers/auctionManager/dashboard.controller');
const requests = require('../controllers/auctionManager/requests.controller');
const pending = require('../controllers/auctionManager/pending.controller');
const approved = require('../controllers/auctionManager/approved.controller');
const assign = require('../controllers/auctionManager/assignMechanic.controller');
const auction = require('../controllers/auctionManager/auction.controller');
const profile = require('../controllers/auctionManager/profile.controller');

// Dashboard
router.get('/dashboard', dashboard.getDashboard);

// Requests
router.get('/requests', requests.getRequests);

// Pending
router.get('/pending', pending.getPending);
router.get('/get-review/:id', pending.getReview);
router.post('/update-status/:id', pending.updateStatus);
router.get('/pending-car-details/:id', pending.getPendingCarDetails);

// Approved
router.get('/approved', approved.getApproved);

// Assign Mechanic
router.get('/assign-mechanic/:id', assign.getAssignMechanic);
router.post('/assign-mechanic/:id', assign.assignMechanic);

// Auction Actions
router.post('/start-auction/:id', auction.startAuction);
router.post('/stop-auction/:id', auction.stopAuction);
router.get('/view-bids/:id', auction.viewBids);

// Profile
router.get('/profile', profile.getProfile);
router.post('/update-phone', profile.updatePhone);
router.post('/change-password', profile.changePassword);

module.exports = router;