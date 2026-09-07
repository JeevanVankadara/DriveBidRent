// client/src/pages/buyer/RentalsList.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VehicleCard from './components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getRentals, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function RentalsList() {
  const [rentals, setRentals] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL
  const searchQuery = searchParams.get('search') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const capacity = searchParams.get('capacity') || '';
  const city = searchParams.get('city') || '';

  // Debounce for real-time search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRentals();
    fetchWishlist();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, fuelType, transmission, capacity, city]);

  const fetchRentals = async () => {
    setRefreshing(true);
    try {
      const filters = {
        search: debouncedSearch,
        fuelType,
        transmission,
        capacity: capacity ? Number(capacity) : undefined,
        city
      };

      const result = await getRentals(filters);
      setRentals(result.rentals || []);
      setUniqueCities(result.uniqueCities || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      const isInWishlist = wishlist.rentals?.some(item => item._id === id);
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

  const clearFilters = () => {
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
            <label className="hub-field-label" htmlFor="rentals-search">Search Vehicle</label>
            <input
              id="rentals-search"
              type="text"
              name="search"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="e.g. Toyota Innova"
              className="hub-input"
            />
          </div>

          <div className="hub-field">
            <label className="hub-field-label" htmlFor="rentals-fuel">Fuel Type</label>
            <select
              id="rentals-fuel"
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
            <label className="hub-field-label" htmlFor="rentals-transmission">Transmission</label>
            <select
              id="rentals-transmission"
              name="transmission"
              value={transmission}
              onChange={handleInputChange}
              className="hub-select"
            >
              <option value="">All Types</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="hub-field is-narrow">
            <label className="hub-field-label" htmlFor="rentals-capacity">Min Capacity</label>
            <input
              id="rentals-capacity"
              type="number"
              name="capacity"
              value={capacity}
              onChange={handleInputChange}
              placeholder="e.g. 4"
              min="1"
              className="hub-input"
            />
          </div>

          <div className="hub-field">
            <label className="hub-field-label" htmlFor="rentals-city">City</label>
            <select
              id="rentals-city"
              name="city"
              value={city}
              onChange={handleInputChange}
              className="hub-select"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(cityOption => (
                <option key={cityOption} value={cityOption}>
                  {cityOption}
                </option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} className="hub-filter-clear">
            Clear All
          </button>
        </div>

        {/* Rentals Grid */}
        <div className="mt-6 mb-6 hub-loading-row" aria-live="polite">
          {refreshing && <span className="hub-inline-spinner" role="status" aria-label="Loading rentals" />}
          <p className="hub-result-count">
            {refreshing
              ? 'Updating results...'
              : `${rentals.length} ${rentals.length === 1 ? 'vehicle' : 'vehicles'} available`}
          </p>
        </div>

        {rentals.length === 0 ? (
          <div className="hub-empty">
            <p className="hub-text-muted text-center mb-6">No rentals found matching your criteria.</p>
            <button onClick={clearFilters} className="hub-cta">
              Clear Filters &amp; Show All
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ${refreshing ? 'hub-grid-refreshing' : ''}`} aria-busy={refreshing}>
            {rentals.map(rental => (
              <VehicleCard
                key={rental._id}
                item={rental}
                type="rental"
                returnPath="/buyer/rentals"
                isInWishlist={wishlist.rentals?.some(item => item._id === rental._id)}
                onToggleWishlist={() => toggleWishlist(rental._id, 'rental')}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}