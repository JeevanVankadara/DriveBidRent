// client/src/pages/auctionManager/Requests.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getRequests();
        // Handle axios response structure
        const responseData = res.data || res;
        
        if (responseData.success) {
          setRequests(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load requests');
        }
      } catch (err) {
        console.error('Requests fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Auction Requests</h2>
        <div className="text-center py-10 text-xl text-gray-600">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Auction Requests</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Auction Requests</h2>
      
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <img 
                src={req.vehicleImage} 
                alt={req.vehicleName} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Vehicle+Image';
                }}
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{req.vehicleName}</h3>
                
                <div className="space-y-1 mb-4">
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Year:</span> {req.year || 'N/A'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Seller:</span> {req.sellerId?.firstName || ''} {req.sellerId?.lastName || ''}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Location:</span> {req.sellerId?.city || 'N/A'}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Status:</span> 
                    <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      {req.status || 'Pending'}
                    </span>
                  </p>
                </div>

                <Link
                  to={`/auction-manager/assign-mechanic/${req._id}`}
                  className="block w-full text-center bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  More Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-16 rounded-xl shadow-lg">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All auction requests have been processed</p>
        </div>
      )}
    </div>
  );
}