// client/src/pages/auctionManager/PendingCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function PendingCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [review, setReview] = useState(null);

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
        console.error('Pending cars fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load pending cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const openModal = async (carId) => {
    try {
      const res = await auctionManagerServices.getReview(carId);
      const responseData = res.data || res;
      
      if (responseData.success) {
        setReview(responseData.data);
        setSelectedCar(cars.find(c => c._id === carId));
        document.getElementById('reviewModal').style.display = 'block';
      } else {
        alert(responseData.message || 'Failed to load review');
      }
    } catch (err) {
      console.error('Review fetch error:', err);
      alert(err.response?.data?.message || 'Failed to load review');
    }
  };

  const closeModal = () => {
    document.getElementById('reviewModal').style.display = 'none';
    setSelectedCar(null);
    setReview(null);
  };

  const updateStatus = async (status) => {
    if (!selectedCar) return;
    try {
      const res = await auctionManagerServices.updateStatus(selectedCar._id, status);
      const responseData = res.data || res;
      
      if (responseData.success) {
        setCars(cars.map(c => c._id === selectedCar._id ? { ...c, status } : c));
        closeModal();
      } else {
        alert(responseData.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
        <div className="text-center py-10 text-xl text-gray-600">Loading pending cars...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.length > 0 ? (
            cars.map((car) => (
              <div
                key={car._id}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
                onClick={() => openModal(car._id)}
              >
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold text-gray-800">{car.vehicleName}</h3>
                <p className="text-gray-600">
                  Seller: {car.sellerId.firstName} {car.sellerId.lastName}
                </p>
                <p className="text-gray-600">Location: {car.sellerId.city}</p>
                <div className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-bold ${car.reviewStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                  {car.reviewStatus === 'completed' ? 'Inspection Done' : 'Pending Inspection'}
                </div>
                <button className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg font-bold hover:opacity-90 transition">
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600 text-lg py-10">
              No cars currently pending inspection
            </p>
          )}
        </div>
      </div>

      {/* Modal */}
      <div id="reviewModal" className="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl max-w-2xl w-full mx-4">
          <h2 className="text-2xl font-bold text-orange-600 mb-6">Mechanic Review</h2>
          {review ? (
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Rating:</strong>{' '}
                <span className="text-yellow-500 text-xl">
                  {'★'.repeat(review.conditionRating || 0)}{'☆'.repeat(5 - (review.conditionRating || 0))}
                </span>
              </p>
              <p><strong>Mechanical Condition:</strong> {review.mechanicalCondition || 'Not provided'}</p>
              <p><strong>Body Condition:</strong> {review.bodyCondition || 'Not provided'}</p>
              <p><strong>Recommendations:</strong> {review.recommendations || 'Not provided'}</p>
            </div>
          ) : (
            <p className="text-gray-600">No review submitted yet</p>
          )}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => updateStatus('rejected')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
            >
              Decline
            </button>
            <button
              onClick={() => updateStatus('approved')}
              disabled={!review?.mechanicalCondition}
              className={`px-6 py-2 rounded-lg font-bold transition ${review?.mechanicalCondition ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 cursor-not-allowed text-white'}`}
            >
              Approve
            </button>
          </div>
          <button
            onClick={closeModal}
            className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}