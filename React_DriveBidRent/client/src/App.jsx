// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

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
import RentalDetailsAlt from './pages/seller/RentalDetailsAlt';
import AuctionDetails from './pages/seller/AuctionDetails';

// Auction Manager
import AuctionManagerLayout from './pages/auctionManager/AuctionManagerLayout';
import AuctionManagerDashboard from './pages/auctionManager/Dashboard';
import ApprovedCars from './pages/auctionManager/ApprovedCars';
import AssignMechanic from './pages/auctionManager/AssignMechanic';
import ManagerProfile from './pages/auctionManager/ManagerProfile';
import PendingCarDetails from './pages/auctionManager/PendingCarDetails';
import PendingCars from './pages/auctionManager/PendingCars';
import Requests from './pages/auctionManager/Requests';
import ViewBidsPage from './pages/auctionManager/ViewBids';

// Mechanic
import MechanicLayout from './pages/mechanic/MechanicLayout';
import MechanicDashboard from './pages/mechanic/dashboard/Dashboard';
import CurrentTasks from './pages/mechanic/current-tasks/CurrentTasks';
import PastTasks from './pages/mechanic/past-tasks/PastTasks';
import PendingTasks from './pages/mechanic/pending-tasks/PendingTasks';
import CarDetails from './pages/mechanic/car-details/CarDetails';
import MechanicProfile from './pages/mechanic/profile/Profile';

function App() {
  return (
    <Routes>
      {/* LEGACY REDIRECT */}
      <Route path="/auction-manager-dashboard" element={<Navigate to="/auction-manager" replace />} />

      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Buyer */}
      <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

      {/* SELLER SPA */}
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
        <Route path="rental-details-alt/:id" element={<RentalDetailsAlt />} />
        <Route path="auction-details/:id" element={<AuctionDetails />} />
      </Route>

      {/* AUCTION MANAGER SPA */}
      <Route path="/auction-manager" element={<AuctionManagerLayout />}>
        <Route index element={<AuctionManagerDashboard />} />
        <Route path="dashboard" element={<AuctionManagerDashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="pending" element={<PendingCars />} />
        <Route path="pending-car-details/:id" element={<PendingCarDetails />} />
        <Route path="approved" element={<ApprovedCars />} />
        <Route path="assign-mechanic/:id" element={<AssignMechanic />} />
        <Route path="view-bids/:id" element={<ViewBidsPage />} />
        <Route path="profile" element={<ManagerProfile />} />
      </Route>

      {/* MECHANIC SPA */}
      <Route element={<MechanicLayout />}>
        <Route path="/mechanic/dashboard" element={<MechanicDashboard />} />
        <Route path="/mechanic/current-tasks" element={<CurrentTasks />} />
        <Route path="/mechanic/past-tasks" element={<PastTasks />} />
        <Route path="/mechanic/pending-tasks" element={<PendingTasks />} />
        <Route path="/mechanic/car-details/:id" element={<CarDetails />} />
        <Route path="/mechanic/profile" element={<MechanicProfile />} />
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-gray-700">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
}

export default App;