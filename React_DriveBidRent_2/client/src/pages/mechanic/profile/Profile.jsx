// client/src/pages/mechanic/profile/Profile.jsx
import { useEffect, useState } from 'react';
import { changePassword } from '../../../services/mechanic.services';
import useProfile from '../../../hooks/useProfile';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Profile() {
  const { profile: user, loading } = useProfile();
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');

  const handleNewPasswordChange = (value) => {
    setForm({ ...form, newPassword: value });
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
    setForm({ ...form, confirmPassword: value });
    if (!value) {
      setPasswordMatch('');
    } else if (form.newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleOldPasswordChange = (value) => {
    setForm({ ...form, oldPassword: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword) {
      setMsg('Please enter your current password');
      setMsgType('error');
      return;
    }

    if (form.oldPassword === form.newPassword) {
      setMsg('New password cannot be the same as current password');
      setMsgType('error');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMsg("Passwords don't match");
      setMsgType('error');
      return;
    }

    if (form.newPassword.length < 8) {
      setMsg('New password must be 8+ characters');
      setMsgType('error');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(form.newPassword)) {
      setMsg('Password must include uppercase letter, number, and special character');
      setMsgType('error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await changePassword(form);
      setMsg(res.data.message || 'Password updated successfully');
      setMsgType('success');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordStrength('');
      setPasswordMatch('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
      setMsgType('error');
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-orange-600 mb-6">My Profile</h2>

        {msg && (
          <div className={`text-center p-3 rounded-lg mb-4 text-sm ${msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-orange-600 pb-2">Personal Information</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone || '—'}</p>
              <p><strong>Shop:</strong> {user?.shopName || '—'}</p>
              <p><strong>Experience:</strong> {user?.experienceYears} years</p>
              <p><strong>Services:</strong> {user?.repairCars && user?.repairBikes ? 'Cars & Bikes' : user?.repairCars ? 'Cars' : 'Bikes'}</p>
              <p><strong>Status:</strong> <span className={`font-bold ${user?.approved_status === 'Yes' ? 'text-green-600' : 'text-amber-600'}`}>
                {user?.approved_status === 'Yes' ? 'Approved' : 'Pending Approval'}
              </span></p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-orange-600 pb-2">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="password" placeholder="Current Password" required value={form.oldPassword} onChange={e => handleOldPasswordChange(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
              <div>
                <input type="password" placeholder="New Password" required value={form.newPassword} onChange={e => handleNewPasswordChange(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
                {passwordStrength && (
                  <div className={`text-sm mt-2 ${passwordStrength.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordStrength}
                  </div>
                )}
              </div>
              <div>
                <input type="password" placeholder="Confirm New Password" required value={form.confirmPassword} onChange={e => handleConfirmPasswordChange(e.target.value)}
                  className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
                {passwordMatch && (
                  <div className={`text-sm mt-2 ${passwordMatch.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordMatch}
                  </div>
                )}
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 text-sm rounded-lg transition disabled:opacity-60">
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}