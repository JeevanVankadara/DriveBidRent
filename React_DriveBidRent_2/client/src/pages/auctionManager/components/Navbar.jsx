// client/src/pages/auctionManager/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="manager-navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/auctionmanager/dashboard" 
            className="manager-logo"
          >
            DriveBidRent
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/auctionmanager/dashboard" 
              className={`manager-nav-link ${
                isActive('/dashboard') ? 'active' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/auctionmanager/requests" 
              className={`manager-nav-link ${
                isActive('/requests') ? 'active' : ''
              }`}
            >
              Requests
            </Link>
            <Link 
              to="/auctionmanager/pending" 
              className={`manager-nav-link ${
                isActive('/pending') ? 'active' : ''
              }`}
            >
              Pending Cars
            </Link>
            <Link 
              to="/auctionmanager/approved" 
              className={`manager-nav-link ${
                isActive('/approved') ? 'active' : ''
              }`}
            >
              Approved Cars
            </Link>
            <Link 
              to="/auctionmanager/chats" 
              className={`manager-nav-link ${
                isActive('/chats') ? 'active' : ''
              }`}
            >
              Chats
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/auctionmanager/profile"
              className="manager-nav-link"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="manager-btn-primary px-6 py-2 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}