// client/src/pages/buyer/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useProfile from '../../../hooks/useProfile';
import { getUnreadNotificationCount } from '../../../services/buyer.services';
import axiosInstance from '../../../utils/axiosInstance.util';
import { logoutUser } from '../../../redux/slices/authSlice';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading: profileLoading, error: profileError, refresh } = useProfile();

  useEffect(() => {
    const loadData = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
        setUser(profile || null);
        // load chat unread count
        try {
          const r = await axiosInstance.get('/chat/my-chats');
          const chats = r.data?.data || [];
          const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
          setChatUnreadCount(sum);
        } catch (err) {
          // ignore chat unread errors
        }
      } catch (err) {
        console.error("Navbar load failed:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Listen for notificationsSeen event to refresh badge/profile
    const handler = async () => {
      try {
        const count = await getUnreadNotificationCount();
        setUser(profile || null);
        setUnreadCount(count);
        try {
          const r = await axiosInstance.get('/chat/my-chats');
          const chats = r.data?.data || [];
          const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
          setChatUnreadCount(sum);
        } catch (err) {}
      } catch (err) {
        console.error('Failed to refresh profile after notificationsSeen', err);
      }
    };

    window.addEventListener('notificationsSeen', handler);
    return () => window.removeEventListener('notificationsSeen', handler);
  }, []);

  // update chat unread badge when a chat is marked read
  useEffect(() => {
    const onRead = (e) => {
      try {
        const { updated } = e.detail || {};
        setChatUnreadCount(prev => Math.max(0, prev - (updated || 0)));
      } catch (err) { }
    };
    window.addEventListener('chatRead', onRead);
    return () => window.removeEventListener('chatRead', onRead);
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      navigate('/', { replace: true });
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
              {user?.notificationFlag && (
                <span className="absolute -top-3 -right-6 bg-orange-500 rounded-full h-3 w-3 shadow-md" aria-hidden="true" />
              )}
            </div>
            <Link
              to="/buyer/about"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/about') ? 'text-orange-500 font-bold' : ''}`}
            >
              About Us
            </Link>
            <Link
              to="/buyer/chats"
              className={`text-gray-700 hover:text-orange-500 font-medium transition ${isActive('/buyer/chats') ? 'text-orange-500 font-bold' : ''}`}
            >
              Chat
              {chatUnreadCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5">{chatUnreadCount}</span>
              )}
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
              <Link to="/buyer/chats" className="text-gray-600 hover:text-orange-500">Chat{chatUnreadCount > 0 && <span className="ml-2 inline-flex items-center justify-center bg-red-500 text-white text-xs rounded-full h-5 w-5">{chatUnreadCount}</span>}</Link>
          <Link to="/buyer/about" className="text-gray-600 hover:text-orange-500">About</Link>
        </div>
      </div>
    </nav>
  );
}