// client/src/pages/mechanic/components/MechanicNavbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';

export default function MechanicNavbar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/mechanic/dashboard" 
            className="text-2xl font-bold text-orange-600"
          >
            DriveBidRent
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/mechanic/dashboard"
              className={`font-medium transition ${
                isActive('/dashboard') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/mechanic/current-tasks"
              className={`font-medium transition ${
                isActive('/current-tasks') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Current Tasks
            </Link>
            <Link
              to="/mechanic/past-tasks"
              className={`font-medium transition ${
                isActive('/past-tasks') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Past Tasks
            </Link>
            <Link
              to="/mechanic/chats"
              className={`font-medium transition ${
                isActive('/chats') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Chats
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/mechanic/profile"
              className="text-orange-600 font-medium hover:text-orange-700 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}