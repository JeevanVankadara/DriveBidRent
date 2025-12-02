// client/src/pages/mechanic/components/MechanicNavbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';

export default function MechanicNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap?.();
    } catch (err) {
      // ignore errors on logout; still navigate away
    } finally {
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="sticky top-0 bg-white border-b-4 border-orange-600 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <NavLink to="/mechanic/dashboard" className="text-3xl font-bold text-orange-600">
            DriveBidRent
          </NavLink>

          <div className="hidden md:flex items-center space-x-10">
            <NavLink
              to="/mechanic/current-tasks"
              className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-orange-600 border-b-4 border-orange-600 pb-1' : 'text-gray-700 hover:text-orange-600'}`}
            >
              Current Tasks
            </NavLink>
            <NavLink
              to="/mechanic/past-tasks"
              className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-orange-600 border-b-4 border-orange-600 pb-1' : 'text-gray-700 hover:text-orange-600'}`}
            >
              Past Tasks
            </NavLink>
            <NavLink
              to="/mechanic/chats"
              className={({ isActive }) => `text-lg font-medium transition ${isActive ? 'text-orange-600 border-b-4 border-orange-600 pb-1' : 'text-gray-700 hover:text-orange-600'}`}
            >
              Chats
            </NavLink>
          </div>

          <div className="flex items-center space-x-6">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Profile" className="w-12 h-12 rounded-full border-2 border-orange-600" />
            <NavLink to="/mechanic/profile" className="text-lg font-medium text-gray-700 hover:text-orange-600">
              Profile
            </NavLink>
            <button onClick={handleLogout} className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}