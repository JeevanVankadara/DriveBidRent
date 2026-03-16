// client/src/pages/auctionManager/PendingCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PendingCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPending();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setCars(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load pending cars');
        }
      } catch (err) {
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
      <div className="min-h-screen bg-gray-50 pt-12 px-4 font-montserrat">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 pl-4 border-l-4 border-red-500">Pending Cars</h2>
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
        <div className="mb-10 pl-4 border-l-4 border-amber-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Pending Inspections</h1>
          <p className="text-gray-600 font-medium">Monitor vehicles awaiting mechanic inspection and approval.</p>
        </div>
        
        {cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {cars.map((car) => {
              const hasReview = !!(car.mechanicReview && (car.mechanicReview.mechanicalCondition || car.mechanicReview.bodyCondition));
              return (
                <div key={car._id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-full group">
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm ${hasReview ? 'bg-green-500/90' : 'bg-amber-500/90'}`}>
                        {hasReview ? 'REVIEWED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-4 group-hover:text-amber-600 transition-colors">{car.vehicleName}</h3>
                    
                    <div className="grid grid-cols-2 gap-y-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Seller</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {car.sellerId?.firstName} {car.sellerId?.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{car.sellerId?.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Condition</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{car.condition}</p>
                      </div>
                    </div>

                    {hasReview ? (
                      <div className="mt-2 mb-6 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          Mechanic's Review
                        </p>
                        <p className="text-sm text-green-700 line-clamp-2 font-medium">
                          {car.mechanicReview?.mechanicalCondition || car.mechanicReview?.bodyCondition || 'Review submitted successfully.'}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 mb-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center justify-center h-24">
                        <p className="text-sm text-amber-600 font-medium flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          Waiting for Inspection
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <Link
                        to={`/auctionmanager/pending-car-details/${car._id}`}
                        className={`w-full inline-flex justify-center items-center px-6 py-3 font-bold rounded-xl transition duration-300 shadow-sm hover:shadow-md ${
                          hasReview 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-900 hover:bg-amber-500 text-white'
                        }`}
                      >
                        {hasReview ? 'Review & Approve' : 'View Details'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Pending Cars</h3>
            <p className="text-gray-500 max-w-md">There are currently no vehicles waiting for your review.</p>
          </div>
        )}
      </div>
    </div>
  );
}