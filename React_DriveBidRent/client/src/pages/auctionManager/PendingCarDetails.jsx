// client/src/pages/auctionManager/PendingCarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function PendingCarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await auctionManagerServices.getPendingCarDetails(id);
        if (res.success) {
          setCar(res.data);
          setStatus(res.data.status);
        }
      } catch (err) {
        console.error(err);
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
      const res = await auctionManagerServices.updateStatus(id, { status: newStatus });
      if (res.success) setStatus(newStatus);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="text-center py-10 text-xl">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-montserrat">
      {car ? (
        <>
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
              className={`px-6 py-3 rounded-lg font-bold ${car.mechanicReview?.mechanicalCondition ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 cursor-not-allowed text-white'}`}
            >
              Approve
            </button>
            <button
              onClick={() => updateStatus('rejected')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
            >
              Decline
            </button>
          </div>

          {status && status !== car.status && (
            <div className={`mt-6 p-4 rounded-lg text-center font-bold text-white ${status === 'approved' ? 'bg-green-600' : 'bg-red-600'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-red-600 text-xl">Car not found</div>
      )}
    </div>
  );
}