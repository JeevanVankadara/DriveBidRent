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
const adminRoutes = require("./routes/admin.routes");              // NEW: Admin API routes
const morgan = require("morgan");

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

// const BuyerDashboar...(truncated 4921 characters)...le.error(err);
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

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173', // Adjust for your React app
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Global /api prefix for all routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/auctionmanager", auctionManagerRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/admin", adminRoutes); // Admin routes with /api prefix

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;