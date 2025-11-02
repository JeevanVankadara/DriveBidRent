// client/src/pages/seller/ViewAuctions.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  useEffect(() => {
    axiosInstance
      .get('/seller/view-auctions')
      .then((res) => {
        if (res.data.success) setAuctions(res.data.data);
        else setError(res.data.message);
      })
      .catch(() => setError('Failed to load auctions'));
  }, []);

  return (
  <div className="min-h-screen bg-gray-50 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">My Auctions</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/seller/auction-details/${a._id}`)}
              >
                <img
                  src={a.vehicleImage}
                  alt={a.vehicleName}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-orange-600 mb-2">
                    {capitalize(a.vehicleName)}
                  </h3>
                  <p className="text-gray-600 text-sm">Year: {a.year}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        a.status === 'pending'
                          ? 'text-yellow-600'
                          : a.status === 'approved'
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {capitalize(a.status)}
                    </span>
                  </p>
                  {a.assignedMechanic && (
                    <p className="text-gray-600 text-sm mt-1">
                      Mechanic: {a.assignedMechanic.firstName} {a.assignedMechanic.lastName}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm mt-1">
                    Auction: {formatDate(a.auctionDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Auctions Yet</h2>
            <p className="text-gray-600 mb-6">Start by adding your first vehicle!</p>
            <Link
              to="/seller/add-auction"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Add Auction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAuctions;