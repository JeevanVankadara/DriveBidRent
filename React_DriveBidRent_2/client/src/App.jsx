// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// === PUBLIC ROUTES ===
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// === ADMIN ===
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';
import ManageEarnings from './pages/admin/ManageEarnings';
import AdminProfile from './pages/admin/AdminProfile';

// === BUYER ===
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/Dashboard';
import AuctionsList from './pages/buyer/AuctionsList';
import AuctionDetails from './pages/buyer/AuctionDetails';
import CompletedAuctionDetails from './pages/buyer/CompletedAuctionDetails';
import BidPage from './pages/buyer/BidPage';
import RentalsList from './pages/buyer/RentalsList';
import RentalDetails from './pages/buyer/RentalDetails';
import BookRental from './pages/buyer/BookRental';
import PurchasesList from './pages/buyer/PurchasesList';
import PurchaseDetails from './pages/buyer/PurchaseDetails';
import MyBids from './pages/buyer/MyBids';
import Wishlist from './pages/buyer/Wishlist';
import BuyerProfile from './pages/buyer/Profile';          
import Notifications from './pages/buyer/Notifications';
import AboutUs from './pages/buyer/AboutUs';
import ChatListBuyer from './pages/buyer/ChatListBuyer';
import ChatRoomBuyer from './pages/buyer/ChatRoomBuyer';
import ChatPageBuyer from './pages/buyer/ChatPageBuyer';

// === SELLER ===
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/Dashboard';
import AddAuction from './pages/seller/AddAuction';
import AddRental from './pages/seller/AddRental';
import SellerProfile from './pages/seller/Profile';           // Consistent name
import ViewAuctions from './pages/seller/ViewAuctions';
import ViewBids from './pages/seller/ViewBids';
import ViewEarnings from './pages/seller/ViewEarnings';
import ViewRentals from './pages/seller/ViewRentals';
import UpdateRental from './pages/seller/UpdateRental';
import RentalDetailsAlt from './pages/seller/RentalDetailsAlt';
import AuctionDetailsSeller from './pages/seller/AuctionDetails';  // Clear distinction
import ChatListSeller from './pages/seller/ChatListSeller';
import ChatRoomSeller from './pages/seller/ChatRoomSeller';
import ChatPageSeller from './pages/seller/ChatPageSeller';

// === AUCTION MANAGER ===
import AuctionManagerLayout from './pages/auctionManager/AuctionManagerLayout';
import AuctionManagerDashboard from './pages/auctionManager/Dashboard';
import ApprovedCars from './pages/auctionManager/ApprovedCars';
import AssignMechanic from './pages/auctionManager/AssignMechanic';
import ManagerProfile from './pages/auctionManager/ManagerProfile';
import PendingCarDetails from './pages/auctionManager/PendingCarDetails';
import PendingCars from './pages/auctionManager/PendingCars';
import Requests from './pages/auctionManager/Requests';
import ViewBidsPage from './pages/auctionManager/ViewBids';
import ChatPageAuctionManager from './pages/auctionManager/ChatPageAuctionManager';

// === MECHANIC ===
import MechanicLayout from './pages/mechanic/MechanicLayout';
import MechanicDashboard from './pages/mechanic/dashboard/Dashboard';
import CurrentTasks from './pages/mechanic/current-tasks/CurrentTasks';
import PastTasks from './pages/mechanic/past-tasks/PastTasks';
import PendingTasks from './pages/mechanic/pending-tasks/PendingTasks';
import CarDetails from './pages/mechanic/car-details/CarDetails';
import MechanicProfile from './pages/mechanic/profile/Profile';
import ChatPageMechanic from './pages/mechanic/ChatPageMechanic';

