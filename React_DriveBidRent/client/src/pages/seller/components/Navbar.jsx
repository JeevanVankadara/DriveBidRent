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
    <nav className="sticky top-0 bg-white shadow-md z-50 h-16 flex items-center border-b border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center h-full">
        {/* Logo */}
        <Link 
          to="/seller/dashboard" 
          className="text-2xl font-bold text-orange-600 tracking-tight whitespace-nowrap flex-shrink-0 hover:text-orange-700 transition-colors duration-200"
        >
          DriveBidRent
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 h-full">
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={`/seller/${path}`}
              className={`font-medium text-sm transition-all duration-200 h-full flex items-center border-b-2 ${
                currentPage === path
                  ? 'text-orange-600 border-orange-600'
                  : 'text-gray-600 border-transparent hover:text-orange-600 hover:border-orange-400'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side: Profile + Logout */}
        <div className="flex items-center space-x-6">
          {/* Profile Picture */}
          <Link 
            to="/seller/profile" 
            className="flex items-center space-x-2 relative group"
          >
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover transition-all duration-200 group-hover:border-orange-400"
            />
          </Link>

          {/* Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/seller/profile"
              className="text-orange-600 font-medium text-sm tracking-wide hover:text-orange-700 transition-colors duration-200"
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow"
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