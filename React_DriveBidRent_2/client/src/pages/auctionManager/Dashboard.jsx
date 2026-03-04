// client/src/pages/auctionManager/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionManagerDashboard.css';

export default function Dashboard() {
  const [data, setData] = useState({ pending: [], assigned: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await auctionManagerServices.getDashboard();
        const responseData = res.data || res;

        if (responseData.success) {
          setData(responseData.data || { pending: [], assigned: [], approved: [] });
        } else {
          setError(responseData.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md border border-red-200">
          <p className="text-2xl font-bold text-gray-800 mb-3">Connection Error</p>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="manager-page-header">
          <h1 className="manager-page-title">Auction Manager</h1>
          <p className="manager-page-subtitle">Manage vehicle requests, inspections, and live auctions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
          <div className="manager-stat-card">
            <div className="manager-stat-icon">📋</div>
            <div className="manager-stat-label">Pending Requests</div>
            <div className="manager-stat-value">{data.pending.length}</div>
          </div>
          <div className="manager-stat-card">
            <div className="manager-stat-icon">🔧</div>
            <div className="manager-stat-label">Under Inspection</div>
            <div className="manager-stat-value">{data.assigned.length}</div>
          </div>
          <div className="manager-stat-card">
            <div className="manager-stat-icon">🎯</div>
            <div className="manager-stat-label">Live Auctions</div>
            <div className="manager-stat-value">{data.approved.length}</div>
          </div>
        </div>

        {/* ==================== REQUESTS ==================== */}
        <section className="manager-section animate-fade-in-up mb-12">
          <div className="manager-section-header">
            <h2 className="manager-section-title">Pending Requests</h2>
            {data.pending.length > 0 && (
              <Link to="/auctionmanager/requests" className="manager-btn-secondary px-6 py-2 rounded-lg text-sm">
                View All
              </Link>
            )}
          </div>

          {data.pending.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">📋</div>
              <p className="manager-empty-text">All caught up! No pending vehicle requests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.pending.map((req) => (
                <div key={req._id} className="manager-vehicle-card">
                  <div className="relative overflow-hidden">
                    <img
                      src={req.vehicleImage || '/images/placeholder.jpg'}
                      alt={req.vehicleName}
                      className="manager-vehicle-image"
                    />
                    <span className="manager-badge manager-badge-pending absolute top-4 left-4">
                      PENDING
                    </span>
                  </div>

                  <div className="manager-vehicle-content">
                    <h3 className="manager-vehicle-title">{req.vehicleName}</h3>
                    <div className="manager-vehicle-info">
                      <div className="manager-vehicle-info-item">
                        <span className="manager-vehicle-info-label">Seller:</span>
                        <span className="manager-vehicle-info-value">
                          {req.sellerId?.firstName} {req.sellerId?.lastName}
                        </span>
                      </div>
                      <div className="manager-vehicle-info-item">
                        <span className="manager-vehicle-info-label">Location:</span>
                        <span className="manager-vehicle-info-value">{req.sellerId?.city || 'Not specified'}</span>
                      </div>
                      
                      {/* Documentation Quick View */}
                      {req.vehicleDocumentation && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Documents:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {req.vehicleDocumentation.registrationNumber && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                ✓ RC
                              </span>
                            )}
                            {req.vehicleDocumentation.vinNumber && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                ✓ VIN
                              </span>
                            )}
                            {req.vehicleDocumentation.insuranceStatus === 'Valid' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                ✓ Insurance
                              </span>
                            )}
                            {req.vehicleDocumentation.pollutionCertificate === 'Valid' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                ✓ PUC
                              </span>
                            )}
                            {req.vehicleDocumentation.accidentHistory && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                ⚠ Accident
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/auctionmanager/assign-mechanic/${req._id}`}
                      className="manager-btn-primary w-full text-center block"
                    >
                      Assign Mechanic
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================== PENDING INSPECTIONS ==================== */}
        <section className="manager-section animate-fade-in-up mb-12">
          <div className="manager-section-header">
            <h2 className="manager-section-title">Pending Inspections</h2>
            {data.assigned.length > 0 && (
              <Link to="/auctionmanager/pending" className="manager-btn-secondary px-6 py-2 rounded-lg text-sm">
                View All
              </Link>
            )}
          </div>

          {data.assigned.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🔧</div>
              <p className="manager-empty-text">No vehicles awaiting inspection report</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.assigned.map((car) => {
                const hasReview = !!(car.mechanicReview && (car.mechanicReview.mechanicalCondition || car.mechanicReview.bodyCondition));
                return (
                  <div key={car._id} className="manager-vehicle-card">
                    <div className="relative overflow-hidden">
                      <img
                        src={car.vehicleImage}
                        alt={car.vehicleName}
                        className="manager-vehicle-image"
                      />
                      <span className={`manager-badge absolute top-4 left-4 ${hasReview ? 'manager-badge-success' : 'manager-badge-warning'}`}>
                        {hasReview ? 'REVIEW COMPLETE' : 'AWAITING REPORT'}
                      </span>
                    </div>

                    <div className="manager-vehicle-content">
                      <h3 className="manager-vehicle-title">{car.vehicleName}</h3>
                      <div className="manager-vehicle-info">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName} {car.sellerId?.lastName}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || 'Not specified'}</span>
                        </div>
                        {hasReview && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <strong className="block text-xs text-green-800 font-semibold mb-1">Mechanic's Review:</strong>
                            <div className="text-xs text-green-700 line-clamp-2">
                              {car.mechanicReview?.mechanicalCondition || car.mechanicReview?.bodyCondition || 'Review submitted'}
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/auctionmanager/pending-car-details/${car._id}`}
                        className={`${hasReview ? 'manager-btn-success' : 'manager-btn-primary'} w-full text-center block`}
                      >
                        {hasReview ? 'Review & Approve' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== LIVE AUCTIONS ==================== */}
        <section className="manager-section animate-fade-in-up">
          <div className="manager-section-header">
            <h2 className="manager-section-title">Live Auctions</h2>
            {data.approved.length > 0 && (
              <Link to="/auctionmanager/approved" className="manager-btn-success px-6 py-2 rounded-lg text-sm">
                View All
              </Link>
            )}
          </div>

          {data.approved.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🎯</div>
              <p className="manager-empty-text">No active auctions. Approved vehicles will appear here when auctions go live.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.approved.map((car) => (
                <div key={car._id} className="manager-vehicle-card">
                  <div className="relative overflow-hidden">
                    <img
                      src={car.vehicleImage}
                      alt={car.vehicleName}
                      className="manager-vehicle-image"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span className="manager-badge manager-badge-success absolute top-4 left-4 animate-pulse">
                      🔴 LIVE
                    </span>
                  </div>

                  <div className="manager-vehicle-content">
                    <h3 className="manager-vehicle-title">{car.vehicleName}</h3>

                    <div className="manager-vehicle-info mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Year</p>
                          <p className="text-lg font-bold text-gray-800">{car.year}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1">Mileage</p>
                          <p className="text-lg font-bold text-gray-800">{car.mileage.toLocaleString()} km</p>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center mt-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Starting Bid</p>
                        <p className="text-xl font-bold text-green-600">₹{car.startingBid.toLocaleString()}</p>
                      </div>
                    </div>

                    <Link
                      to={`/auctionmanager/view-bids/${car._id}`}
                      className="manager-btn-success w-full text-center block"
                    >
                      View Live Bids
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}