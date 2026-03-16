// client/src/pages/auctionManager/Requests.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

function RequestCard({ req }) {
  const allImages = req.vehicleImages?.length > 0 ? req.vehicleImages : (req.vehicleImage ? [req.vehicleImage] : ['/images/placeholder-car.jpg']);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
      {/* Image Gallery Section */}
      <div className="relative h-64 bg-gray-100">
        <img 
          src={allImages[activeIndex]} 
          alt={req.vehicleName} 
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image'; }}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm">
            {req.condition || 'Unknown'}
          </span>
        </div>
      </div>
      
      {allImages.length > 1 && (
        <div className="flex gap-2 p-3 bg-gray-50/80 border-b border-gray-100 overflow-x-auto hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {allImages.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-12 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                activeIndex === idx ? 'ring-2 ring-amber-500 scale-105 z-10' : 'opacity-70 hover:opacity-100 ring-1 ring-gray-200'
              }`}
            >
              <img src={img} alt={`${req.vehicleName} thumb`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">{req.vehicleName}</h3>
        
        <div className="grid grid-cols-2 gap-y-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seller</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {req.sellerId?.firstName} {req.sellerId?.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
            <p className="text-sm font-medium text-gray-900 truncate">{req.sellerId?.city || 'N/A'}</p>
          </div>
        </div>

        {/* Documentation Status */}
        {req.vehicleDocumentation && (
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Documentation</p>
            <div className="flex flex-wrap gap-2">
              {req.vehicleDocumentation.registrationNumber && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold rounded-md">Reg Available</span>
              )}
              {req.vehicleDocumentation.vinNumber && (
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-bold rounded-md">VIN Verified</span>
              )}
              {req.vehicleDocumentation.insuranceStatus === 'Valid' && (
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-bold rounded-md">Valid INS</span>
              )}
              {req.vehicleDocumentation.pollutionCertificate === 'Valid' && (
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] uppercase font-bold rounded-md">Valid PUC</span>
              )}
              {req.vehicleDocumentation.accidentHistory && (
                <span className="px-2.5 py-1 bg-red-50 text-red-700 text-[10px] uppercase font-bold rounded-md">Accident Hist.</span>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            to={`/auctionmanager/assign-mechanic/${req._id}`}
            className="w-full inline-flex justify-center items-center px-6 py-3 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-xl transition duration-300 shadow-sm hover:shadow-md"
          >
            Assign Mechanic
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getRequests();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setRequests(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load requests');
        }
      } catch (err) {
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
      <div className="min-h-screen bg-gray-50 pt-12 px-4 font-montserrat">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 pl-4 border-l-4 border-red-500">Vehicle Requests</h2>
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 font-medium">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-4 font-montserrat">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 pl-4 border-l-4 border-amber-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Vehicle Requests</h1>
          <p className="text-gray-600 font-medium">Review new vehicle submissions and assign mechanics for inspection.</p>
        </div>
        
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((req) => (
              <RequestCard key={req._id} req={req} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-500 max-w-md">There are currently no new vehicle requests pending mechanic assignment.</p>
          </div>
        )}
      </div>
    </div>
  );
}