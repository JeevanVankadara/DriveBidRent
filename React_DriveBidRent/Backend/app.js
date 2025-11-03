// Backend/app.js
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require('cors');
require("dotenv").config();

const connectDB = require('./config/db');
connectDB();

// Import models (for reference, but not used directly here)
const User = require("./models/User");
const RentalRequest = require("./models/RentalRequest");
const AuctionRequest = require("./models/AuctionRequest");

// Import routes (renamed to dot notation where applicable; extracted auth and home)
const authRoutes = require("./routes/auth.routes");
const homeRoutes = require("./routes/home.routes");
const sellerRoutes = require("./routes/seller.routes");
const auctionManagerRoutes = require("./routes/auctionManager.routes"); // NEW: Auction Manager API
const mechanicRoutes = require("./routes/mechanic.routes");               // NEW: Mechanic API

// Other routes (keep as-is for now; will extract later - commented out EJS renders to avoid errors in API mode)
// const addAuctionRoute = require("./routes/Seller/AddAuction");
// const auctionDetailsRoutes = require("./routes/Seller/AuctionDetail");
// const addRentalRoute = require("./routes/Seller/AddRental");
// const seller_profileRoute = require("./routes/Seller/profile");
// const viewAuctionsRoute = require("./routes/Seller/ViewAuctions.js");
// const viewRentalsRoute = require("./routes/Seller/ViewRentals.js");
// const viewearningsRoute = require("./routes/Seller/ViewEarnings.js");
// const rentalDetailsRoute = require("./routes/Seller/RentalDetails");
// const updateRentalRoute = require('./routes/Seller/UpdateRental');

// const AuctionManagerHomeRoute = require("./routes/AuctionManager/Home.js");
// const Auctionrequests = require("./routes/AuctionManager/Requests.js");
// const AssignMechanic = require("./routes/AuctionManager/AssignMechanic.js");
// const Pendingcars = require("./routes/AuctionManager/Pending.js");
// const approvedCars = require("./routes/AuctionManager/ApprovedCars.js");
// const PendingCarDetails = require("./routes/AuctionManager/PendingCarDetails.js");
// const AuctionProfile=require("./routes/AuctionManager/Profile.js")

// const AdminHomepage = require("./routes/Admin/AdminHome.js");
// const ManageUsers = require("./routes/Admin/ManageUSers.js");
// const adminProfile = require("./routes/Admin/AdminProfile.js");
// const Analytics = require("./routes/Admin/Analytics.js");
// const ManageEarnings = require("./routes/Admin/ManageEarnings.js");

// const Aboutus = require("./routes/Buyer/Aboutus.js");

// const BuyerDashboardRoute = require("./routes/Buyer/BuyerDashboard.js");
// const BuyerAuctionRoute = require("./routes/Buyer/Auction.js");
// const BuyerDriverRoute = require("./routes/Buyer/Driver.js");
// const BuyerRentalRoute = require("./routes/Buyer/Rental.js");
// const BuyerPurchaseRoute = require("./routes/Buyer/Purchase.js");
// const BuyerWishlistRoute = require("./routes/Buyer/Wishlist.js");
// const BuyerProfileRoute = require("./routes/Buyer/Profile.js"); 
// const buyerBidsRoute = require("./routes/Buyer/MyBids");
// const buyerNotificationsRoute = require("./routes/Buyer/Notifications");

// const DriverDashboard = require("./routes/Driver/Dashboard.js");

// const index = require("./routes/Mechanic/index.js");
// const currentTasks = require("./routes/Mechanic/current-tasks.js"); 
// const pendingTasks = require("./routes/Mechanic/pending-tasks.js");
// const pastTasks = require("./routes/Mechanic/past-tasks.js");   
// const profile = require("./routes/Mechanic/profile.js");
// const mcardetails = require("./routes/Mechanic/mcardetails.js")

// Middlewares (updated to dot notation)
const sellerMiddleware = require("./middlewares/seller.middleware");
const mechanicMiddleware = require("./middlewares/mechanic.middleware");
const adminMiddleware = require("./middlewares/admin.middleware");
const auctionManagerMiddleware = require("./middlewares/auction_manager.middleware");
const buyerMiddleware = require("./middlewares/buyer.middleware");

const app = express();

// CORS for frontend: allow common dev server origins or an explicit CLIENT_URL
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // Keep public for images/CSS

// Global /api prefix for new routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/auction-manager", auctionManagerMiddleware, auctionManagerRoutes); // NEW: Auction Manager API
app.use("/api/mechanic", mechanicMiddleware, mechanicRoutes);                     // NEW: Mechanic API

