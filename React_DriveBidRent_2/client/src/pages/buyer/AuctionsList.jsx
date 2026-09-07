// client/src/pages/buyer/AuctionsList.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';
import VehicleCard from './components/VehicleCard';
import { getAuctions, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuctionsList() {
  const [auctions, setAuctions] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL
  const search = searchParams.get('search') || '';
  const condition = searchParams.get('condition') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  // Debounce state for real-time search
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAuctions();
    fetchWishlist();

    // Setup Socket.io for real-time bid updates
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api', '') || 'https://drivebidrent.onrender.com';
    const socket = io(backendUrl, { withCredentials: true });

    socket.on('global_new_bid', () => {
      // silent: a bid from another user should refresh prices without
      // dimming the grid the way a filter change does
      fetchAuctions({ silent: true });
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, condition, fuelType, transmission, minPrice, maxPrice]);

  const fetchAuctions = async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const filters = {
        search: debouncedSearch,
        condition,
        fuelType,
        transmission,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      };

      const result = await getAuctions(filters);
      setAuctions(result.auctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist({
        auctions: data.auctions || [],
        rentals: data.rentals || []
      });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (id, type) => {
    try {
      const isInWishlist = wishlist.auctions?.some(item => item._id === id);

      if (isInWishlist) {
        await removeFromWishlist(id, type);
      } else {
        await addToWishlist(id, type);
      }

      fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }

    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen hub-page">

      {/* Filters + Results */}
      <section className="py-10 max-w-[1400px] mx-auto px-5 lg:px-10">

        {/* Horizontal Filter Bar */}
        <div className="hub-surface-card hub-filterbar">
          <div className="hub-field" style={{ flex: '2 1 240px' }}>
            <label className="hub-field-label" htmlFor="auctions-search">Search by Name</label>
            <input
              id="auctions-search"
              type="text"
              name="search"
              value={search}
              onChange={handleInputChange}
              placeholder="e.g. Honda Civic"
              className="hub-input"
            />
          </div>

          <div className="hub-field">
            <label className="hub-field-label" htmlFor="auctions-condition">Condition</label>
            <select
              id="auctions-condition"
              name="condition"
              value={condition}
              onChange={handleInputChange}
              className="hub-select"
            >
              <option value="">All Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>

          <div className="hub-field">
            <label className="hub-field-label" htmlFor="auctions-fuel">Fuel Type</label>
            <select
              id="auctions-fuel"
              name="fuelType"
              value={fuelType}
              onChange={handleInputChange}
              className="hub-select"
            >
              <option value="">All Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>

          <div className="hub-field">
            <label className="hub-field-label" htmlFor="auctions-transmission">Transmission</label>
            <select
              id="auctions-transmission"
              name="transmission"
              value={transmission}
              onChange={handleInputChange}
              className="hub-select"
            >
              <option value="">All Types</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>

          <div className="hub-field is-narrow">
            <label className="hub-field-label" htmlFor="auctions-min-price">Min Price</label>
            <input
              id="auctions-min-price"
              type="number"
              name="minPrice"
              value={minPrice}
              onChange={handleInputChange}
              placeholder="₹0"
              className="hub-input"
            />
          </div>

          <div className="hub-field is-narrow">
            <label className="hub-field-label" htmlFor="auctions-max-price">Max Price</label>
            <input
              id="auctions-max-price"
              type="number"
              name="maxPrice"
              value={maxPrice}
              onChange={handleInputChange}
              placeholder="₹50L"
              className="hub-input"
            />
          </div>

          <button onClick={resetFilters} className="hub-filter-clear">
            Clear All
          </button>
        </div>

        {/* Auctions Grid */}
        <div className="mt-6 mb-6 hub-loading-row" aria-live="polite">
          {refreshing && <span className="hub-inline-spinner" role="status" aria-label="Loading auctions" />}
          <p className="hub-result-count">
            {refreshing
              ? 'Updating results...'
              : `${auctions.length} ${auctions.length === 1 ? 'auction' : 'auctions'} found`}
          </p>
        </div>

        {auctions.length === 0 ? (
          <div className="hub-empty">
            <p className="hub-text-muted text-center mb-6">No auctions found matching your criteria.</p>
            <button onClick={resetFilters} className="hub-cta">
              Clear Filters &amp; Show All
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ${refreshing ? 'hub-grid-refreshing' : ''}`} aria-busy={refreshing}>
            {auctions.map(auction => (
              <VehicleCard
                key={auction._id}
                item={auction}
                type="auction"
                isInWishlist={wishlist.auctions?.some(item => item._id === auction._id)}
                onToggleWishlist={() => toggleWishlist(auction._id, 'auction')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}