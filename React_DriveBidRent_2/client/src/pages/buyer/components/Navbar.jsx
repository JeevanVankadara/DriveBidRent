// client/src/pages/buyer/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProfile } from '../../../services/buyer.services';
import { getUnreadNotificationCount } from '../../../services/buyer.services';
import { useLogout } from '../../../services/auth.services';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, count] = await Promise.all([
          getProfile(),
          getUnreadNotificationCount()
        ]);
        setUser(profileData);
        setUnreadCount(count);
      } catch (err) {
        console.error("Navbar load failed:", err);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      navigate('/', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md border-b border-orange-100 sticky top-0 z-50" style={{ marginBottom: '-8px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/buyer" className="text-3xl font-black text-orange-500 hover:text-orange-600 transition">
              Drive<span className="text-gray-800">BidRent</span>
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex flex-1 justify-center space-x-10">
            <Link
              to="/buyer/purchases"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/purchases') ? 'text-orange-500 font-bold' : ''}`}
            >
              My Purchases
            </Link>
            <Link
              to="/buyer/wishlist"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/wishlist') ? 'text-orange-500 font-bold' : ''}`}
            >
              Wishlist
            </Link>
            <Link
              to="/buyer/my-bids"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/my-bids') ? 'text-orange-500 font-bold' : ''}`}
            >
              My Bids
            </Link>
            <div className="relative">
              <Link
                to="/buyer/notifications"
                className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/notifications') ? 'text-orange-500 font-bold' : ''}`}
              >
                Notifications
              </Link>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <Link
              to="/buyer/about"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/about') ? 'text-orange-500 font-bold' : ''}`}
            >
              About Us
            </Link>
          </div>

          {/* Right Side - Profile & Logout */}
          <div className="flex items-center space-x-4">
            <Link
              to="/buyer/profile"
              className="text-gray-700 hover:text-orange-500 font-medium border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Optional - hidden for now) */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 py-3 px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link to="/buyer/purchases" className="text-gray-600 hover:text-orange-500">Purchases</Link>
          <Link to="/buyer/wishlist" className="text-gray-600 hover:text-orange-500">Wishlist</Link>
          <Link to="/buyer/my-bids" className="text-gray-600 hover:text-orange-500">My Bids</Link>
          <Link to="/buyer/notifications" className="text-gray-600 hover:text-orange-500 relative">
            Notifications
            {unreadCount > 0 && <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
          </Link>
          <Link to="/buyer/about" className="text-gray-600 hover:text-orange-500">About</Link>
        </div>
      </div>
    </nav>
  );
}