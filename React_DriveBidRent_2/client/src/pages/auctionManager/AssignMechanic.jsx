// client/src/pages/auctionManager/AssignMechanic.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AssignMechanic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [selected, setSelected] = useState('');
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔧 [Frontend - AssignMechanic] Fetching data for request:', id);
      try {
        setLoading(true);
        const res = await auctionManagerServices.getAssignMechanic(id);
        const responseData = res.data || res;
        
        console.log('📦 [Frontend - AssignMechanic] API response:', responseData);
        
        if (responseData.success) {
          console.log('✅ [Frontend - AssignMechanic] Request loaded:', responseData.data.request?.vehicleName);
          console.log('✅ [Frontend - AssignMechanic] Found', responseData.data.mechanics?.length || 0, 'mechanics in city:', responseData.data.request?.sellerId?.city);
          setRequest(responseData.data.request);
          setMechanics(responseData.data.mechanics || []);
          if (responseData.data.mechanics?.length === 0) {
            console.log('⚠️ [Frontend - AssignMechanic] No mechanics available in seller city');
          }
        } else {
          console.log('❌ [Frontend - AssignMechanic] Failed:', responseData.message);
          setError(responseData.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('❌ [Frontend - AssignMechanic] Error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selected) {
      alert('Please select a mechanic');
      return;
    }
    
    const mechanic = mechanics.find(m => m._id === selected);
    if (!mechanic) {
      alert('Invalid mechanic selected');
      return;
    }

    console.log('🔧 [Frontend - AssignMechanic] Assigning mechanic:', {
      requestId: id,
      mechanicId: selected,
      mechanicName: `${mechanic.firstName} ${mechanic.lastName}`
    });

    try {
      setAssigning(true);
      const res = await auctionManagerServices.assignMechanic(id, {
        mechanicId: selected,
        mechanicName: `${mechanic.firstName} ${mechanic.lastName}`
      });
      
      const responseData = res.data || res;
      
      console.log('📦 [Frontend - AssignMechanic] Assignment response:', responseData);
      
      if (responseData.success) {
        console.log('✅ [Frontend - AssignMechanic] Mechanic assigned successfully!');
        console.log('📝 [Frontend - AssignMechanic] Car is now assigned to this auction manager');
        setAssigned(true);
        const chat = responseData.data?.chat;
        if (chat && chat._id) {
          console.log('💬 [Frontend - AssignMechanic] Navigating to inspection chat:', chat._id);
          // navigate to the auction manager chat view for this inspection
          navigate(`/auctionmanager/chats/${chat._id}`);
          return;
        }
      } else {
        console.log('❌ [Frontend - AssignMechanic] Failed to assign:', responseData.message);
        alert(responseData.message || 'Failed to assign mechanic');
      }
    } catch (err) {
      console.error('❌ [Frontend - AssignMechanic] Error assigning mechanic:', err);
      alert(err.response?.data?.message || 'Failed to assign mechanic');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Assign Mechanic</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Assign Mechanic</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Vehicle request not found
        </div>
      </div>
    );
  }

  const allImages = (() => {
    const imgs = [];
    if (request.mainImage) imgs.push(request.mainImage);
    else if (request.vehicleImage) imgs.push(request.vehicleImage);
    if (request.additionalImages?.length > 0) imgs.push(...request.additionalImages);
    else if (request.vehicleImages?.length > 0) {
      const additional = request.vehicleImages.filter(i => i !== request.vehicleImage && i !== request.mainImage);
      imgs.push(...additional);
    }
    return imgs.length > 0 ? imgs : ['https://via.placeholder.com/600x400?text=Vehicle+Image'];
  })();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4 font-montserrat">
      <div className="max-w-7xl mx-auto">
      
        {/* Page Header */}
        <div className="mb-8 pl-4 border-l-4 border-orange-500">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Assign Mechanic</h1>
          <p className="text-gray-600">Review vehicle details and assign a qualified mechanic for inspection</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Vehicle Info & Documentation */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Image Gallery & Main Specs section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-80 md:h-[450px] bg-gray-100 relative">
                <img
                  src={allImages[activeImageIndex]}
                  alt={request.vehicleName}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-5 py-2 bg-black/70 backdrop-blur-md text-white text-sm font-semibold rounded-full shadow-lg">
                    {request.condition ? request.condition.toUpperCase() : 'PENDING'}
                  </span>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">{request.vehicleName}</h2>
                
                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 mb-6 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-28 h-20 md:w-36 md:h-24 flex-shrink-0 cursor-pointer rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
                          activeImageIndex === idx ? 'ring-4 ring-orange-500 scale-105 opacity-100 z-10' : 'opacity-60 hover:opacity-100 ring-1 ring-gray-200'
                        }`}
                      >
                        <img src={img} alt={`${request.vehicleName} preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Year</p>
                    <p className="font-bold text-xl text-gray-900">{request.year || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Mileage</p>
                    <p className="font-bold text-xl text-gray-900">{request.mileage ? `${request.mileage.toLocaleString()} km` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fuel</p>
                    <p className="font-bold text-xl text-gray-900 capitalize">{request.fuelType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Transmission</p>
                    <p className="font-bold text-xl text-gray-900 capitalize">{request.transmission || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            {request.vehicleDocumentation && (
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
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Reg Number:</strong> {request.vehicleDocumentation.registrationNumber || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">State:</strong> {request.vehicleDocumentation.registrationState || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">VIN:</strong> {request.vehicleDocumentation.vinNumber || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Chassis No:</strong> {request.vehicleDocumentation.chassisNumber || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Engine No:</strong> {request.vehicleDocumentation.engineNumber || 'N/A'}</p>
                    <p className="flex justify-between border-b border-gray-50 bg-gray-50/50 p-3 rounded-lg"><strong className="text-gray-800">Ownership:</strong> {request.vehicleDocumentation.ownershipType || 'N/A'}</p>
                  </div>
                  {request.vehicleDocumentation.registrationCertificate && (
                    <div className="mt-8 pt-4 border-t border-gray-100 flex">
                      <a href={request.vehicleDocumentation.registrationCertificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-6 py-3 rounded-xl transition duration-200">
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
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Status:</strong> <span className={`px-3 py-1 rounded text-xs font-bold ${request.vehicleDocumentation.insuranceStatus === 'Valid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{request.vehicleDocumentation.insuranceStatus || 'N/A'}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Provider:</strong> <span>{request.vehicleDocumentation.insuranceProvider || 'N/A'}</span></p>
                        <p className="flex justify-between items-center"><strong className="text-gray-800">Expiry Date:</strong> <span>{request.vehicleDocumentation.insuranceExpiryDate ? new Date(request.vehicleDocumentation.insuranceExpiryDate).toLocaleDateString() : 'N/A'}</span></p>
                      </div>
                    </div>
                    {request.vehicleDocumentation.insuranceCertificate && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <a href={request.vehicleDocumentation.insuranceCertificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-6 py-3 rounded-xl transition duration-200 w-full justify-center">
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
                          <p className="flex justify-between items-center mb-1"><strong className="text-gray-800">Last Service:</strong> <span>{request.vehicleDocumentation.lastServiceDate ? new Date(request.vehicleDocumentation.lastServiceDate).toLocaleDateString() : 'N/A'}</span></p>
                        </div>
                        <div className="border-t border-gray-100 pt-5">
                          <p className="flex justify-between items-center mb-3"><strong className="text-gray-800">Accident History:</strong> <span className={`px-3 py-1 rounded text-xs font-bold ${request.vehicleDocumentation.accidentHistory === 'no' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{request.vehicleDocumentation.accidentHistory === 'no' ? 'No History' : 'Has Accidents'}</span></p>
                          {request.vehicleDocumentation.accidentHistory !== 'no' && request.vehicleDocumentation.accidentDetails && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 text-xs leading-relaxed">
                              <strong>Details:</strong> {request.vehicleDocumentation.accidentDetails}
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
                    <p className="flex justify-between items-center border-b border-gray-50 pb-3"><strong className="text-gray-800">Hypothecation:</strong> <span>{request.vehicleDocumentation.hypothecationStatus || 'N/A'}</span></p>
                    <p className="flex justify-between items-center border-b border-gray-50 pb-3"><strong className="text-gray-800">NOC Status:</strong> <span>{request.vehicleDocumentation.nocStatus || 'N/A'}</span></p>
                    <p className="flex justify-between items-center border-b border-gray-50 pb-3"><strong className="text-gray-800">RC Transfer Ready:</strong> <span className={`font-bold ${request.vehicleDocumentation.rcTransferReady === 'yes' ? 'text-green-600' : 'text-yellow-600'}`}>{request.vehicleDocumentation.rcTransferReady === 'yes' ? 'Yes' : 'No'}</span></p>
                    <p className="flex justify-between items-center border-b border-gray-50 pb-3"><strong className="text-gray-800">PUC Status:</strong> <span className={`font-bold ${request.vehicleDocumentation.pollutionCertificate === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>{request.vehicleDocumentation.pollutionCertificate || 'N/A'}</span></p>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Action Sticky Panel & Seller Info */}
          <div className="lg:w-1/3 mt-8 lg:mt-0 relative">
            <div className="sticky top-6 space-y-6 lg:pb-12">
              
              {/* Box 1: Starting Bid */}
              <div className="bg-[#0f172a] rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Target Base Value</p>
                <p className="text-4xl font-black text-white">{request.startingBid ? `₹${request.startingBid.toLocaleString()}` : 'TBD'}</p>
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Suggested Minimum</span>
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-orange-400 to-orange-600 pointer-events-none"></div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-3 mt-1">Assign Mechanic</h3>
                <p className="text-sm text-gray-500 mb-8 leading-relaxed">Select an available technician from <strong className="text-gray-700">{request.sellerId?.city || 'the area'}</strong> to perform an on-site inspection of this vehicle.</p>
                
                {assigned ? (
                  <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200 text-center shadow-inner">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-extrabold text-xl block text-green-800 mb-2">Mechanic Assigned!</span>
                    <span className="text-sm opacity-80 block font-medium">Head over to the Chats section to initiate the inspection process.</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 relative">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">Select Technician</label>
                      <select
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-800 font-bold focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition appearance-none cursor-pointer"
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                      >
                        <option value="" disabled>Choose specialized mechanic...</option>
                        {mechanics.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.firstName} {m.lastName} {m.city ? `• ${m.city}` : ''} 
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-[40px] pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </div>
                    </div>

                    <button
                      onClick={handleAssign}
                      disabled={assigning || !selected || mechanics.length === 0}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_24px_-6px_rgba(249,115,22,0.8)] transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {assigning ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Processing...
                        </span>
                      ) : (
                        'Confirm Assignment'
                      )}
                    </button>
                    
                    {mechanics.length === 0 && (
                      <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <p>No operational mechanics currently available in <strong>{request?.sellerId?.city || 'this area'}</strong>.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Seller Contact Info */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-gray-100 pb-3">Seller Details</h3>
                {request.sellerId ? (
                  <div className="space-y-5 text-sm text-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                        {request.sellerId.firstName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-lg">{request.sellerId.firstName} {request.sellerId.lastName}</p>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Verified Owner</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl space-y-4 border border-gray-100 mt-6">
                      <div className="flex items-center gap-3">
                         <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                         </div>
                         <p className="font-semibold text-gray-800 break-all">{request.sellerId.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        </div>
                        <p className="font-semibold text-gray-800">{request.sellerId.city || 'Location Unknown'}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      {request.sellerId.phone ? (
                        <a href={`tel:${request.sellerId.phone}`} className="w-full flex justify-center items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 py-3.5 rounded-xl font-bold transition duration-300 shadow-sm">
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
