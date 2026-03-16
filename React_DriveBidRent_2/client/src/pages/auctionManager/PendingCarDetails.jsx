// client/src/pages/auctionManager/PendingCarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function PendingCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      console.log('🔍 [Frontend - PendingCarDetails] Fetching car details for:', id);
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPendingCarDetails(id);
        const data = res.data || res;

        console.log('📦 [Frontend - PendingCarDetails] API response:', data);

        if (data.success) {
          console.log('✅ [Frontend - PendingCarDetails] Car details loaded:', data.data?.vehicleName);
          setCar(data.data);
          setStatus(data.data.status || 'pending');
        } else {
          console.log('❌ [Frontend - PendingCarDetails] Failed:', data.message);
          setError(data.message || 'Failed to load details');
        }
      } catch (err) {
        console.error('❌ [Frontend - PendingCarDetails] Error:', err);
        setError(err.response?.data?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const updateStatus = async (newStatus) => {
    console.log('🔄 [Frontend - PendingCarDetails] Updating status to:', newStatus, 'for car:', id);
    
    if (newStatus === 'approved' && (!car.mechanicReview?.mechanicalCondition || !car.mechanicReview?.bodyCondition)) {
      console.log('❌ [Frontend - PendingCarDetails] Cannot approve without complete review');
      alert('Cannot approve without complete mechanic review');
      return;
    }
    if (!confirm(`Confirm: ${newStatus.toUpperCase()} this vehicle?`)) return;

    try {
      const res = await auctionManagerServices.updateStatus(id, newStatus);
      console.log('📦 [Frontend - PendingCarDetails] Update status response:', res);
      
      if (res.data.success) {
        console.log('✅ [Frontend - PendingCarDetails] Status updated to:', newStatus);
        setStatus(newStatus);
        alert(`Vehicle ${newStatus} successfully!`);
          if (newStatus === 'approved') {
            console.log('➡️ [Frontend - PendingCarDetails] Redirecting to Approved Cars page');
            // redirect to Approved Cars page after approval
            navigate('/auctionmanager/approved');
          }
      }
    } catch (err) {
      console.error('❌ [Frontend - PendingCarDetails] Error updating status:', err);
      alert('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-orange-600">Loading Vehicle Details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pt-20">
        <div className="max-w-4xl mx-auto text-center py-16 bg-white rounded-3xl shadow-xl">
          <p className="text-3xl font-bold text-red-600">Error</p>
          <p className="text-xl text-gray-700 mt-4">{error || 'Vehicle not found'}</p>
        </div>
      </div>
    );
  }

  const hasFullReview = car.mechanicReview?.mechanicalCondition && car.mechanicReview?.bodyCondition;
  const allImages = (() => {
    const imgs = [];
    if (car.mainImage) imgs.push(car.mainImage);
    else if (car.vehicleImage) imgs.push(car.vehicleImage);
    if (car.additionalImages?.length > 0) imgs.push(...car.additionalImages);
    else if (car.vehicleImages?.length > 0) {
      const additional = car.vehicleImages.filter(i => i !== car.vehicleImage && i !== car.mainImage);
      imgs.push(...additional);
    }
    return imgs.length > 0 ? imgs : ['/images/placeholder-car.jpg'];
  })();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4 font-montserrat">
      <div className="max-w-7xl mx-auto">
      
        {/* Page Header */}
        <div className="mb-8 pl-4 border-l-4 border-amber-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Pending Car Details</h1>
          <p className="text-gray-600">Review vehicle documentation and mechanic inspection report to approve or reject.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Vehicle Info & Documentation */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Image Gallery & Main Specs section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-80 md:h-[450px] bg-gray-100 relative">
                <img
                  src={allImages[activeImageIndex]}
                  alt={car.vehicleName}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-5 py-2 backdrop-blur-md text-white text-sm font-semibold rounded-full shadow-lg ${status === 'approved' ? 'bg-green-600/90' : status === 'rejected' ? 'bg-red-600/90' : 'bg-amber-600/90'}`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                   <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">{car.vehicleName}</h2>
                   {car.carType && (
                     <span className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold uppercase tracking-wider">{car.carType}</span>
                   )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-28 h-20 md:w-36 md:h-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                          activeImageIndex === idx ? 'ring-4 ring-amber-500 scale-105 opacity-100 z-10' : 'opacity-60 hover:opacity-100 ring-1 ring-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${car.vehicleName} preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Year</p>
                    <p className="font-bold text-xl text-gray-900">{car.year || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Mileage</p>
                    <p className="font-bold text-xl text-gray-900">{car.mileage ? `${car.mileage.toLocaleString()} km` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fuel</p>
                    <p className="font-bold text-xl text-gray-900 capitalize">{car.fuelType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Transmission</p>
                    <p className="font-bold text-xl text-gray-900 capitalize">{car.transmission || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            {car.vehicleDocumentation && (
              <div className="space-y-6 pb-6 mt-12">
                <h3 className="text-3xl font-bold text-gray-800 border-b pb-4 px-2 tracking-tight">Documentation Overview</h3>
                
                {/* Registration & Ownership */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    </div>
                    Registration Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-600">
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Reg Number:</strong> <span className="font-mono font-bold text-blue-600">{car.vehicleDocumentation.registrationNumber || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">State:</strong> {car.vehicleDocumentation.registrationState || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">VIN:</strong> <span className="font-mono">{car.vehicleDocumentation.vinNumber || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Chassis No:</strong> <span className="font-mono">{car.vehicleDocumentation.chassisNumber || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Engine No:</strong> <span className="font-mono">{car.vehicleDocumentation.engineNumber || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Ownership:</strong> <span className="font-bold text-green-600">{car.vehicleDocumentation.ownershipType || 'N/A'}</span></p>
                  </div>
                  {car.vehicleDocumentation.registrationCertificate && (
                    <div className="mt-8 pt-4 border-t border-gray-100 flex">
                      <a href={car.vehicleDocumentation.registrationCertificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-6 py-3 rounded-xl transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View RC Document
                      </a>
                    </div>
                  )}
                </div>

                {/* Insurance & History Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Insurance Box */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        Insurance Info
                      </h4>
                      <div className="space-y-4 text-sm text-gray-600">
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Status:</strong> <span className={`px-3 py-1 rounded text-xs font-bold ${car.vehicleDocumentation.insuranceStatus === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{car.vehicleDocumentation.insuranceStatus || 'N/A'}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Expiry Date:</strong> <span>{car.vehicleDocumentation.insuranceExpiryDate ? new Date(car.vehicleDocumentation.insuranceExpiryDate).toLocaleDateString() : 'N/A'}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Type:</strong> <span>{car.vehicleDocumentation.insuranceType || 'N/A'}</span></p>
                        
                        {car.vehicleDocumentation.previousInsuranceClaims && (
                          <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <p className="font-bold text-orange-800 mb-1">Previous Claims:</p>
                            <p className="text-orange-700 text-xs leading-relaxed">{car.vehicleDocumentation.insuranceClaimDetails}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {car.vehicleDocumentation.insuranceDocument && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <a href={car.vehicleDocumentation.insuranceDocument} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-6 py-3 rounded-xl transition duration-200 w-full justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          View Insurance
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Service & Damage Box */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        Service & Damage
                      </h4>
                      <div className="space-y-4 text-sm text-gray-600">
                        <div>
                          <p className="flex justify-between items-center mb-1"><strong className="text-gray-800">Last Service:</strong> <span>{car.vehicleDocumentation.lastServiceDate ? new Date(car.vehicleDocumentation.lastServiceDate).toLocaleDateString() : 'N/A'}</span></p>
                          <p className="flex justify-between items-center mb-1"><strong className="text-gray-800">Service Book:</strong> <span>{car.vehicleDocumentation.serviceBookAvailable ? 'Available' : 'No'}</span></p>
                        </div>
                        <div className="border-t border-gray-100 pt-5 space-y-3">
                          <p className="flex justify-between items-center"><strong className="text-gray-800">Accident History:</strong> <span className={`px-3 py-1 rounded text-xs font-bold ${car.vehicleDocumentation.accidentHistory ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{car.vehicleDocumentation.accidentHistory ? 'Yes' : 'No Accidents'}</span></p>
                          {car.vehicleDocumentation.accidentHistory && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 text-xs leading-relaxed">
                              <strong>Details ({car.vehicleDocumentation.numberOfAccidents} reported):</strong> {car.vehicleDocumentation.accidentDetails}
                            </div>
                          )}

                          <p className="flex justify-between items-center mt-2"><strong className="text-gray-800">Major Repairs:</strong> <span className={`px-3 py-1 rounded text-xs font-bold ${car.vehicleDocumentation.majorRepairs ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{car.vehicleDocumentation.majorRepairs ? 'Yes' : 'No'}</span></p>
                          {car.vehicleDocumentation.majorRepairs && (
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg text-orange-800 text-xs leading-relaxed">
                              <strong>Details:</strong> {car.vehicleDocumentation.repairDetails}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal, Transfer & PUC */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <h4 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    Legal & Transfer
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-600">
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Hypothecation:</strong> <span className={`font-semibold ${car.vehicleDocumentation.hypothecationStatus?.includes('Clear') ? 'text-green-600' : 'text-orange-600'}`}>{car.vehicleDocumentation.hypothecationStatus || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Loan Provider:</strong> <span>{car.vehicleDocumentation.loanProvider || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">NOC Available:</strong> <span className={`font-bold ${car.vehicleDocumentation.nocAvailable ? 'text-green-600' : 'text-red-600'}`}>{car.vehicleDocumentation.nocAvailable ? 'Yes' : 'No'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Stolen Check:</strong> <span className={`font-semibold ${car.vehicleDocumentation.stolenVehicleCheck === 'Verified Clean' ? 'text-green-600' : 'text-orange-600'}`}>{car.vehicleDocumentation.stolenVehicleCheck || 'N/A'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Police NOC:</strong> <span>{car.vehicleDocumentation.policeNOC ? 'Yes' : 'No'}</span></p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Court Cases:</strong> <span className={`font-bold ${car.vehicleDocumentation.courtCases ? 'text-red-600' : 'text-green-600'}`}>{car.vehicleDocumentation.courtCases ? 'Pending' : 'None'}</span></p>
                  </div>
                  {car.vehicleDocumentation.courtCases && car.vehicleDocumentation.courtCaseDetails && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-sm">
                      <strong className="text-red-800">Court Case Details:</strong>
                      <p className="text-red-700 mt-1">{car.vehicleDocumentation.courtCaseDetails}</p>
                    </div>
                  )}
                  
                  <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                       <strong className="text-gray-800 text-base">Ready for Transfer:</strong>
                     </div>
                     <span className={`px-6 py-2 rounded-lg font-bold text-center ${car.vehicleDocumentation.readyForTransfer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {car.vehicleDocumentation.readyForTransfer ? 'APPROVED' : 'NOT READY'}
                     </span>
                  </div>
                </div>

                {/* Additional Docs & Verification Note */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Additional Documents Links */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Extra Documents</h4>
                    <div className="flex flex-wrap gap-3">
                      {car.vehicleDocumentation.rcTransferForm29 && (
                        <a href={car.vehicleDocumentation.rcTransferForm29} target="_blank" rel="noopener noreferrer"
                           className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-semibold transition">
                          Form 29
                        </a>
                      )}
                      {car.vehicleDocumentation.roadTaxReceipt && (
                        <a href={car.vehicleDocumentation.roadTaxReceipt} target="_blank" rel="noopener noreferrer"
                           className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-semibold transition">
                          Road Tax Receipt
                        </a>
                      )}
                      {car.vehicleDocumentation.addressProof && (
                        <a href={car.vehicleDocumentation.addressProof} target="_blank" rel="noopener noreferrer"
                           className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-semibold transition">
                          Address Proof
                        </a>
                      )}
                      {!car.vehicleDocumentation.rcTransferForm29 && !car.vehicleDocumentation.roadTaxReceipt && !car.vehicleDocumentation.addressProof && (
                        <span className="text-sm text-gray-400 italic">None provided</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={`rounded-3xl p-6 ${car.vehicleDocumentation.documentsVerified ? 'bg-green-50 border-2 border-green-200' : 'bg-amber-50 border-2 border-amber-200'}`}>
                     <div className="flex items-center gap-3 mb-2">
                       {car.vehicleDocumentation.documentsVerified ? (
                         <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                       )}
                       <div>
                         <p className={`font-extrabold text-lg ${car.vehicleDocumentation.documentsVerified ? 'text-green-800' : 'text-amber-800'}`}>
                           {car.vehicleDocumentation.documentsVerified ? 'Documents Verified' : 'Verification Pending'}
                         </p>
                       </div>
                     </div>
                     {car.vehicleDocumentation.verificationDate && (
                        <p className="text-xs text-gray-500 mb-3 ml-11">
                          On {new Date(car.vehicleDocumentation.verificationDate).toLocaleDateString()}
                        </p>
                      )}
                     {car.vehicleDocumentation.verificationNotes && (
                       <div className="mt-3 text-sm p-4 bg-white/60 rounded-xl text-gray-800 border border-white/40">
                         <strong>Admin Notes:</strong> {car.vehicleDocumentation.verificationNotes}
                       </div>
                     )}
                  </div>
                </div>

              </div>
            )}

            {/* Mechanic Inspection Report */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mt-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                 </div>
                 Mechanic Inspection Report
              </h3>

              {hasFullReview ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2 uppercase tracking-wide text-xs">Mechanical Condition</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{car.mechanicReview.mechanicalCondition}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2 uppercase tracking-wide text-xs">Body & Exterior</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{car.mechanicReview.bodyCondition}</p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <p className="font-bold text-amber-800 mb-2 uppercase tracking-wide text-xs">Recommendations</p>
                    <p className="text-amber-900 text-sm leading-relaxed">{car.mechanicReview.recommendations || 'No additional notes provided.'}</p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-bold text-gray-800 mb-2">Inspection Pending</p>
                  <p className="text-sm text-gray-500">A mechanic has not submitted the final inspection report yet.</p>
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT COLUMN: Action Sticky Panel & Seller Info */}
          <div className="lg:w-1/3 mt-8 lg:mt-0 relative">
            <div className="sticky top-24 space-y-6 lg:pb-12">
              
              {/* Box 1: Starting Bid */}
              <div className="bg-[#0f172a] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Requested Base Bid</p>
                <p className="text-4xl font-black text-white">{car.startingBid ? `₹${car.startingBid.toLocaleString()}` : 'TBD'}</p>
              </div>

              {/* Action Box */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-3">Final Decision</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">Review the documentation and mechanic report to make a final decision on this vehicle.</p>
                
                {status === 'approved' ? (
                  <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200 text-center shadow-inner">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-extrabold text-xl block text-green-800 mb-1">Approved</span>
                    <span className="text-sm opacity-80 block font-medium">This car is queued for live auction.</span>
                  </div>
                ) : status === 'rejected' ? (
                  <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-200 text-center shadow-inner">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <span className="font-extrabold text-xl block text-red-800 mb-1">Rejected</span>
                    <span className="text-sm opacity-80 block font-medium">This request has been denied.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!hasFullReview && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6 flex gap-3 text-amber-800 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <p>Approval requires a submitted Mechanic Inspection Report.</p>
                      </div>
                    )}
                    <button
                      onClick={() => updateStatus('approved')}
                      disabled={!hasFullReview}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(34,197,94,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(34,197,94,0.8)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      Approve for Auction
                    </button>
                    <button
                      onClick={() => updateStatus('rejected')}
                      className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 py-4 rounded-xl font-bold text-lg transition-all duration-300"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>

              {/* Seller Contact Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Seller Details</h3>
                {car.sellerId ? (
                  <div className="space-y-5 text-sm text-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                        {car.sellerId.firstName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-lg">{car.sellerId.firstName} {car.sellerId.lastName}</p>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Verified Owner</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl space-y-4 border border-gray-100 mt-6">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                         </div>
                         <p className="font-semibold text-gray-800 break-all">{car.sellerId.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="font-semibold text-gray-800">{car.sellerId.city || 'Location Unknown'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      {car.sellerId.phone ? (
                        <a href={`tel:${car.sellerId.phone}`} className="w-full flex justify-center items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 py-3.5 rounded-xl font-bold transition duration-300 shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                          Call Seller
                        </a>
                      ) : (
                        <p className="text-center text-gray-500 italic py-2">No phone number available</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <p className="font-medium">Seller information hidden</p>
                  </div>
                )}
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}