// Existing routes (without /api for now; add prefix later when extracting)
// app.use("/", BuyerDashboardRoute);
// app.use("/", BuyerAuctionRoute);
// app.use("/", BuyerDriverRoute);
// app.use("/", BuyerRentalRoute);
// app.use("/", BuyerPurchaseRoute);
// app.use("/", BuyerWishlistRoute);
// app.use("/", Aboutus);
// app.use("/", BuyerProfileRoute);
// app.use("/", buyerBidsRoute);
// app.use("/", buyerNotificationsRoute);

// app.get("/seller_dashboard/seller", isSellerLoggedin, async (req, res) => {
//   try {
//     res.render("seller_dashboard/seller.ejs", { user: req.user });
//   } catch (err) {
//     console.error(err);
//     res.render("seller_dashboard/seller.ejs", { user: {} });
//   }
// });

// app.use("/seller_dashboard", isSellerLoggedin, addAuctionRoute);
// app.use("/seller_dashboard", isSellerLoggedin, auctionDetailsRoutes);
// app.use("/seller_dashboard", isSellerLoggedin, addRentalRoute);
// app.use("/seller_dashboard", isSellerLoggedin, seller_profileRoute);
// app.use("/seller_dashboard", isSellerLoggedin, viewAuctionsRoute);
// app.use("/seller_dashboard", isSellerLoggedin, viewRentalsRoute);
// app.use("/seller_dashboard", isSellerLoggedin, viewearningsRoute);
// app.use("/seller_dashboard", isSellerLoggedin, rentalDetailsRoute);
// app.use('/seller_dashboard', isSellerLoggedin, updateRentalRoute);

// app.get("/seller_dashboard/update-rental", isSellerLoggedin, async (req, res) => {
//   try {
//     const rentalId = req.query.id;
//     if (!rentalId) {
//       return res.redirect("/seller_dashboard/view-rentals");
//     }

//     res.render("seller_dashboard/update-rental.ejs", { user: req.user, rentalId });
//   } catch (err) {
//     console.error(err);
//     res.render("seller_dashboard/update-rental.ejs", {
//       user: req.user,
//       error: "Failed to load data",
//     });
//   }
// });

// app.get("/seller_dashboard/view-bids", isSellerLoggedin, async (req, res) => {
//   try {
//     const auctionId = req.query.id;
//     if (!auctionId) {
//       return res.redirect("/seller_dashboard/view-auctions");
//     }

//     res.render("seller_dashboard/view-bids.ejs", { user: req.user, auctionId });
//   } catch (err) {
//     console.error(err);
//     res.render("seller_dashboard/view-bids.ejs", {
//       user: req.user,
//       error: "Failed to load data",
//     });
//   }
// });

// app.get("/seller_dashboard/view-rentals", isSellerLoggedin, async (req, res) => {
//   try {
//     res.render("seller_dashboard/view-rentals.ejs", { user: req.user });
//   } catch (err) {
//     console.error(err);
//     res.render("seller_dashboard/view-rentals.ejs", {
//       user: req.user,
//       error: "|Failed to load data",
//     });
//   }
// });

// app.use("/auctionmanager", isAuctionManager, AuctionManagerHomeRoute);
// app.use("/auctionmanager", isAuctionManager, Auctionrequests);
// app.use("/auctionmanager", isAuctionManager, AssignMechanic);
// app.use("/auctionmanager", isAuctionManager, Pendingcars);
// app.use("/auctionmanager", isAuctionManager, approvedCars);
// app.use("/auctionmanager", isAuctionManager, PendingCarDetails);
// app.use("/auctionmanager", isAuctionManager, AuctionProfile);

// app.use("/admin", isAdminLoggedin, AdminHomepage);
// app.use("/admin", isAdminLoggedin, ManageUsers);
// app.use("/admin", isAdminLoggedin, adminProfile);
// app.use("/admin", isAdminLoggedin, Analytics);
// app.use("/admin", isAdminLoggedin, ManageEarnings);

// app.use("/mechanic_dashboard", isMechanicLoggedin, currentTasks);
// app.use("/mechanic_dashboard", isMechanicLoggedin, pendingTasks);
// app.use("/mechanic_dashboard", isMechanicLoggedin, pastTasks);
// app.use("/mechanic_dashboard", isMechanicLoggedin, profile);
// app.use("/mechanic_dashboard", isMechanicLoggedin, index);
// app.use("/mechanic_dashboard", isMechanicLoggedin, mcardetails);

const PORT = process.env.PORT || 8000;

// In production, optionally serve the client build so SPA routes work on direct navigation / refresh.
if (process.env.NODE_ENV === 'production') {
  // Adjust client build path as needed (assumes client build output is at ../client/dist)
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  if (require('fs').existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    // Serve index.html for any non-API GET requests
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
      return res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('Client build not found at', clientBuildPath, '- skipping static serving.');
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;