// client/src/pages/auctionManager/ApprovedCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from '../components/LoadingSpinner';
import './AuctionManagerDashboard.css';

export default function ApprovedCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | not-started | ongoing | ended | reauction

  useEffect(() => {
    const fetchCars = async () => {
      console.log('🔍 [Frontend - ApprovedCars] Fetching approved cars assigned to this auction manager...');
      try {
        setLoading(true);
        const res = await auctionManagerServices.getApproved();
        const responseData = res.data || res;
        
        console.log('📦 [Frontend - ApprovedCars] API response:', responseData);
        
        if (responseData.success) {
          console.log('✅ [Frontend - ApprovedCars] Loaded', responseData.data?.length || 0, 'approved cars assigned to me');
          setCars(responseData.data || []);
        } else {
          console.log('❌ [Frontend - ApprovedCars] Failed:', responseData.message);
          setError(responseData.message || 'Failed to load approved cars');
        }
      } catch (err) {
        console.error('❌ [Frontend - ApprovedCars] Error:', err);
        setError(err.response?.data?.message || 'Failed to load approved cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const startAuction = async (id) => {
    console.log('🚀 [Frontend - ApprovedCars] Starting auction for car:', id);
    try {
      const res = await auctionManagerServices.startAuction(id);
      const responseData = res.data || res;
      
      console.log('📦 [Frontend - ApprovedCars] Start auction response:', responseData);
      
      if (responseData.success) {
        console.log('✅ [Frontend - ApprovedCars] Auction started successfully');
        setCars(cars.map(car => car._id === id ? { ...car, started_auction: 'yes' } : car));
        alert('Auction started successfully!');
      } else {
        console.log('❌ [Frontend - ApprovedCars] Failed to start auction:', responseData.message);
        alert(responseData.message || 'Failed to start auction');
      }
    } catch (err) {
      console.error('❌ [Frontend - ApprovedCars] Error starting auction:', err);
      alert(err.response?.data?.message || 'Failed to start auction');
    }
  };

  const reAuctionCar = async (id) => {
    if (!window.confirm('Are you sure you want to re-auction this car? The buyer will be reported to admin.')) return;
    
    console.log('🔄 [Frontend - ApprovedCars] Re-auctioning car:', id);
    try {
      const res = await auctionManagerServices.reAuction(id);
      const responseData = res.data || res;
      
      console.log('📦 [Frontend - ApprovedCars] Re-auction response:', responseData);
      
      if (responseData.success) {
        console.log('✅ [Frontend - ApprovedCars] Car re-auctioned successfully');
        // Refresh the car list
        setCars(cars.map(car => 
          car._id === id 
            ? { ...car, started_auction: 'yes', auction_stopped: false, paymentFailed: true, isReauctioned: true } 
            : car
        ));
        alert('Car re-auctioned successfully! Buyer has been reported to admin.');
      } else {
        console.log('❌ [Frontend - ApprovedCars] Failed to re-auction:', responseData.message);
        alert(responseData.message || 'Failed to re-auction');
      }
    } catch (err) {
      console.error('❌ [Frontend - ApprovedCars] Error re-auctioning:', err);
      alert(err.response?.data?.message || 'Failed to re-auction');
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

  // Check if car is eligible for re-auction (payment deadline passed and payment not completed)
  const isReauctionEligible = (car) => {
    if (!car.paymentDeadline || !car.auction_stopped) return false;
    const now = new Date();
    const deadline = new Date(car.paymentDeadline);
    return now > deadline && !car.paymentFailed; // eligible if deadline passed and not yet re-auctioned
  };

  const notStartedCars = cars.filter(c => (c.started_auction === 'no') && matchesSearch(c));
  const ongoingCars = cars.filter(c => (c.started_auction === 'yes' && !c.auction_stopped) && matchesSearch(c));
  const endedCars = cars.filter(c => ((c.auction_stopped === true) || c.started_auction === 'ended') && !isReauctionEligible(c) && matchesSearch(c));
  const reauctionCars = cars.filter(c => isReauctionEligible(c) && matchesSearch(c));

  // helper to determine status string for a car
  const getCarStatus = (c) => {
    if (isReauctionEligible(c)) return 'reauction';
    if (c.started_auction === 'no' || !c.started_auction) return 'not-started';
    if (c.started_auction === 'yes' && !c.auction_stopped) return 'ongoing';
    return 'ended';
  };

  // helper to determine display tag for a car
  const getCarTag = (c) => {
    // If car has been re-auctioned and auction ended, show "Auction completed"
    if (c.isReauctioned && c.auction_stopped) {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // If car is currently being re-auctioned (ongoing or waiting), show "Re-auction"
    if (c.isReauctioned) {
      return { text: 'Re-auction', color: 'bg-purple-100 text-purple-800' };
    }
    // Regular auction ended
    if (c.auction_stopped || c.started_auction === 'ended') {
      return { text: 'Auction completed', color: 'bg-gray-100 text-gray-800' };
    }
    // Regular auction ongoing (first time)
    if (c.started_auction === 'yes') {
      return { text: 'Approved', color: 'bg-green-100 text-green-800' };
    }
    // Not started yet
    return { text: 'Pending Start', color: 'bg-yellow-100 text-yellow-800' };
  };

  // combined filtered list used when statusFilter is 'all'
  const filteredCars = cars
    .filter(matchesSearch)
    .filter(c => (statusFilter === 'all' ? true : getCarStatus(c) === statusFilter))
    .sort((a, b) => {
      // desired order: reauction, not-started, ongoing, ended
      const order = { 'reauction': 0, 'not-started': 1, 'ongoing': 2, 'ended': 3 };
      return order[getCarStatus(a)] - order[getCarStatus(b)];
    });

  if (loading) return <LoadingSpinner />;

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
    <div className="pt-8 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="manager-page-header">
          <h1 className="manager-page-title">Approved Cars</h1>
          <p className="manager-page-subtitle">Manage and monitor approved vehicles and live auctions</p>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="manager-section mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by car, seller or location..."
                className="manager-form-input flex-1"
              />
              <button
                onClick={() => setSearch('')}
                className="manager-btn-secondary px-4 py-2"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="manager-form-label mb-0 whitespace-nowrap">Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="manager-form-select flex-1"
              >
                <option value="all">All (Grouped)</option>
                <option value="reauction">Re-auction ({reauctionCars.length})</option>
                <option value="not-started">Yet to start</option>
                <option value="ongoing">Ongoing</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>
        </div>

      {statusFilter === 'all' ? (
        // combined list ordered: yet-to-start, ongoing, ended
        <section className="manager-section">
          <h3 className="manager-section-title text-2xl mb-6">All Approved Cars ({filteredCars.length})</h3>
          {filteredCars.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🎯</div>
              <p className="manager-empty-text">No cars found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCars.map(car => (
                <div key={car._id} className="manager-vehicle-card flex-row" style={{flexDirection: 'row', height: 'auto'}}>
                  <div className="w-1/3 min-w-[200px] overflow-hidden">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="manager-vehicle-title text-xl mb-0">{car.vehicleName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCarTag(car).color}`}>
                          {getCarTag(car).text}
                        </span>
                      </div>
                      <div className="manager-vehicle-info space-y-2">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-vehicle-info-value">
                            {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || ''}</span>
                        </div>
                      </div>
                    </div>
                    {getCarStatus(car) === 'reauction' ? (
                      <button onClick={() => reAuctionCar(car._id)} className="manager-btn-danger text-center block mt-4">Re-Auction</button>
                    ) : getCarStatus(car) === 'not-started' ? (
                      <button onClick={() => startAuction(car._id)} className="manager-btn-primary text-center block mt-4">Start Auction</button>
                    ) : (
                      <Link to={`/auctionmanager/view-bids/${car._id}`} className="manager-btn-success text-center block mt-4">View Bids</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="manager-section">
          <h3 className="manager-section-title text-2xl mb-6">
            {statusFilter === 'reauction' ? `Re-auction Required (${reauctionCars.length})` : statusFilter === 'not-started' ? `Yet to Start (${notStartedCars.length})` : statusFilter === 'ongoing' ? `Ongoing (${ongoingCars.length})` : `Ended (${endedCars.length})`}
          </h3>
          {statusFilter === 'reauction' && (reauctionCars.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🔄</div>
              <p className="manager-empty-text">No cars in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reauctionCars.map(car => (
                <div key={car._id} className="manager-vehicle-card flex-row border-2 border-red-300" style={{flexDirection: 'row', height: 'auto'}}>
                  <div className="w-1/3 min-w-[200px] overflow-hidden">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="manager-vehicle-title text-xl mb-0">{car.vehicleName}</h3>
                        <span className="manager-badge manager-badge-error text-xs">⚠ PAYMENT EXPIRED</span>
                      </div>
                      <div className="manager-vehicle-info space-y-2 text-sm">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-vehicle-info-value">
                            {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || ''}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => reAuctionCar(car._id)} className="manager-btn-danger text-center block mt-4">Re-Auction</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'not-started' && (notStartedCars.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🚀</div>
              <p className="manager-empty-text">No cars in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {notStartedCars.map(car => (
                <div key={car._id} className="manager-vehicle-card flex-row" style={{flexDirection: 'row', height: 'auto'}}>
                  <div className="w-1/3 min-w-[200px] overflow-hidden">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="manager-vehicle-title text-xl mb-0">{car.vehicleName}</h3>
                        <span className="manager-badge manager-badge-warning text-xs">PENDING START</span>
                      </div>
                      <div className="manager-vehicle-info space-y-2 text-sm">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-vehicle-info-value">
                            {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || ''}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => startAuction(car._id)} className="manager-btn-primary text-center block mt-4">Start Auction</button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'ongoing' && (ongoingCars.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">🎯</div>
              <p className="manager-empty-text">No cars in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingCars.map(car => (
                <div key={car._id} className="manager-vehicle-card flex-row" style={{flexDirection: 'row', height: 'auto'}}>
                  <div className="w-1/3 min-w-[200px] overflow-hidden relative">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                    <span className="manager-badge manager-badge-success absolute top-3 left-3 text-xs animate-pulse">🔴 LIVE</span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="manager-vehicle-title text-xl mb-3">{car.vehicleName}</h3>
                      <div className="manager-vehicle-info space-y-2 text-sm">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-vehicle-info-value">
                            {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || ''}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/auctionmanager/view-bids/${car._id}`} className="manager-btn-success text-center block mt-4">View Bids</Link>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {statusFilter === 'ended' && (endedCars.length === 0 ? (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">✓</div>
              <p className="manager-empty-text">No cars in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {endedCars.map(car => (
                <div key={car._id} className="manager-vehicle-card flex-row" style={{flexDirection: 'row', height: 'auto'}}>
                  <div className="w-1/3 min-w-[200px] overflow-hidden">
                    <img src={car.vehicleImage} alt={car.vehicleName} className="manager-vehicle-image h-full" />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h3 className="manager-vehicle-title text-xl mb-0">{car.vehicleName}</h3>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">COMPLETED</span>
                      </div>
                      <div className="manager-vehicle-info space-y-2 text-sm">
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Condition:</span>
                          <span className="manager-vehicle-info-value">
                            {car.condition ? (car.condition.charAt(0).toUpperCase() + car.condition.slice(1)) : ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Seller:</span>
                          <span className="manager-vehicle-info-value">
                            {car.sellerId?.firstName || ''} {car.sellerId?.lastName || ''}
                          </span>
                        </div>
                        <div className="manager-vehicle-info-item">
                          <span className="manager-vehicle-info-label">Location:</span>
                          <span className="manager-vehicle-info-value">{car.sellerId?.city || ''}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/auctionmanager/view-bids/${car._id}`} className="manager-btn-secondary text-center block mt-4">View Results</Link>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}
      </div>
    </div>
  );
}