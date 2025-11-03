// client/src/pages/auctionManager/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { authServices } from '../../../services/auth.services';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    await authServices.logout();
    window.location.href = '/';
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="sticky top-0 w-full bg-white shadow-md z-50 h-16 flex items-center border-b border-gray-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center h-full">
        <Link 
          to="/auction-manager" 
          className="text-2xl font-bold text-orange-600 tracking-tight whitespace-nowrap flex-shrink-0 hover:text-orange-700 transition-colors duration-200"
        >
          DriveBidRent
        </Link>
        
        <div className="hidden md:flex items-center space-x-8 h-full">
          <Link 
            to="/auction-manager/requests" 
            className={`font-medium text-sm transition-all duration-200 h-full flex items-center border-b-2 ${
              isActive('/requests') 
                ? 'text-orange-600 border-orange-600' 
                : 'text-gray-600 border-transparent hover:text-orange-600 hover:border-orange-400'
            }`}
          >
            Requests
          </Link>
          <Link 
            to="/auction-manager/pending" 
            className={`font-medium text-sm transition-all duration-200 h-full flex items-center border-b-2 ${
              isActive('/pending') 
                ? 'text-orange-600 border-orange-600' 
                : 'text-gray-600 border-transparent hover:text-orange-600 hover:border-orange-400'
            }`}
          >
            Pending Cars
          </Link>
          <Link 
            to="/auction-manager/approved" 
            className={`font-medium text-sm transition-all duration-200 h-full flex items-center border-b-2 ${
              isActive('/approved') 
                ? 'text-orange-600 border-orange-600' 
                : 'text-gray-600 border-transparent hover:text-orange-600 hover:border-orange-400'
            }`}
          >
            Approved Cars
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link 
            to="/auction-manager/profile" 
            className="flex items-center space-x-2 relative group"
          >
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover transition-all duration-200 group-hover:border-orange-400"
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/auction-manager/profile"
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
        </div>
      </div>
    </nav>
  );
}