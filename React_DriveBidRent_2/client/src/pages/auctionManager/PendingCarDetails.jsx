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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-8 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero Image with Title & Status */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12">
          <img
            src={car.vehicleImage || '/images/placeholder-car.jpg'}
            alt={car.vehicleName}
            className="w-full h-96 md:h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 drop-shadow-2xl">
              {car.vehicleName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <span>{car.year} • {car.mileage.toLocaleString()} km • {car.fuelType}</span>
              {car.carType && <span className="px-4 py-1 bg-blue-600 rounded-full text-sm font-semibold">{car.carType}</span>}
              <span className={`px-6 py-2 rounded-full font-bold text-lg ${
                status === 'approved' ? 'bg-green-600' :
                status === 'rejected' ? 'bg-red-600' :
                'bg-amber-600'
              }`}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card - Clean spacing, no overlap */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

          {/* Vehicle Specifications */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Vehicle Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Year', value: car.year },
              { label: 'Car Type', value: car.carType, highlight: true },
              { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
              { label: 'Condition', value: car.condition, highlight: true },
              { label: 'Fuel Type', value: car.fuelType },
              { label: 'Transmission', value: car.transmission },
              { label: 'Starting Bid', value: `₹${car.startingBid.toLocaleString()}`, highlight: true },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl text-center ${item.highlight ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}
              >
                <p className="text-gray-600 font-medium">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${item.highlight ? 'text-orange-700' : 'text-gray-800'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Seller Details - Compact */}
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Seller Contact</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span><strong>Name:</strong> {car.sellerId?.firstName} {car.sellerId?.lastName}</span>
              <span><strong>Email:</strong> {car.sellerId?.email || 'N/A'}</span>
              <span><strong>Phone:</strong> {car.sellerId?.phone || 'N/A'}</span>
              {car.sellerId?.phone && (
                <a
                  href={`tel:${car.sellerId.phone}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold transition"
                >
                   Call
                </a>
              )}
            </div>
          </div>

          {/* Vehicle Documentation - Seller Submitted */}
          {car.vehicleDocumentation && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 mb-8 border-2 border-purple-300">
              <h3 className="text-3xl font-bold text-purple-800 text-center mb-8">
                Vehicle Documentation & Verification
              </h3>

              {/* Registration & Ownership */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-blue-200">
                <h4 className="text-xl font-bold text-blue-800 mb-4">
                  Registration & Ownership
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Registration Number:</strong> <span className="text-blue-600 font-mono">{car.vehicleDocumentation.registrationNumber}</span></div>
                  <div><strong>State:</strong> {car.vehicleDocumentation.registrationState}</div>
                  <div><strong>Ownership:</strong> <span className="font-semibold text-green-600">{car.vehicleDocumentation.ownershipType}</span></div>
                  <div><strong>VIN:</strong> <span className="font-mono text-xs">{car.vehicleDocumentation.vinNumber}</span></div>
                  <div><strong>Chassis No:</strong> <span className="font-mono text-xs">{car.vehicleDocumentation.chassisNumber}</span></div>
                  <div><strong>Engine No:</strong> <span className="font-mono text-xs">{car.vehicleDocumentation.engineNumber}</span></div>
                  {car.vehicleDocumentation.registrationCertificate && (
                    <div className="md:col-span-2">
                      <a href={car.vehicleDocumentation.registrationCertificate} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        View RC Certificate
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Insurance Information */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-purple-200">
                <h4 className="text-xl font-bold text-purple-800 mb-4">
                  Insurance Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Status:</strong> <span className={`font-bold ${car.vehicleDocumentation.insuranceStatus === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>{car.vehicleDocumentation.insuranceStatus}</span></div>
                  {car.vehicleDocumentation.insuranceExpiryDate && (
                    <div><strong>Expiry:</strong> {new Date(car.vehicleDocumentation.insuranceExpiryDate).toLocaleDateString()}</div>
                  )}
                  {car.vehicleDocumentation.insuranceType && (
                    <div><strong>Type:</strong> {car.vehicleDocumentation.insuranceType}</div>
                  )}
                  <div><strong>Previous Claims:</strong> <span className={car.vehicleDocumentation.previousInsuranceClaims ? 'text-orange-600 font-semibold' : 'text-green-600'}>                    {car.vehicleDocumentation.previousInsuranceClaims ? 'Yes' : 'No'}
                  </span></div>
                  {car.vehicleDocumentation.previousInsuranceClaims && car.vehicleDocumentation.insuranceClaimDetails && (
                    <div className="md:col-span-2">
                      <strong>Claim Details:</strong>
                      <p className="mt-1 p-3 bg-orange-50 rounded text-gray-700">{car.vehicleDocumentation.insuranceClaimDetails}</p>
                    </div>
                  )}
                  {car.vehicleDocumentation.insuranceDocument && (
                    <div className="md:col-span-2">
                      <a href={car.vehicleDocumentation.insuranceDocument} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        View Insurance Document
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Accident & Repair History */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-red-200">
                <h4 className="text-xl font-bold text-red-800 mb-4">
                  Accident & Repair History
                </h4>
                <div className="space-y-3 text-sm">
                  <div><strong>Accident History:</strong> <span className={`font-bold ${car.vehicleDocumentation.accidentHistory ? 'text-red-600' : 'text-green-600'}`}>
                    {car.vehicleDocumentation.accidentHistory ? 'Yes' : 'No Accidents'}
                  </span></div>
                  {car.vehicleDocumentation.accidentHistory && (
                    <>
                      <div><strong>Number of Accidents:</strong> {car.vehicleDocumentation.numberOfAccidents}</div>
                      {car.vehicleDocumentation.accidentDetails && (
                        <div>
                          <strong>Accident Details:</strong>
                          <p className="mt-1 p-3 bg-red-50 rounded text-gray-700">{car.vehicleDocumentation.accidentDetails}</p>
                        </div>
                      )}
                    </>
                  )}
                  <div><strong>Major Repairs:</strong> <span className={car.vehicleDocumentation.majorRepairs ? 'text-orange-600' : 'text-green-600'}>
                    {car.vehicleDocumentation.majorRepairs ? 'Yes' : 'No'}
                  </span></div>
                  {car.vehicleDocumentation.majorRepairs && car.vehicleDocumentation.repairDetails && (
                    <div>
                      <strong>Repair Details:</strong>
                      <p className="mt-1 p-3 bg-orange-50 rounded text-gray-700">{car.vehicleDocumentation.repairDetails}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legal & Transfer Status */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-yellow-200">
                <h4 className="text-xl font-bold text-yellow-800 mb-4">
                  Legal & Transfer Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Hypothecation:</strong> <span className={`font-semibold ${car.vehicleDocumentation.hypothecationStatus?.includes('Clear') ? 'text-green-600' : 'text-orange-600'}`}>
                    {car.vehicleDocumentation.hypothecationStatus}
                  </span></div>
                  {car.vehicleDocumentation.loanProvider && (
                    <div><strong>Loan Provider:</strong> {car.vehicleDocumentation.loanProvider}</div>
                  )}
                  <div><strong>NOC Available:</strong> <span className={car.vehicleDocumentation.nocAvailable ? 'text-green-600' : 'text-red-600'}>
                    {car.vehicleDocumentation.nocAvailable ? 'Yes' : 'No'}
                  </span></div>
                  <div><strong>Stolen Check:</strong> <span className={`font-semibold ${car.vehicleDocumentation.stolenVehicleCheck === 'Verified Clean' ? 'text-green-600' : 'text-orange-600'}`}>
                    {car.vehicleDocumentation.stolenVehicleCheck}
                  </span></div>
                  <div><strong>Police NOC:</strong> {car.vehicleDocumentation.policeNOC ? 'Yes' : 'No'}</div>
                  <div><strong>Court Cases:</strong> <span className={car.vehicleDocumentation.courtCases ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {car.vehicleDocumentation.courtCases ? 'Pending' : 'None'}
                  </span></div>
                  {car.vehicleDocumentation.courtCases && car.vehicleDocumentation.courtCaseDetails && (
                    <div className="md:col-span-2">
                      <strong>Court Case Details:</strong>
                      <p className="mt-1 p-3 bg-red-50 rounded text-gray-700">{car.vehicleDocumentation.courtCaseDetails}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <strong>Ready for Transfer:</strong> <span className={`font-bold text-lg ${car.vehicleDocumentation.readyForTransfer ? 'text-green-600' : 'text-red-600'}`}>
                      {car.vehicleDocumentation.readyForTransfer ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Odometer & Service History */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-indigo-200">
                <h4 className="text-xl font-bold text-indigo-800 mb-4">
                  Odometer & Service History
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Odometer Reading:</strong> <span className="text-xl font-bold text-indigo-600">{car.vehicleDocumentation.odometerReading?.toLocaleString()} km</span></div>
                  <div><strong>Verified:</strong> {car.vehicleDocumentation.odometerVerified ? 'Yes' : 'No'}</div>
                  <div><strong>Tampering Status:</strong> <span className={`font-semibold ${car.vehicleDocumentation.odometerTampering === 'No Tampering' ? 'text-green-600' : 'text-red-600'}`}>
                    {car.vehicleDocumentation.odometerTampering}
                  </span></div>
                  <div><strong>Service History:</strong> {car.vehicleDocumentation.serviceHistory}</div>
                  <div><strong>Service Book:</strong> {car.vehicleDocumentation.serviceBookAvailable ? 'Available' : 'Not Available'}</div>
                  {car.vehicleDocumentation.lastServiceDate && (
                    <div><strong>Last Service:</strong> {new Date(car.vehicleDocumentation.lastServiceDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* Pollution & Fitness */}
              <div className="bg-white rounded-2xl p-6 mb-6 border border-teal-200">
                <h4 className="text-xl font-bold text-teal-800 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🍃</span> Pollution & Fitness
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Pollution Certificate:</strong> <span className={`font-semibold ${car.vehicleDocumentation.pollutionCertificate === 'Valid' ? 'text-green-600' : 'text-red-600'}`}>
                    {car.vehicleDocumentation.pollutionCertificate}
                  </span></div>
                  {car.vehicleDocumentation.pollutionExpiryDate && (
                    <div><strong>PUC Expiry:</strong> {new Date(car.vehicleDocumentation.pollutionExpiryDate).toLocaleDateString()}</div>
                  )}
                  {car.vehicleDocumentation.fitnessCertificateExpiry && (
                    <div><strong>Fitness Certificate Expiry:</strong> {new Date(car.vehicleDocumentation.fitnessCertificateExpiry).toLocaleDateString()}</div>
                  )}
                  {car.vehicleDocumentation.fitnessCertificate && (
                    <div className="md:col-span-2 mt-2">
                      <a href={car.vehicleDocumentation.fitnessCertificate} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                        📄 View Fitness Certificate
                      </a>
                    </div>
                  )}
                  {!car.vehicleDocumentation.fitnessCertificate && !car.vehicleDocumentation.fitnessCertificateExpiry && (
                    <div className="md:col-span-2 text-gray-500 italic">
                      No fitness certificate uploaded (not required for private vehicles)
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Documents */}
              {(car.vehicleDocumentation.rcTransferForm29 || car.vehicleDocumentation.rcTransferForm30 || 
                car.vehicleDocumentation.roadTaxReceipt || car.vehicleDocumentation.addressProof) && (
                <div className="bg-white rounded-2xl p-6 border border-gray-300">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">
                    Additional Documents
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {car.vehicleDocumentation.rcTransferForm29 && (
                      <a href={car.vehicleDocumentation.rcTransferForm29} target="_blank" rel="noopener noreferrer"
                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                        Form 29
                      </a>
                    )}
                    {car.vehicleDocumentation.rcTransferForm30 && (
                      <a href={car.vehicleDocumentation.rcTransferForm30} target="_blank" rel="noopener noreferrer"
                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                        Form 30
                      </a>
                    )}
                    {car.vehicleDocumentation.roadTaxReceipt && (
                      <a href={car.vehicleDocumentation.roadTaxReceipt} target="_blank" rel="noopener noreferrer"
                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                        Road Tax Receipt
                      </a>
                    )}
                    {car.vehicleDocumentation.addressProof && (
                      <a href={car.vehicleDocumentation.addressProof} target="_blank" rel="noopener noreferrer"
                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                        Address Proof
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className={`mt-6 p-4 rounded-xl ${car.vehicleDocumentation.documentsVerified ? 'bg-green-100 border-2 border-green-500' : 'bg-yellow-100 border-2 border-yellow-500'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">
                      {car.vehicleDocumentation.documentsVerified ? 'Documents Verified' : 'Verification Pending'}
                    </p>
                    {car.vehicleDocumentation.verificationDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Verified on: {new Date(car.vehicleDocumentation.verificationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {car.vehicleDocumentation.verificationNotes && (
                  <p className="mt-2 text-sm text-gray-700 p-2 bg-white rounded">
                    <strong>Notes:</strong> {car.vehicleDocumentation.verificationNotes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mechanic Inspection Report - Only Amber Border */}
          <div className="rounded-3xl p-8 border-2 border-amber-300">
            <h3 className="text-3xl font-bold text-amber-800 text-center mb-8">
              Mechanic Inspection Report
            </h3>

            {hasFullReview ? (
              <div className="space-y-8">
                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Mechanical Condition</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.mechanicalCondition}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Body & Exterior Condition</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.bodyCondition}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Recommendations / Notes</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.recommendations || 'No additional notes'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-2xl font-bold text-red-600">Review Pending</p>
                <p className="text-gray-700 mt-3">Waiting for mechanic to submit inspection report</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => updateStatus('approved')}
              disabled={!hasFullReview}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                hasFullReview
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Approve for Auction
            </button>

            <button
              onClick={() => updateStatus('rejected')}
              className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
            >
              Reject Vehicle
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}