function App() {
  return (
    <Routes>
      {/* === LEGACY REDIRECTS === */}
      <Route path="/auctionmanager-dashboard" element={<Navigate to="/auctionmanager" replace />} />
      <Route path="/buyer-dashboard" element={<Navigate to="/buyer" replace />} />

      {/* === PUBLIC ROUTES === */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* === ADMIN SPA === */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="manage-earnings" element={<ManageEarnings />} />
        <Route path="admin-profile" element={<AdminProfile />} />
      </Route>

      {/* === BUYER SPA === */}
      <Route path="/buyer" element={<BuyerLayout />}>
        <Route index element={<BuyerDashboard />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="auctions" element={<AuctionsList />} />
        <Route path="auctions/:id" element={<AuctionDetails />} />
        <Route path="auctions/:id/bid" element={<BidPage />} />
        <Route path="completed-auction/:id" element={<CompletedAuctionDetails />} />
        <Route path="rentals" element={<RentalsList />} />
        <Route path="rentals/:id" element={<RentalDetails />} />
        <Route path="rentals/:id/book" element={<BookRental />} />
        <Route path="purchases" element={<PurchasesList />} />
        <Route path="purchases/:id" element={<PurchaseDetails />} />
        <Route path="my-bids" element={<MyBids />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<BuyerProfile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="chats" element={<ChatPageBuyer />} />
        <Route path="chats/:chatId" element={<ChatPageBuyer />} />
      </Route>

      {/* === SELLER SPA === */}
      <Route path="/seller" element={<SellerLayout />}>
        <Route index element={<SellerDashboard />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="add-auction" element={<AddAuction />} />
        <Route path="add-rental" element={<AddRental />} />
        <Route path="profile" element={<SellerProfile />} />
        <Route path="view-auctions" element={<ViewAuctions />} />
        <Route path="view-bids/:id" element={<ViewBids />} />
        <Route path="view-earnings" element={<ViewEarnings />} />
        <Route path="view-rentals" element={<ViewRentals />} />
        <Route path="update-rental/:id" element={<UpdateRental />} />
        <Route path="rental-details-alt/:id" element={<RentalDetailsAlt />} />
        <Route path="auction-details/:id" element={<AuctionDetailsSeller />} />
        <Route path="chats" element={<ChatPageSeller />} />
        <Route path="chats/:chatId" element={<ChatPageSeller />} />
      </Route>

      {/* === AUCTION MANAGER SPA === */}
      <Route path="/auctionmanager" element={<AuctionManagerLayout />}>
        <Route index element={<AuctionManagerDashboard />} />
        <Route path="dashboard" element={<AuctionManagerDashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="pending" element={<PendingCars />} />
        <Route path="pending-car-details/:id" element={<PendingCarDetails />} />
        <Route path="approved" element={<ApprovedCars />} />
        <Route path="assign-mechanic/:id" element={<AssignMechanic />} />
        <Route path="view-bids/:id" element={<ViewBidsPage />} />
        <Route path="profile" element={<ManagerProfile />} />
        <Route path="chats" element={<ChatPageAuctionManager />} />
        <Route path="chats/:chatId" element={<ChatPageAuctionManager />} />
      </Route>

      {/* === MECHANIC SPA === */}
      <Route path="/mechanic" element={<MechanicLayout />}>
        <Route index element={<MechanicDashboard />} />
        <Route path="dashboard" element={<MechanicDashboard />} />
        <Route path="current-tasks" element={<CurrentTasks />} />
        <Route path="past-tasks" element={<PastTasks />} />
        <Route path="pending-tasks" element={<PendingTasks />} />
        <Route path="car-details/:id" element={<CarDetails />} />
        <Route path="profile" element={<MechanicProfile />} />
        <Route path="chats" element={<ChatPageMechanic />} />
        <Route path="chats/:chatId" element={<ChatPageMechanic />} />
      </Route>

      {/* === 404 NOT FOUND === */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-gray-700 bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl mb-4">404</h1>
              <p>Page Not Found</p>
              <p className="text-sm text-gray-500 mt-4">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;