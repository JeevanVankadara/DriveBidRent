// client/src/pages/auctionManager/PendingCarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function PendingCarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPendingCarDetails(id);
        const responseData = res.data || res;
        
        if (responseData.success) {
          setCar(responseData.data);
          setStatus(responseData.data.status);
        } else {
          setError(responseData.message || 'Failed to load car details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === 'approved' && (!car.mechanicReview?.mechanicalCondition || !car.mechanicReview?.bodyCondition)) {
      alert('Cannot approve without complete review');
      return;
    }
    try {
      const res = await auctionManagerServices.updateStatus(id, newStatus);
      const responseData = res.data || res;
      
      if (responseData.success) {
        setStatus(newStatus);
        alert(`Status updated to ${newStatus}`);
      } else {
        alert(responseData.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Car Details</h2>
        <div className="text-center py-10 text-xl text-gray-600">Loading car details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Car Details</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Car Details</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Car not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-montserrat">
      <div className="w-full h-80 rounded-xl overflow-hidden shadow-lg mb-6">
        <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-6">{car.vehicleName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
        <div><strong>Year:</strong> {car.year}</div>
        <div><strong>Mileage:</strong> {car.mileage} km</div>
        <div><strong>Condition:</strong> {car.condition}</div>
        <div><strong>Fuel Type:</strong> {car.fuelType}</div>
        <div><strong>Transmission:</strong> {car.transmission}</div>
        <div><strong>Starting Bid:</strong> ₹{car.startingBid}</div>
        <div><strong>Auction Date:</strong> {new Date(car.auctionDate).toLocaleDateString()}</div>
        <div><strong>Status:</strong> {status}</div>
      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4">Mechanic's Review</h3>
        {car.mechanicReview?.mechanicalCondition ? (
          <div className="space-y-6">
            <div>
              <p className="font-semibold">Mechanical Condition:</p>
              <textarea readOnly className="w-full p-3 border rounded-lg bg-gray-50" rows="3">{car.mechanicReview.mechanicalCondition}</textarea>
            </div>
            <div>
              <p className="font-semibold">Body Condition:</p>
              <textarea readOnly className="w-full p-3 border rounded-lg bg-gray-50" rows="3">{car.mechanicReview.bodyCondition}</textarea>
            </div>
            <div>
              <p className="font-semibold">Recommendations:</p>
              <textarea readOnly className="w-full p-3 border rounded-lg bg-gray-50" rows="3">{car.mechanicReview.recommendations || 'None'}</textarea>
            </div>
            <p><strong>Submitted:</strong> {new Date(car.mechanicReview.submittedAt).toLocaleString()}</p>
            <p><strong>Mechanic:</strong> {car.assignedMechanic?.firstName} {car.assignedMechanic?.lastName}</p>
          </div>
        ) : (
          <p className="text-red-600">No review submitted yet. Approval disabled.</p>
        )}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => updateStatus('approved')}
          disabled={!car.mechanicReview?.mechanicalCondition}
          className={`px-6 py-3 rounded-lg font-bold ${car.mechanicReview?.mechanicalCondition ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 cursor-not-allowed text-gray-200'}`}
        >
          Approve
        </button>
        <button
          onClick={() => updateStatus('rejected')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}