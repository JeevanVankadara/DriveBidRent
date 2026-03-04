// client/src/pages/auctionManager/ManagerProfile.jsx
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionManagerDashboard.css';

export default function ManagerProfile() {
  const [user, setUser] = useState({});
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  // Fetch profile directly from auction manager endpoint
  useEffect(() => {
    const fetchProfile = async () => {
      console.log('🔍 [Frontend] Fetching auction manager profile...');
      try {
        setLoading(true);
        const response = await auctionManagerServices.getProfile();
        console.log('📦 [Frontend] Profile API response:', response);
        
        const profileData = response?.data?.data?.user || response?.data?.user || response?.data || {};
        console.log('✅ [Frontend] Extracted profile data:', profileData);
        
        // Set userType as 'auction_manager' by default
        const userWithType = {
          ...profileData,
          userType: 'auction_manager'
        };
        
        setUser(userWithType);
        setPhone(userWithType.phone || '');
        console.log('✅ [Frontend] Profile loaded successfully:', {
          name: `${userWithType.firstName} ${userWithType.lastName}`,
          email: userWithType.email,
          phone: userWithType.phone,
          userType: userWithType.userType
        });
      } catch (error) {
        console.error('❌ [Frontend] Failed to fetch profile:', error);
        toast.error('Failed to load profile. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!value) {
      setPasswordStrength('');
    } else if (!strongRegex.test(value)) {
      setPasswordStrength('❌ Weak: needs uppercase, number, special char');
    } else {
      setPasswordStrength('✅ Strong password');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (!value) {
      setPasswordMatch('');
    } else if (newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleOldPasswordChange = (value) => {
    setOldPassword(value);
  };



  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    console.log('📱 [Frontend] Updating phone number to:', phone);
    
    if (!/^\d{10}$/.test(phone)) {
      console.log('❌ [Frontend] Invalid phone format:', phone);
      toast.error('Phone number must be 10 digits');
      return;
    }
    if (phone === user.phone) {
      console.log('❌ [Frontend] New phone same as current phone');
      toast.error('New phone number cannot be the same as current phone number');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.updatePhone(phone);
      console.log('📦 [Frontend] Update phone response:', res);
      
      const responseData = res.data || res;
      if (responseData.success) {
        console.log('✅ [Frontend] Phone updated successfully');
        toast.success('Phone updated successfully');
        setUser(prev => ({ ...prev, phone }));
      } else {
        console.log('❌ [Frontend] Phone update failed:', responseData.message);
        toast.error(responseData.message || 'Failed to update phone');
      }
    } catch (err) {
      console.error('❌ [Frontend] Phone update error:', err);
      toast.error('Failed to update phone');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    console.log('🔐 [Frontend] Attempting to change password');
    
    if (!oldPassword) {
      console.log('❌ [Frontend] Current password not provided');
      toast.error('Please enter your current password');
      return;
    }
    if (oldPassword === newPassword) {
      console.log('❌ [Frontend] New password same as current');
      toast.error('New password cannot be the same as current password');
      return;
    }
    if (newPassword !== confirmPassword) {
      console.log('❌ [Frontend] Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      console.log('❌ [Frontend] Password too short');
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.changePassword({ oldPassword, newPassword });
      console.log('📦 [Frontend] Change password response:', res);
      
      const responseData = res.data || res;
      if (responseData.success) {
        console.log('✅ [Frontend] Password changed successfully');
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setPasswordMatch('');
      } else {
        console.log('❌ [Frontend] Password change failed:', responseData.message);
        toast.error(responseData.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('❌ [Frontend] Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="pt-8 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="manager-page-header">
          <h1 className="manager-page-title">Manager Profile</h1>
          <p className="manager-page-subtitle">Manage your personal details and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details Section */}
          <div className="manager-section">
            <div className="manager-section-header">
              <h3 className="manager-section-title text-2xl">Personal Details</h3>
            </div>
            
            <form onSubmit={handlePhoneUpdate} className="space-y-6">
              <div className="manager-form-group">
                <label className="manager-form-label">Full Name</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-lg font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </div>
              
              <div className="manager-form-group">
                <label className="manager-form-label">Email Address</label>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <span className="text-gray-700">{user.email}</span>
                  <span className="text-xs text-gray-500 italic">(Cannot be changed)</span>
                </div>
              </div>
              
              <div className="manager-form-group">
                <label className="manager-form-label">Role</label>
                <div className="manager-badge manager-badge-primary inline-block px-6 py-3 text-base">
                  AUCTION MANAGER
                </div>
              </div>
              
              <div className="manager-form-group">
                <label className="manager-form-label">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="manager-form-input"
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit phone number"
                  required
                />
                <small className="text-gray-600 block mt-1 text-sm">10 digits only</small>
              </div>
              
              <button
                type="submit"
                disabled={updating}
                className="manager-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Phone'}
              </button>
            </form>
          </div>

          {/* Change Password Section */}
          <div className="manager-section">
            <div className="manager-section-header">
              <h3 className="manager-section-title text-2xl">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="manager-form-group">
                <label className="manager-form-label">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="manager-form-input"
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              <div className="manager-form-group">
                <label className="manager-form-label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  className="manager-form-input"
                  minLength="8"
                  placeholder="Enter new password"
                  required
                />
                <small className="text-gray-600 block mt-1 text-sm">
                  Must be at least 8 characters, include uppercase, number, special character
                </small>
                {passwordStrength && (
                  <div className={`text-sm mt-2 font-semibold ${passwordStrength.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordStrength}
                  </div>
                )}
              </div>
              
              <div className="manager-form-group">
                <label className="manager-form-label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className="manager-form-input"
                  placeholder="Re-enter new password"
                  required
                />
                {passwordMatch && (
                  <div className={`text-sm mt-2 font-semibold ${passwordMatch.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordMatch}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={updating}
                className="manager-btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}