import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminServices from '../../services/admin.services';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AuctionManagers = () => {
  const [data, setData] = useState({
    disapprovedManagers: [],
    approvedManagers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [activeTab, setActiveTab] = useState('disapproved');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAuctionManagers();
  }, []);

  const fetchAuctionManagers = async () => {
    try {
      const res = await adminServices.getAuctionManagers();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
        toast.error(res.message);
      }
    } catch (err) {
      setError('Failed to load auction managers');
      toast.error('Failed to load auction managers');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await adminServices.approveAuctionManager(id);
      if (res.success) {
        toast.success('Auction Manager approved successfully');
        await fetchAuctionManagers();
        setSelectedManager(null);
      }
    } catch (err) {
      console.error('Error approving:', err);
      toast.error('Failed to approve auction manager');
    }
  };

  const handleDelete = async (manager) => {
    const carCount = manager.auctionCars?.length || 0;

    if (carCount > 0) {
      toast.error(
        `Cannot delete this manager — ${carCount} car${carCount === 1 ? '' : 's'} ${carCount === 1 ? 'is' : 'are'} still assigned.`
      );
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to delete this Auction Manager? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const res = await adminServices.deleteAuctionManager(manager._id);
      if (res.success) {
        toast.success('Auction Manager deleted successfully');
        await fetchAuctionManagers();
        setSelectedManager(null);
      }
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Failed to delete auction manager');
    }
  };

  const openModal = (manager) => {
    setSelectedManager(manager);
  };

  const closeModal = () => {
    setSelectedManager(null);
  };

  const filterManagers = (managers) => {
    if (!searchTerm) return managers;
    const term = searchTerm.toLowerCase();
    return managers.filter((manager) => {
      const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
      const email = manager.email.toLowerCase();
      const city = manager.city?.toLowerCase() || '';
      return fullName.includes(term) || email.includes(term) || city.includes(term);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <LoadingSpinner />;

  const activeManagers = activeTab === 'disapproved' ? data.disapprovedManagers : data.approvedManagers;
  const filteredManagers = filterManagers(activeManagers);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Auction Managers</h1>
              <p className="mt-1 text-gray-600">Review and manage auction manager registrations</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold text-gray-900">
                  {data.disapprovedManagers.length + data.approvedManagers.length}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Pending Approval</div>
                  <div className="text-3xl font-bold text-amber-700 mt-1">
                    {data.disapprovedManagers.length}
                  </div>
                </div>
                <div className="text-amber-500 text-3xl">
                  <i className="fas fa-hourglass-half"></i>
                </div>
              </div>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-600">Approved</div>
                  <div className="text-3xl font-bold text-green-700 mt-1">
                    {data.approvedManagers.length}
                  </div>
                </div>
                <div className="text-green-500 text-3xl">
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('disapproved')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'disapproved'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({data.disapprovedManagers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === 'approved'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({data.approvedManagers.length})
              </button>
            </div>
            <div className="relative flex-1 max-w-md">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by name, email or city..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <i className="fas fa-exclamation-circle text-xl"></i>
            {error}
          </div>
        )}

        {/* Table / Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredManagers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      City
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredManagers.map((manager) => (
                    <tr key={manager._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {manager.firstName} {manager.lastName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          ID: {manager._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{manager.email}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{manager.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {manager.city || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(manager.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            manager.approved
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {manager.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => openModal(manager)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-md text-sm transition"
                          >
                            View
                          </button>

                          {!manager.approved && (
                            <button
                              onClick={() => handleApprove(manager._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-md text-sm transition"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(manager)}
                            disabled={manager.auctionCars?.length > 0}
                            className={`px-3.5 py-1.5 rounded-md text-sm transition ${
                              manager.auctionCars?.length > 0
                                ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <i className="fas fa-users-slash text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No auction managers found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search'
                  : `No ${activeTab} managers at this time`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedManager && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Header */}
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedManager.firstName} {selectedManager.lastName}
              </h2>
              <div className="mt-2">
                <span
                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedManager.approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedManager.approved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Email</div>
                  <div className="mt-1 text-gray-900">{selectedManager.email}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Phone</div>
                  <div className="mt-1 text-gray-900">{selectedManager.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">City</div>
                  <div className="mt-1 text-gray-900">{selectedManager.city || '—'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Date of Birth</div>
                  <div className="mt-1 text-gray-900">
                    {formatDate(selectedManager.dateOfBirth)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Registered On</div>
                  <div className="mt-1 text-gray-900">
                    {formatDate(selectedManager.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase">Auction Cars</div>
                  <div className="mt-1 text-gray-900">
                    {selectedManager.auctionCars?.length || 0} cars assigned
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t flex gap-4">
              {!selectedManager.approved && (
                <button
                  onClick={() => handleApprove(selectedManager._id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <i className="fas fa-check-circle"></i>
                  Approve Manager
                </button>
              )}

              <button
                onClick={() => handleDelete(selectedManager)}
                disabled={selectedManager.auctionCars?.length > 0}
                className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  selectedManager.auctionCars?.length > 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <i className="fas fa-trash-alt"></i>
                Delete Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionManagers;