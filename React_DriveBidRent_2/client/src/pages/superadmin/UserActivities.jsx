// client/src/pages/superadmin/UserActivities.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.util";
import LoadingSpinner from "../components/LoadingSpinner";
import superadminServices from "../../services/superadmin.services";

const UserActivities = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState('all');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();

  // Create Admin modal state
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '', phone: '' });
  const [adminFormErrors, setAdminFormErrors] = useState({});
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // Validation helpers
  const validateAdminForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminForm.email.trim()) errors.email = 'Email is required.';
    else if (!emailRegex.test(adminForm.email)) errors.email = 'Invalid email format.';
    if (!adminForm.password) errors.password = 'Password is required.';
    else if (adminForm.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (!adminForm.phone.trim()) errors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(adminForm.phone)) errors.phone = 'Phone number must be exactly 10 digits.';
    return errors;
  };

  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (adminFormErrors[name]) {
      setAdminFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateAdminSubmit = async (e) => {
    e.preventDefault();
    const errors = validateAdminForm();
    if (Object.keys(errors).length > 0) {
      setAdminFormErrors(errors);
      return;
    }
    setAdminSubmitting(true);
    try {
      const res = await superadminServices.createAdmin(adminForm);
      showToast(res.message || 'Admin created successfully!', 'success');
      setShowCreateAdmin(false);
      setAdminForm({ email: '', password: '', phone: '' });
      setAdminFormErrors({});
      // Refresh users list
      fetchUserActivities();
    } catch (err) {
      showToast(err.message || 'Failed to create admin.', 'error');
    } finally {
      setAdminSubmitting(false);
    }
  };

  const closeCreateAdminModal = () => {
    setShowCreateAdmin(false);
    setAdminForm({ email: '', password: '', phone: '' });
    setAdminFormErrors({});
  };

  useEffect(() => {
    fetchUserActivities();
  }, [userType, currentPage]);

  const fetchUserActivities = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/superadmin/user-activities?userType=${userType}&page=${currentPage}&limit=20`);
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Failed to load user activities");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const res = await axiosInstance.get(`/superadmin/user-details/${userId}`);
      if (res.data.success) {
        setUserDetails(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const getUserTypeColor = (type) => {
    const colors = {
      buyer: 'bg-blue-100 text-blue-800',
      seller: 'bg-green-100 text-green-800',
      mechanic: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800',
      driver: 'bg-orange-100 text-orange-800',
      superadmin: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen py-8 relative" style={{ zIndex: 1 }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm flex items-center gap-3 animate-fade-in-up transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
          style={{ minWidth: 280, maxWidth: 420 }}
        >
          <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-white hover:text-gray-200 text-xl leading-none">&times;</button>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6">
        <div className="premium-page-header animate-fade-in-up flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="premium-page-title">User Activities</h1>
            <p className="premium-page-subtitle">Monitor what each user is doing on the platform</p>
          </div>
          <button
            id="create-admin-btn"
            onClick={() => setShowCreateAdmin(true)}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 self-start md:self-auto"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <span className="text-lg">+</span> Create Admin
          </button>
        </div>

        {/* Filter */}
        <div className="premium-chart-container mb-6 flex items-center gap-4 py-3">
          <label className="font-bold text-gray-700">Filter by User Type:</label>
          <select 
            value={userType} 
            onChange={(e) => { setUserType(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Users</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="mechanic">Mechanics</option>
            <option value="driver">Drivers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {users.map((user) => (
            <div 
              key={user._id} 
              className="premium-stat-card animate-fade-in-up cursor-pointer hover-lift"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserTypeColor(user.userType)}`}>
                  {user.userType.toUpperCase()}
                </span>
              </div>

              {/* Activity Data */}
              <div className="space-y-2 text-sm">
                {user.userType === 'buyer' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Bids:</span>
                      <span className="font-bold text-orange-600">{user.activityData.bidsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchases:</span>
                      <span className="font-bold text-green-600">{user.activityData.purchasesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rentals:</span>
                      <span className="font-bold text-blue-600">{user.activityData.rentalsCount}</span>
                    </div>
                  </>
                )}
                {user.userType === 'seller' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auctions:</span>
                      <span className="font-bold text-orange-600">{user.activityData.auctionsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rentals:</span>
                      <span className="font-bold text-blue-600">{user.activityData.rentalsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue:</span>
                      <span className="font-bold text-green-600">₹{user.activityData.totalRevenue.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {user.userType === 'mechanic' && user.activityData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned Tasks:</span>
                      <span className="font-bold text-orange-600">{user.activityData.assignedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-bold ${user.activityData.approved ? 'text-green-600' : 'text-red-600'}`}>
                        {user.activityData.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-semibold text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {user.isBlocked && (
                  <div className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded text-center font-semibold">
                    ⚠️ BLOCKED
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700"
            >
              Next
            </button>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-orange-600 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedUser.firstName} {selectedUser.lastName}</h2>
                    <p className="text-orange-100 mt-1">{selectedUser.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-white text-orange-800`}>
                      {selectedUser.userType.toUpperCase()}
                    </span>
                  </div>
                  <button onClick={closeModal} className="text-2xl hover:bg-orange-700 rounded-full w-10 h-10 flex items-center justify-center">
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {detailsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                ) : userDetails ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">📋 Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold">{userDetails.user.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Joined Date</p>
                          <p className="font-semibold">{new Date(userDetails.user.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold">{userDetails.user.city}, {userDetails.user.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className={`font-semibold ${userDetails.user.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                            {userDetails.user.isBlocked ? 'Blocked' : 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Details based on user type */}
                    {userDetails.user.userType === 'buyer' && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">🛒 Buyer Activity</h3>
                        
                        {userDetails.detailedActivity.bids && userDetails.detailedActivity.bids.length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-blue-800 mb-2">Recent Bids ({userDetails.detailedActivity.bids.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.bids.slice(0, 5).map((bid) => (
                                <div key={bid._id} className="bg-white p-3 rounded flex justify-between items-center">
                                  <span className="text-sm">{bid.auctionId?.vehicleName || 'Unknown Vehicle'}</span>
                                  <span className="font-bold text-blue-600">₹{bid.bidAmount?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.purchases && userDetails.detailedActivity.purchases.length > 0 && (
                          <div className="bg-green-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-green-800 mb-2">Purchases ({userDetails.detailedActivity.purchases.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.purchases.slice(0, 5).map((purchase) => (
                                <div key={purchase._id} className="bg-white p-3 rounded flex justify-between items-center">
                                  <span className="text-sm">{purchase.vehicleName}</span>
                                  <span className="font-bold text-green-600">₹{purchase.purchasePrice?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.rentals && userDetails.detailedActivity.rentals.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl">
                            <h4 className="font-bold text-orange-800 mb-2">Rentals ({userDetails.detailedActivity.rentals.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                                <div key={rental._id} className="bg-white p-3 rounded">
                                  <p className="text-sm font-semibold">{rental.vehicleName || 'Unknown Vehicle'}</p>
                                  <p className="text-xs text-gray-600">Status: {rental.status || 'unavailable'}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">₹{rental.costPerDay}/day</span>
                                    {rental.driverAvailable && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Driver Available</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {userDetails.user.userType === 'seller' && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Seller Activity</h3>
                        
                        {userDetails.detailedActivity.auctions && userDetails.detailedActivity.auctions.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl mb-4">
                            <h4 className="font-bold text-orange-800 mb-2">Auctions ({userDetails.detailedActivity.auctions.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.auctions.slice(0, 5).map((auction) => (
                                <div key={auction._id} className="bg-white p-3 rounded">
                                  <p className="font-semibold">{auction.vehicleName}</p>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Status: {auction.status}</span>
                                    <span className="font-bold text-orange-600">₹{auction.currentPrice?.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {userDetails.detailedActivity.rentals && userDetails.detailedActivity.rentals.length > 0 && (
                          <div className="bg-orange-50 p-4 rounded-xl">
                            <h4 className="font-bold text-orange-800 mb-2">Rental Listings ({userDetails.detailedActivity.rentals.length})</h4>
                            <div className="space-y-2">
                              {userDetails.detailedActivity.rentals.slice(0, 5).map((rental) => (
                                <div key={rental._id} className="bg-white p-3 rounded">
                                  <p className="font-semibold">{rental.vehicleName}</p>
                                  <div className="flex justify-between text-sm mt-1">
                                    <span className="text-gray-600">Status: {rental.status}</span>
                                    <span className="font-bold text-orange-600">₹{rental.costPerDay?.toLocaleString()}/day</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No details available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeCreateAdminModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-orange-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Create Admin</h2>
                    <p className="text-orange-100 text-sm mt-1">Add a new admin to the platform</p>
                  </div>
                  <button onClick={closeCreateAdminModal} className="text-2xl hover:bg-orange-700 rounded-full w-10 h-10 flex items-center justify-center transition-colors">
                    &times;
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAdminSubmit} className="p-6 space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    value={adminForm.email}
                    onChange={handleAdminFormChange}
                    placeholder="admin@example.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      adminFormErrors.email
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                  {adminFormErrors.email && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{adminFormErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={adminForm.password}
                      onChange={handleAdminFormChange}
                      placeholder="Minimum 8 characters"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all pr-12 ${
                        adminFormErrors.password
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-gray-300 focus:ring-orange-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {adminFormErrors.password && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{adminFormErrors.password}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    id="admin-phone"
                    type="text"
                    name="phone"
                    value={adminForm.phone}
                    onChange={handleAdminFormChange}
                    placeholder="10 digit number"
                    maxLength={10}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      adminFormErrors.phone
                        ? 'border-red-400 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                  {adminFormErrors.phone && (
                    <p className="text-red-500 text-xs mt-1 font-medium">{adminFormErrors.phone}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateAdminModal}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    id="submit-create-admin"
                    type="submit"
                    disabled={adminSubmitting}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {adminSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Creating...
                      </span>
                    ) : (
                      'Create Admin'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserActivities;
