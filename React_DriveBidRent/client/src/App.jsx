import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import BuyerDashboard from './pages/buyer/Dashboard';
import Dashboard from './pages/seller/Dashboard';  // Converted seller.ejs as Dashboard.jsx
import MechanicDashboard from './pages/mechanic/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AuctionManagerDashboard from './pages/auctionmanager/Dashboard';
import AddAuction from './pages/seller/AddAuction';
import AddRental from './pages/seller/AddRental';
import Profile from './pages/seller/Profile';
import AuctionDetails from './pages/seller/AuctionDetails';
import RentalDetails from './pages/seller/RentalDetails';
import UpdateRental from './pages/seller/updateRental';
import ViewAuctions from './pages/seller/ViewAuctions';
import ViewBids from './pages/seller/ViewBids';
import ViewEarnings from './pages/seller/ViewEarnings';
import ViewRentals from './pages/seller/ViewRentals';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
      <Route path="/seller-dashboard" element={<Dashboard />} />
      <Route path="/mechanic-dashboard" element={<MechanicDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/auction-manager-dashboard" element={<AuctionManagerDashboard />} />
      <Route path="/seller/add-auction" element={<AddAuction />} />
      <Route path="/seller/add-rental" element={<AddRental />} />
      <Route path="/seller/profile" element={<Profile />} />
      <Route path="/seller/auction-details/:id" element={<AuctionDetails />} />
      <Route path="/seller/rental-details/:id" element={<RentalDetails />} />
      <Route path="/seller/update-rental/:id" element={<UpdateRental />} />
      <Route path="/seller/view-auctions" element={<ViewAuctions />} />
      <Route path="/seller/view-bids/:id" element={<ViewBids />} />
      <Route path="/seller/view-earnings" element={<ViewEarnings />} />
      <Route path="/seller/view-rentals" element={<ViewRentals />} />
    </Routes>
  );
}

export default App;