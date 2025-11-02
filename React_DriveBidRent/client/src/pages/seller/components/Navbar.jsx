// client/src/pages/seller/components/Navbar.jsx
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authServices } from '../../../services/auth.services';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract current page from URL (e.g., '/seller/add-auction' → 'add-auction')
  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  const handleLogout = async () => {
    try {
      await authServices.logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show toast/notification
      navigate('/', { replace: true });
    }
  };

  const navItems = [
    { path: 'dashboard', label: 'Dashboard' },
    { path: 'add-auction', label: 'Add Auction' },
    { path: 'add-rental', label: 'Add Rental' },
    { path: 'view-auctions', label: 'Auctions' },
    { path: 'view-rentals', label: 'Rentals' },
    { path: 'view-earnings', label: 'Earnings' },
  ];

  return (
    <nav className="sticky top-0 bg-white shadow-md z-50 h-16 flex items-center border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
        {/* Logo */}
        <Link to="/seller/dashboard" className="text-2xl font-bold text-orange-600 tracking-tight">
          DriveBidRent
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={`/seller/${path}`}
              className={`font-medium text-sm transition-colors duration-200 ${
                currentPage === path
                  ? 'text-orange-600 border-b-2 border-orange-600 pb-1'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side: Profile + Logout */}
        <div className="flex items-center space-x-4">
          {/* Profile Picture */}
          <Link to="/seller/profile" className="flex items-center space-x-2">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Profile"
              className="w-10 h-10 rounded-full border border-gray-300 object-cover"
            />
          </Link>

          {/* Profile & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/seller/profile"
              className="text-orange-600 font-semibold uppercase text-xs tracking-wider hover:underline"
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-orange-700 transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button (Optional Future Use) */}
          <button className="md:hidden text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;