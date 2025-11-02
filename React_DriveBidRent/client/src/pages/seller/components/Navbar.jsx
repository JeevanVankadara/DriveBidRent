import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fallback user data
  const user = { name: 'Seller' };

  const handleLogout = () => {
    // Add your actual logout logic here
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => location.pathname.includes(path);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/seller/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-orange-600">DriveBidRent</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/seller/dashboard" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/dashboard') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/seller/add-auction" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/add-auction') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Add Auction
            </Link>
            <Link 
              to="/seller/view-auctions" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/view-auctions') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              View Auctions
            </Link>
            <Link 
              to="/seller/add-rental" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/add-rental') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Add Rental
            </Link>
            <Link 
              to="/seller/view-rentals" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/view-rentals') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              View Rentals
            </Link>
            <Link 
              to="/seller/view-earnings" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/view-earnings') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Earnings
            </Link>
            <Link 
              to="/seller/profile" 
              className={`font-medium transition-colors duration-200 py-2 ${
                isActive('/seller/profile') 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-orange-600 focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/seller/dashboard" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/dashboard') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/seller/add-auction" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/add-auction') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Add Auction
              </Link>
              <Link 
                to="/seller/view-auctions" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/view-auctions') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                View Auctions
              </Link>
              <Link 
                to="/seller/add-rental" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/add-rental') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Add Rental
              </Link>
              <Link 
                to="/seller/view-rentals" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/view-rentals') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                View Rentals
              </Link>
              <Link 
                to="/seller/view-earnings" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/view-earnings') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Earnings
              </Link>
              <Link 
                to="/seller/profile" 
                className={`font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive('/seller/profile') 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <div className="border-t border-gray-200 pt-4 px-4">
                <div className="flex flex-col space-y-3">
                  <span className="text-gray-700 font-medium text-center">Welcome, {user?.name}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;