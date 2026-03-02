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

  return (
    <div className="max-w-6xl mx-auto p-6 font-montserrat">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-100">
            <img
              src={request.vehicleImage}
              alt={request.vehicleName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">{request.vehicleName}</h1>
        </div>

        <div className="lg:w-1/2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-600 pb-2">Vehicle Information</h2>
            <div className="space-y-3 mt-4 text-lg">
              <p><strong>Fuel Type:</strong> {request.fuelType || 'Not specified'}</p>
              <p><strong>Mileage:</strong> {request.mileage ? `${request.mileage} km` : 'Not specified'}</p>
              <p><strong>Condition:</strong> {request.condition || 'Pending'}</p>
              <p><strong>Year:</strong> {request.year || 'Not specified'}</p>
              <p><strong>Transmission:</strong> {request.transmission || 'Not specified'}</p>
              <p><strong>Starting Bid:</strong> {request.startingBid ? `₹${request.startingBid}` : 'Not specified'}</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="text-base font-bold text-blue-900 mb-2">Seller Contact</h3>
            {request.sellerId ? (
              <div className="space-y-1 text-sm">
                <p mt-2px><strong>Name:</strong> {request.sellerId.firstName} {request.sellerId.lastName}</p>
                <p mt-2px><strong>Email:</strong> {request.sellerId.email || 'N/A'}</p>
                <p mt-2px><strong>Phone:</strong> {request.sellerId.phone || 'N/A'}</p>
                <p mt-2px><strong>City:</strong> {request.sellerId.city || 'N/A'}</p>
                {request.sellerId.phone && (
                  <a
                    href={`tel:${request.sellerId.phone}`}
                    className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold transition text-sm"
                  >
                     Call Seller
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm">Seller information not available</p>
            )}
          </div>

          {/* Vehicle Documentation Section */}
          {request.vehicleDocumentation && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-300 rounded-lg p-5">
              <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                Vehicle Documentation
              </h3>
              
              {/* Registration & Ownership */}
              <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Registration & Ownership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.registrationNumber && (
                    <p><strong>Registration:</strong> {request.vehicleDocumentation.registrationNumber}</p>
                  )}
                  {request.vehicleDocumentation.registrationState && (
                    <p><strong>State:</strong> {request.vehicleDocumentation.registrationState}</p>
                  )}
                  {request.vehicleDocumentation.vinNumber && (
                    <p><strong>VIN:</strong> {request.vehicleDocumentation.vinNumber}</p>
                  )}
                  {request.vehicleDocumentation.chassisNumber && (
                    <p><strong>Chassis No:</strong> {request.vehicleDocumentation.chassisNumber}</p>
                  )}
                  {request.vehicleDocumentation.engineNumber && (
                    <p><strong>Engine No:</strong> {request.vehicleDocumentation.engineNumber}</p>
                  )}
                  {request.vehicleDocumentation.ownershipType && (
                    <p><strong>Ownership:</strong> {request.vehicleDocumentation.ownershipType}</p>
                  )}
                  {request.vehicleDocumentation.numberOfOwners && (
                    <p><strong>No. of Owners:</strong> {request.vehicleDocumentation.numberOfOwners}</p>
                  )}
                </div>
                {request.vehicleDocumentation.registrationCertificate && (
                  <a 
                    href={request.vehicleDocumentation.registrationCertificate} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View RC Document →
                  </a>
                )}
              </div>

              {/* Insurance Information */}
              <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Insurance Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.insuranceStatus && (
                    <p><strong>Status:</strong> <span className={request.vehicleDocumentation.insuranceStatus === 'Valid' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{request.vehicleDocumentation.insuranceStatus}</span></p>
                  )}
                  {request.vehicleDocumentation.insuranceProvider && (
                    <p><strong>Provider:</strong> {request.vehicleDocumentation.insuranceProvider}</p>
                  )}
                  {request.vehicleDocumentation.insurancePolicyNumber && (
                    <p><strong>Policy No:</strong> {request.vehicleDocumentation.insurancePolicyNumber}</p>
                  )}
                  {request.vehicleDocumentation.insuranceExpiryDate && (
                    <p><strong>Expiry:</strong> {new Date(request.vehicleDocumentation.insuranceExpiryDate).toLocaleDateString()}</p>
                  )}
                  {request.vehicleDocumentation.insuranceType && (
                    <p><strong>Type:</strong> {request.vehicleDocumentation.insuranceType}</p>
                  )}
                </div>
                {request.vehicleDocumentation.insuranceCertificate && (
                  <a 
                    href={request.vehicleDocumentation.insuranceCertificate} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Insurance Document →
                  </a>
                )}
              </div>

              {/* Accident & Damage History */}
              <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Accident & Damage History
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.accidentHistory && (
                    <p><strong>Accident History:</strong> <span className={request.vehicleDocumentation.accidentHistory === 'no' ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>{request.vehicleDocumentation.accidentHistory === 'no' ? 'No Accidents' : 'Has Accident History'}</span></p>
                  )}
                  {request.vehicleDocumentation.accidentDetails && request.vehicleDocumentation.accidentHistory !== 'no' && (
                    <p className="col-span-2"><strong>Details:</strong> {request.vehicleDocumentation.accidentDetails}</p>
                  )}
                  {request.vehicleDocumentation.structuralDamage && (
                    <p><strong>Structural Damage:</strong> {request.vehicleDocumentation.structuralDamage}</p>
                  )}
                  {request.vehicleDocumentation.floodDamage && (
                    <p><strong>Flood Damage:</strong> {request.vehicleDocumentation.floodDamage}</p>
                  )}
                </div>
              </div>

              {/* Pollution & Fitness */}
              <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Pollution & Fitness
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.pollutionCertificate && (
                    <p><strong>PUC Status:</strong> <span className={request.vehicleDocumentation.pollutionCertificate === 'Valid' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{request.vehicleDocumentation.pollutionCertificate}</span></p>
                  )}
                  {request.vehicleDocumentation.pollutionExpiryDate && (
                    <p><strong>PUC Expiry:</strong> {new Date(request.vehicleDocumentation.pollutionExpiryDate).toLocaleDateString()}</p>
                  )}
                  {request.vehicleDocumentation.fitnessCertificate && (
                    <p><strong>Fitness Status:</strong> {request.vehicleDocumentation.fitnessCertificate}</p>
                  )}
                  {request.vehicleDocumentation.fitnessValidUntil && (
                    <p><strong>Fitness Valid Till:</strong> {new Date(request.vehicleDocumentation.fitnessValidUntil).toLocaleDateString()}</p>
                  )}
                </div>
                {request.vehicleDocumentation.fitnessCertificateDoc && (
                  <a 
                    href={request.vehicleDocumentation.fitnessCertificateDoc} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Fitness Certificate →
                  </a>
                )}
              </div>

              {/* Odometer & Service */}
              <div className="mb-4 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Odometer & Service
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.odometerReading && (
                    <p><strong>Odometer:</strong> {request.vehicleDocumentation.odometerReading.toLocaleString()} km</p>
                  )}
                  {request.vehicleDocumentation.lastServiceDate && (
                    <p><strong>Last Service:</strong> {new Date(request.vehicleDocumentation.lastServiceDate).toLocaleDateString()}</p>
                  )}
                  {request.vehicleDocumentation.serviceHistory && (
                    <p><strong>Service History:</strong> {request.vehicleDocumentation.serviceHistory}</p>
                  )}
                  {request.vehicleDocumentation.nextServiceDue && (
                    <p><strong>Next Service Due:</strong> {new Date(request.vehicleDocumentation.nextServiceDue).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Legal & Transfer */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Legal & Transfer Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {request.vehicleDocumentation.hypothecationStatus && (
                    <p><strong>Hypothecation:</strong> {request.vehicleDocumentation.hypothecationStatus}</p>
                  )}
                  {request.vehicleDocumentation.financierName && (
                    <p><strong>Financier:</strong> {request.vehicleDocumentation.financierName}</p>
                  )}
                  {request.vehicleDocumentation.nocStatus && (
                    <p><strong>NOC Status:</strong> {request.vehicleDocumentation.nocStatus}</p>
                  )}
                  {request.vehicleDocumentation.roadTaxPaid && (
                    <p><strong>Road Tax:</strong> {request.vehicleDocumentation.roadTaxPaid}</p>
                  )}
                  {request.vehicleDocumentation.rcTransferReady && (
                    <p><strong>RC Transfer Ready:</strong> <span className={request.vehicleDocumentation.rcTransferReady === 'yes' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>{request.vehicleDocumentation.rcTransferReady === 'yes' ? 'Yes' : 'No'}</span></p>
                  )}
                </div>
                {request.vehicleDocumentation.roadTaxReceipt && (
                  <a 
                    href={request.vehicleDocumentation.roadTaxReceipt} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Road Tax Receipt →
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            {assigned ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-bold text-lg">
                Mechanic Assigned Successfully!
              </div>
            ) : (
              <>
                <button
                  onClick={() => document.getElementById('mechanic-select').style.display = 'block'}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
                >
                  Assign Mechanic
                </button>
                <select
                  id="mechanic-select"
                  className="hidden w-full mt-4 p-3 border border-gray-300 rounded-lg text-lg"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Select a Mechanic</option>
                  {mechanics.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} {m.shopName && `- ${m.shopName}`} {m.city && `(${m.city})`} {m.experienceYears && `- ${m.experienceYears} yrs exp`}
                    </option>
                  ))}
                </select>
                {selected && (
                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold w-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                )}
                
                {mechanics.length === 0 && (
                  <div className="mt-4 bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
                    No mechanics available in <strong>{request?.sellerId?.city || 'this area'}</strong>. 
                    {request?.sellerId?.city ? ' Please add mechanics in this city or assign from a different location.' : ' Seller location is not set.'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
