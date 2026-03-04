import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useProfile } from '../../hooks/useBuyerHooks';
import LoadingSpinner from '../components/LoadingSpinner';
import './BuyerDashboard.css';

export default function Profile() {
  const { profile, loading, updateProfile, changePassword } = useProfile();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    doorNo: '',
    street: '',
    city: '',
    state: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState('Password must be at least 8 characters, include uppercase, number, and special character');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        doorNo: profile.doorNo || '',
        street: profile.street || '',
        city: profile.city || '',
        state: profile.state || ''
      });
    }
  }, [profile]);



  const handleProfileChange = (field, value) => {
    if (field === 'firstName') {
      const hasNumbers = /\d/.test(value);
      if (value && hasNumbers) {
        setFirstNameError('First name cannot contain numbers');
      } else {
        setFirstNameError('');
      }
    }
    if (field === 'lastName') {
      const hasNumbers = /\d/.test(value);
      if (value && hasNumbers) {
        setLastNameError('Last name cannot contain numbers');
      } else {
        setLastNameError('');
      }
    }
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));

    if (field === 'newPassword') {
      const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!value) setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
      else if (!strongRegex.test(value)) setPasswordStrength('❌ Weak password: must include uppercase letter, number, and special character');
      else setPasswordStrength('✅ Strong password');
    }

    if (field === 'confirmPassword') {
      if (!value) setConfirmMessage('');
      else if (passwordForm.newPassword !== value) setConfirmMessage('❌ Passwords do not match');
      else setConfirmMessage('✅ Passwords match');
    }
  };

  const handlePhoneInput = (value) => {
    const numbersOnly = value.replace(/\D/g, '');
    const truncated = numbersOnly.slice(0, 10);
    handleProfileChange('phone', truncated);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      toast.error('New password cannot be the same as current password');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(passwordForm.newPassword)) {
      toast.error('Password must be at least 8 characters and include an uppercase letter, number, and special character');
      return;
    }

    try {
      const result = await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword });
      if (result && result.success) {
        toast.success(result.message || 'Password changed successfully!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
        setConfirmMessage('');
      } else {
        toast.error(result?.message || 'Failed to change password.');
      }
    } catch (error) {
      toast.error(error?.message || 'An error occurred. Please try again.');
      console.error('Password change error:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (lastNameError || firstNameError) {
      toast.error('Names cannot contain numbers');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (profileForm.phone && !phoneRegex.test(profileForm.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const result = await updateProfile(profileForm);
      if (result && result.success) {
        toast.success(result.message || 'Profile updated successfully!');
      } else {
        toast.error(result?.message || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error(error?.message || 'An error occurred. Please try again.');
      console.error('Profile update error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="relative min-h-screen py-12 px-4" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="buyer-page-header">
          <h1 className="buyer-page-title">Profile Settings</h1>
          <p className="buyer-page-subtitle">Manage your account details and security</p>
        </div>

        {/* Blocked User Warning */}
        {profile?.isBlocked && (
          <div className="buyer-section animate-fade-in-up" style={{
            backgroundColor: '#fee2e2',
            border: '2px solid #dc2626',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              ⚠️ Your account has been blocked
            </p>
            <p style={{
              color: '#991b1b',
              fontSize: '1rem',
              marginTop: '0.5rem',
              marginBottom: 0
            }}>
              You can view your data but cannot place bids, book rentals, or update your profile. Please contact admin for assistance.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Details */}
          <div className="buyer-section animate-fade-in-up">
            <div className="buyer-section-header">
              <h3 className="buyer-section-title">Personal Details</h3>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="buyer-form-group">
                <label htmlFor="firstName" className="buyer-form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  className="buyer-form-input"
                  value={profileForm.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                />
                {firstNameError && <div className="text-red-600 text-sm mt-2">❌ {firstNameError}</div>}
              </div>

              <div className="buyer-form-group">
                <label htmlFor="lastName" className="buyer-form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  className="buyer-form-input"
                  value={profileForm.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                />
                {lastNameError && <div className="text-red-600 text-sm mt-2">❌ {lastNameError}</div>}
              </div>

              <div className="buyer-form-group">
                <label htmlFor="phone" className="buyer-form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="buyer-form-input"
                  value={profileForm.phone}
                  onChange={(e) => handlePhoneInput(e.target.value)}
                />
                <div className="text-sm text-gray-600 mt-2">Must be 10 digits</div>
              </div>

              <div className="buyer-form-group">
                <label htmlFor="email" className="buyer-form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="buyer-form-input"
                  value={profileForm.email}
                  readOnly
                />
                <div className="text-sm text-gray-600 mt-2">Email cannot be changed</div>
              </div>

              <div className="buyer-form-group">
                <label htmlFor="doorNo" className="buyer-form-label">Door/Flat No</label>
                <input
                  type="text"
                  id="doorNo"
                  className="buyer-form-input"
                  value={profileForm.doorNo}
                  onChange={(e) => handleProfileChange('doorNo', e.target.value)}
                />
              </div>

              <div className="buyer-form-group">
                <label htmlFor="street" className="buyer-form-label">Street/Area</label>
                <input
                  type="text"
                  id="street"
                  className="buyer-form-input"
                  value={profileForm.street}
                  onChange={(e) => handleProfileChange('street', e.target.value)}
                />
              </div>

              <div className="buyer-form-group">
                <label htmlFor="city" className="buyer-form-label">City</label>
                <input
                  type="text"
                  id="city"
                  className="buyer-form-input"
                  value={profileForm.city}
                  onChange={(e) => handleProfileChange('city', e.target.value)}
                />
              </div>

              <div className="buyer-form-group">
                <label htmlFor="state" className="buyer-form-label">State</label>
                <input
                  type="text"
                  id="state"
                  className="buyer-form-input"
                  value={profileForm.state}
                  onChange={(e) => handleProfileChange('state', e.target.value)}
                />
              </div>

              <button type="submit" className="buyer-btn-primary w-full">Save Changes</button>
            </form>
          </div>

          {/* Change Password */}
          <div className="buyer-section animate-fade-in-up">
            <div className="buyer-section-header">
              <h3 className="buyer-section-title">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="buyer-form-group">
                <label htmlFor="old-password" className="buyer-form-label">Current Password</label>
                <input
                  type="password"
                  id="old-password"
                  className="buyer-form-input"
                  value={passwordForm.oldPassword}
                  onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                  required
                />
              </div>

              <div className="buyer-form-group">
                <label htmlFor="new-password" className="buyer-form-label">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  className="buyer-form-input"
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  required
                />
                <div className={`text-sm mt-2 font-semibold ${passwordStrength.includes('✅') ? 'text-green-600' : passwordStrength.includes('❌') ? 'text-red-600' : 'text-gray-600'}`}>
                  {passwordStrength}
                </div>
              </div>

              <div className="buyer-form-group">
                <label htmlFor="confirm-password" className="buyer-form-label">Confirm New Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  className="buyer-form-input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  required
                />
                <div className={`text-sm mt-2 font-semibold ${confirmMessage.includes('✅') ? 'text-green-600' : confirmMessage.includes('❌') ? 'text-red-600' : ''}`}>
                  {confirmMessage}
                </div>
              </div>

              <button type="submit" className="buyer-btn-primary w-full">Change Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}