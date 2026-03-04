// client/src/pages/auctionManager/PendingCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionManagerDashboard.css';

export default function PendingCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      console.log('🔍 [Frontend - PendingCars] Fetching pending inspections assigned to this auction manager...');
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPending();
        const responseData = res.data || res;
        
        console.log('📦 [Frontend - PendingCars] API response:', responseData);
        
        if (responseData.success) {
          console.log('✅ [Frontend - PendingCars] Loaded', responseData.data?.length || 0, 'pending cars assigned to me');
          setCars(responseData.data || []);
        } else {
          console.log('❌ [Frontend - PendingCars] Failed:', responseData.message);
          setError(responseData.message || 'Failed to load pending cars');
        }
      } catch (err) {
        console.error('❌ [Frontend - PendingCars] Error:', err);
        setError(err.response?.data?.message || 'Failed to load pending cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="manager-page-header">
          <h1 className="manager-page-title">Pending Inspections</h1>
          <p className="manager-page-subtitle">Monitor vehicles awaiting mechanic inspection and approval</p>
        </div>
        
        {cars.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cars.map((car) => {
              const hasReview = !!(car.mechanicReview && (car.mechanicReview.mechanicalCondition || car.mechanicReview.bodyCondition));
              return (
                <div
                  key={car._id}
                  className="manager-vehicle-card flex-row"
                  style={{flexDirection: 'row', height: 'auto'}}
                >
                  <div className="w-1/3 min-w-[200px] overflow-hidden relative">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                    <span className={`manager-badge absolute top-3 left-3 text-xs ${hasReview ? 'manager-badge-success' : 'manager-badge-warning'}`}>
                      {hasReview ? '✓ REVIEWED' : '⏳ PENDING'}
                    </span>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="manager-vehicle-title text-2xl mb-3">{car.vehicleName}</h3>
                      <div className="manager-vehicle-info space-y-2">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-badge manager-badge-warning px-3 py-1 text-xs">
                            {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId.firstName} {car.sellerId.lastName}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId.city}</span>
                        </div>
                      </div>
                      {hasReview && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs font-semibold text-green-800 mb-1">Mechanic's Review:</p>
                          <p className="text-xs text-green-700 line-clamp-2">
                            {car.mechanicReview?.mechanicalCondition || car.mechanicReview?.bodyCondition || 'Review submitted'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/auctionmanager/pending-car-details/${car._id}`}
                      className={`${hasReview ? 'manager-btn-success' : 'manager-btn-primary'} text-center block mt-4`}
                    >
                      {hasReview ? 'Review & Approve' : 'View Details'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="manager-empty-state">
            <div className="manager-empty-icon">🔧</div>
            <p className="manager-empty-text">No pending cars available</p>
          </div>
        )}
      </div>
    </div>
  );
}