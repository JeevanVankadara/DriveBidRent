// client/src/pages/buyer/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useProfile from '../../../hooks/useProfile';
import { getUnreadNotificationCount } from '../../../services/buyer.services';
import axiosInstance from '../../../utils/axiosInstance.util';
import { logoutUser } from '../../../redux/slices/authSlice';
import '../BuyerDashboard.css';

export default function Navbar() {
  const [_user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profile, loading: _profileLoading, error: _profileError, refresh: _refresh } = useProfile();

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
    
    // Initial load only
    loadData();
  }, [profile]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // update chat unread badge when a chat is deleted
  useEffect(() => {
    const onDeleted = async () => {
      try {
        const r = await axiosInstance.get('/chat/my-chats');
        const chats = r.data?.data || [];
        const sum = chats.reduce((acc, c) => acc + (c.unreadCount || c.unread || 0), 0);
        setChatUnreadCount(sum);
      } catch (err) {
        console.error('Failed to refresh chat count after deletion:', err);
      }
    };
    window.addEventListener('chatDeleted', onDeleted);
    return () => window.removeEventListener('chatDeleted', onDeleted);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="buyer-navbar sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10">
        <div className="flex justify-between items-center gap-6 h-16 sm:h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/buyer" className="buyer-logo text-2xl">
              Drive<span className="hub-logo-mid">Bid</span>Rent
            </Link>
          </div>

          {/* Center Links */}
          <div className="hidden lg:flex items-center gap-7">
            <Link
              to="/buyer/purchases"
              className={`buyer-nav-link ${isActive('/buyer/purchases') ? 'active' : ''}`}
            >
              My Purchases
            </Link>
            <Link
              to="/buyer/wishlist"
              className={`buyer-nav-link ${isActive('/buyer/wishlist') ? 'active' : ''}`}
            >
              Wishlist
            </Link>
            <Link
              to="/buyer/my-bids"
              className={`buyer-nav-link ${isActive('/buyer/my-bids') ? 'active' : ''}`}
            >
              My Bids
            </Link>
            <Link
              to="/buyer/notifications"
              className={`buyer-nav-link ${isActive('/buyer/notifications') ? 'active' : ''}`}
            >
              Notifications
              {unreadCount > 0 && (
                <span className="hub-nav-badge ml-2" aria-hidden="true">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/buyer/about"
              className={`buyer-nav-link ${isActive('/buyer/about') ? 'active' : ''}`}
            >
              About Us
            </Link>
            <Link
              to="/buyer/chats"
              className={`buyer-nav-link ${isActive('/buyer/chats') ? 'active' : ''}`}
            >
              Chat
              {chatUnreadCount > 0 && (
                <span className="hub-nav-badge ml-2">{chatUnreadCount}</span>
              )}
            </Link>
          </div>

          {/* Right Side - Profile & Logout */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/buyer/profile" className="hub-nav-profile">
              Profile
            </Link>

            <button onClick={handleLogout} className="hub-nav-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden hub-mobile-nav py-2 px-2">
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <Link to="/buyer/purchases" className="hub-mobile-link">Purchases</Link>
          <Link to="/buyer/wishlist" className="hub-mobile-link">Wishlist</Link>
          <Link to="/buyer/my-bids" className="hub-mobile-link">My Bids</Link>
          <Link to="/buyer/notifications" className="hub-mobile-link">
            Notifications{unreadCount > 0 && <span className="hub-nav-badge ml-1">{unreadCount}</span>}
          </Link>
          <Link to="/buyer/chats" className="hub-mobile-link">
            Chat{chatUnreadCount > 0 && <span className="hub-nav-badge ml-1">{chatUnreadCount}</span>}
          </Link>
          <Link to="/buyer/about" className="hub-mobile-link">About</Link>
          <Link to="/buyer/profile" className="hub-text-primary font-medium">Profile</Link>
          <button onClick={handleLogout} className="hub-text-primary font-medium">Logout</button>
        </div>
      </div>
    </nav>
  );
}