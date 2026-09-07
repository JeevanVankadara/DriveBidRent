// routes/seller.routes.js
import express from 'express';
import { upload } from '../config/cloudinary.js';
import sellerMiddleware from '../middlewares/seller.middleware.js';

// Controllers
import { postAddAuction } from '../controllers/sellerControllers/addAuction.controller.js';
import { estimateAuctionPrice } from '../controllers/sellerControllers/priceEstimator.controller.js';
import { postAddRental } from '../controllers/sellerControllers/addRental.controller.js';
import { getAuctionDetail } from '../controllers/sellerControllers/auctionDetail.controller.js';
import { getProfile, updateProfile, updatePreferences, changePassword } from '../controllers/sellerControllers/profile.controller.js';
import { getRentalDetail, postMarkRentalReturned } from '../controllers/sellerControllers/rentalDetail.controller.js';
import { getSellerDashboard } from '../controllers/sellerControllers/sellerDashboard.controller.js';
import { postUpdateRental } from '../controllers/sellerControllers/updateRental.controller.js';
import { getViewAuctions, getViewBids, acceptBid, rejectBid } from '../controllers/sellerControllers/viewAuctions.controller.js';
import { getViewEarnings } from '../controllers/sellerControllers/viewEarnings.controller.js';
import { getViewRentals, postToggleRentalStatus } from '../controllers/sellerControllers/viewRentals.controller.js';
import { getReviews } from '../controllers/buyer/review.controller.js';

const router = express.Router();

// Apply seller authentication middleware to all routes
router.use(sellerMiddleware);

// POST: Estimate auction pricing from seller-entered vehicle details
router.post('/auction-price-estimate', estimateAuctionPrice);

// POST: Add auction with multiple document uploads
router.post('/add-auction', upload.fields([
  // Main photo and side/additional photos are separate fields now.
  // 'vehicleImage' is still accepted so older clients keep working.
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 },
  { name: 'vehicleImage', maxCount: 10 },
  { name: 'registration-certificate', maxCount: 1 },
  { name: 'insurance-document', maxCount: 1 }
]), postAddAuction);

// POST: Add rental
router.post('/add-rental', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 },
  { name: 'vehicleImage', maxCount: 1 }
]), postAddRental);

// GET: Auction detail
router.get('/auction-details/:id', getAuctionDetail);

// Profile routes
router.get('/profile', getProfile);
router.post('/update-profile', updateProfile);
router.post('/update-preferences', updatePreferences);
router.post('/change-password', changePassword);

// GET: Rental detail
router.get('/rental-details/:id', getRentalDetail);

// POST: Mark rental as returned
router.post('/rental/mark-returned/:id', postMarkRentalReturned);

// GET: Seller dashboard
router.get('/seller', getSellerDashboard);

// POST/PUT: Update rental
router.post('/update-rental/:id', upload.single('vehicleImage'), postUpdateRental);
router.put('/update-rental/:id', upload.single('vehicleImage'), postUpdateRental);

// View auctions & bids
router.get('/view-auctions', getViewAuctions);
router.get('/view-bids/:id', getViewBids);
router.put('/accept-bid/:id', acceptBid);
router.put('/reject-bid/:id', rejectBid);

// View earnings
router.get('/view-earnings', getViewEarnings);

// View rentals & toggle status
router.get('/view-rentals', getViewRentals);
router.post('/toggle-rental-status/:id', postToggleRentalStatus);

// Reviews
router.get('/rentals/:id/reviews', getReviews);

export default router;
