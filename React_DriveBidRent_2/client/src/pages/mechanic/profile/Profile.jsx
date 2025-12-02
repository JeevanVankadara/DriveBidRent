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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return alert("Passwords don't match");
    if (form.newPassword.length < 8) return alert("New password must be 8+ chars");

    setSubmitting(true);
    try {
      const res = await changePassword(form);
      setMsg(res.data.message || "Password updated");
      setMsgType('success');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg(err.response?.data?.message || "Update failed");
      setMsgType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-bold text-center text-orange-600 mb-12">My Profile</h2>

        {msg && (
          <div className={`text-center p-5 rounded-xl mb-8 ${msgType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {msg}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-orange-600 pb-3">Personal Information</h3>
            <div className="space-y-5 text-lg">
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

          <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-orange-600 pb-3">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="password" placeholder="Current Password" required value={form.oldPassword} onChange={e => setForm({...form, oldPassword: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
              <input type="password" placeholder="New Password" required value={form.newPassword} onChange={e => setForm({...form, newPassword: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
              <input type="password" placeholder="Confirm New Password" required value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                className="w-full p-4 border border-gray-300 rounded-lg focus:border-orange-600 outline-none" />
              <button type="submit" disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-60">
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}