// client/src/pages/auctionManager/Requests.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionManagerDashboard.css';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      console.log('🔍 [Frontend - Requests] Fetching all vehicle requests...');
      try {
        setLoading(true);
        const res = await auctionManagerServices.getRequests();
        const responseData = res.data || res;
        
        console.log('📦 [Frontend - Requests] API response:', responseData);
        
        if (responseData.success) {
          console.log('✅ [Frontend - Requests] Loaded', responseData.data?.length || 0, 'requests');
          setRequests(responseData.data || []);
        } else {
          console.log('❌ [Frontend - Requests] Failed:', responseData.message);
          setError(responseData.message || 'Failed to load requests');
        }
      } catch (err) {
        console.error('❌ [Frontend - Requests] Error:', err);
        setError(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Vehicle Requests</h2>
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
          <h1 className="manager-page-title">Vehicle Requests</h1>
          <p className="manager-page-subtitle">Review and assign mechanics to vehicle inspection requests</p>
        </div>
        
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="manager-vehicle-card flex-row"
                style={{flexDirection: 'row', height: 'auto'}}
              >
                <div className="w-1/3 min-w-[200px] overflow-hidden">
                  <img src={req.vehicleImage} alt={req.vehicleName} className="manager-vehicle-image h-full" />
                </div>
            
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="manager-vehicle-title text-2xl mb-3">{req.vehicleName}</h3>
                    <div className="manager-vehicle-info space-y-2">
                      <div className="manager-vehicle-info-item">
                        <span className="manager-vehicle-info-label">Condition:</span>
                        <span className="manager-badge manager-badge-warning px-3 py-1 text-xs">
                          {req.condition.charAt(0).toUpperCase() + req.condition.slice(1)}
                        </span>
                      </div>
                      <div className="manager-vehicle-info-item">
                        <span className="manager-vehicle-info-label">Seller:</span>
                        <span className="manager-vehicle-info-value">
                          {req.sellerId.firstName} {req.sellerId.lastName}
                        </span>
                      </div>
                      <div className="manager-vehicle-info-item">
                        <span className="manager-vehicle-info-label">Location:</span>
                        <span className="manager-vehicle-info-value">{req.sellerId.city}</span>
                      </div>
                    </div>
              
                    {/* Documentation Status Indicators */}
                    {req.vehicleDocumentation && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {req.vehicleDocumentation.registrationNumber && (
                          <span className="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-full font-medium">
                            ✓ Reg
                          </span>
                        )}
                        {req.vehicleDocumentation.vinNumber && (
                          <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full font-medium">
                            ✓ VIN
                          </span>
                        )}
                        {req.vehicleDocumentation.insuranceStatus === 'Valid' && (
                          <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full font-medium">
                            ✓ Insured
                          </span>
                        )}
                        {req.vehicleDocumentation.pollutionCertificate === 'Valid' && (
                          <span className="px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs rounded-full font-medium">
                            ✓ PUC
                          </span>
                        )}
                        {req.vehicleDocumentation.accidentHistory && (
                          <span className="px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs rounded-full font-medium">
                            ⚠ Accident
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Link
                    to={`/auctionmanager/assign-mechanic/${req._id}`}
                    className="manager-btn-primary text-center block mt-4"
                  >
                    Assign Mechanic
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="manager-empty-state">
            <div className="manager-empty-icon">📋</div>
            <p className="manager-empty-text">No vehicle requests available</p>
          </div>
        )}
      </div>
    </div>
  );
}