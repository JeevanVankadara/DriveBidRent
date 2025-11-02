import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import BuyerDashboard from './pages/buyer/Dashboard';
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
import RentalDetails from './pages/seller/RentalDetails';
import AuctionDetails from './pages/seller/AuctionDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

      <Route path="/seller" element={<SellerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-auction" element={<AddAuction />} />
        <Route path="add-rental" element={<AddRental />} />
        <Route path="profile" element={<Profile />} />
        <Route path="view-auctions" element={<ViewAuctions />} />
        <Route path="view-bids/:id" element={<ViewBids />} />
        <Route path="view-earnings" element={<ViewEarnings />} />
        <Route path="view-rentals" element={<ViewRentals />} />
        <Route path="update-rental/:id" element={<UpdateRental />} />
        <Route path="rental-details/:id" element={<RentalDetails />} />
        <Route path="auction-details/:id" element={<AuctionDetails />} />
      </Route>

      <Route path="*" element={<div className="text-center py-20">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;