// client/src/pages/auctionManager/ApprovedCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function ApprovedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | not-started | ongoing | ended

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getApproved();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setCars(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load approved cars');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load approved cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const startAuction = async (id) => {
    try {
      const res = await auctionManagerServices.startAuction(id);
      const responseData = res.data || res;
      
      if (responseData.success) {
        setCars(cars.map(car => car._id === id ? { ...car, started_auction: 'yes' } : car));
        alert('Auction started successfully!');
      } else {
        alert(responseData.message || 'Failed to start auction');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start auction');
    }
  };

  const matchesSearch = (car) => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return true;
    const sellerName = `${car.sellerId?.firstName || ''} ${car.sellerId?.lastName || ''}`.toLowerCase();
    return (
      (car.vehicleName || '').toLowerCase().includes(q) ||
      sellerName.includes(q) ||
      (car.sellerId?.city || '').toLowerCase().includes(q)
    );
  };

  const notStartedCars = cars.filter(c => (c.started_auction === 'no') && matchesSearch(c));
  const ongoingCars = cars.filter(c => (c.started_auction === 'yes' && !c.auction_stopped) && matchesSearch(c));
  const endedCars = cars.filter(c => ((c.auction_stopped === true) || c.started_auction === 'ended') && matchesSearch(c));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Approved Cars</h2>
        <div className="text-center py-10 text-xl text-gray-600">Loading approved cars...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Approved Cars</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Approved Cars</h2>
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3 w-full md:w-2/3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by car, seller or location..."
            className="w-full md:w-3/4 px-4 py-2 border rounded-lg shadow-sm focus:outline-none font-montserrat text-sm"
          />
          <button
            onClick={() => setSearch('')}
            className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-1/3">
          <label className="text-gray-700">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full font-montserrat text-sm"
          >
            <option value="all">All (Grouped)</option>
            <option value="not-started">Yet to start</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {statusFilter === 'all' ? (
        <>
          <section className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Yet to Start ({notStartedCars.length})</h3>
            {notStartedCars.length > 0 ? (
              notStartedCars.map(car => (
                <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
                  <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                    <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                    <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                    <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => startAuction(car._id)} className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition">Start Auction</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-600 mb-4">No cars waiting to be started.</div>
            )}
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ongoing ({ongoingCars.length})</h3>
            {ongoingCars.length > 0 ? (
              ongoingCars.map(car => (
                <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
                  <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                    <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                    <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                    <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
                  </div>
                  <div className="flex items-end">
                    <Link to={`/auction-manager/view-bids/${car._id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">View Bids</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-600 mb-4">No ongoing auctions.</div>
            )}
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Ended ({endedCars.length})</h3>
            {endedCars.length > 0 ? (
              endedCars.map(car => (
                <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
                  <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                    <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                    <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                    <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
                  </div>
                  <div className="flex items-end">
                    <Link to={`/auction-manager/view-bids/${car._id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">View Bids</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-600 mb-4">No ended auctions.</div>
            )}
          </section>
        </>
      ) : (
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            {statusFilter === 'not-started' ? `Yet to Start (${notStartedCars.length})` : statusFilter === 'ongoing' ? `Ongoing (${ongoingCars.length})` : `Ended (${endedCars.length})`}
          </h3>
          {statusFilter === 'not-started' && notStartedCars.length === 0 && <div className="text-gray-600">No cars in this category.</div>}
          {statusFilter === 'ongoing' && ongoingCars.length === 0 && <div className="text-gray-600">No cars in this category.</div>}
          {statusFilter === 'ended' && endedCars.length === 0 && <div className="text-gray-600">No cars in this category.</div>}

          {statusFilter === 'not-started' && notStartedCars.map(car => (
            <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
              </div>
              <div className="flex items-end">
                <button onClick={() => startAuction(car._id)} className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition">Start Auction</button>
              </div>
            </div>
          ))}

          {statusFilter === 'ongoing' && ongoingCars.map(car => (
            <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
              </div>
              <div className="flex items-end">
                <Link to={`/auction-manager/view-bids/${car._id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">View Bids</Link>
              </div>
            </div>
          ))}

          {statusFilter === 'ended' && endedCars.map(car => (
            <div key={car._id} className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1">
              <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
                <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
                <p className="text-lg font-bold text-orange-600 mt-1">Condition: {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}</p>
                <p className="text-gray-600 mt-2">Seller: {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}</p>
                <p className="text-gray-600">Location: {car.sellerId?.city || ''}</p>
              </div>
              <div className="flex items-end">
                <Link to={`/auction-manager/view-bids/${car._id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">View Bids</Link>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}