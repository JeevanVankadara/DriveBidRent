// client/src/App.jsx
import { Routes, Route } from 'react-router-dom';

// Public
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Buyer
import BuyerDashboard from './pages/buyer/Dashboard';

// Seller
import SellerLayout from './pages/seller/SellerLayout';
import Dashboard from './pages/seller/Dashboard';
import AddAuction from './pages/seller/AddAuction';
import AddRental from './pages/seller/AddRental';
import Profile from './pages/seller/Profile';
import ViewAuctions from './pages/seller/ViewAuctions';
import ViewBids from './pages/seller/ViewBids';
import ViewEarnings from './pages/seller/ViewEarnings';
import ViewRentals from './pages/seller/ViewRentals';
import UpdateRental from './pages/seller/UpdateRental';
import RentalDetailsAlt from './pages/seller/RentalDetailsAlt'; // ← Use Alt
import AuctionDetails from './pages/seller/AuctionDetails';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Buyer */}
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

      {/* === SELLER SPA === */}
      <Route path="/seller" element={<SellerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-auction" element={<AddAuction />} />
        <Route path="add-rental" element={<AddRental />} />
        <Route path="profile" element={<Profile />} />
        <Route path="view-auctions" element={<ViewAuctions />} />
        <Route path="view-bids/:id" element={<ViewBids />} />
        <Route path="view-earnings" element={<ViewEarnings />} />
        <Route path="view-rentals" element={<ViewRentals />} />
        <Route path="update-rental/:id" element={<UpdateRental />} />
        <Route path="rental-details-alt/:id" element={<RentalDetailsAlt />} /> {/* ← Both use Alt */}
        <Route path="auction-details/:id" element={<AuctionDetails />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div className="text-center py-20 text-2xl">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;