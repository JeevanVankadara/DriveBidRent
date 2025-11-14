import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CarCard from './components/CarCard';
import { getRentals, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function RentalsList() {
  const [rentals, setRentals] = useState([]);
  const [uniqueCities, setUniqueCities] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const capacity = searchParams.get('capacity') || '';
  const city = searchParams.get('city') || '';

  useEffect(() => {
    console.log('Search params updated:', {
      searchQuery,
      fuelType, 
      transmission,
      capacity,
      city
    });
    fetchRentals();
    fetchWishlist();
  }, [searchParams]);

  const fetchRentals = async () => {
    try {
      // Create filters object from search params
      const filters = {
        search: searchQuery,
        fuelType,
        transmission,
        capacity,
        city
      };
      
      console.log('Fetching rentals with filters:', filters);
      const data = await getRentals(filters);
      console.log('Received rentals data:', data);
      
      setRentals(data.rentals || []);
      setUniqueCities(data.uniqueCities || []);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (id, type) => {
    try {
      const isInWishlist = wishlist[type === 'auction' ? 'auctions' : 'rentals']?.some(item => item._id === id);
      
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

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const params = {};
    
    formData.forEach((value, key) => {
      if (value) params[key] = value;
    });
    
    console.log('Submitting filters:', params);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (loading) return <div className="text-center py-10">Loading rentals...</div>;

  return (
    <section className="rentals">
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Available Rentals</h2>
      
      {/* Search and Filter Section */}
      <div className="search-filter">
        <form onSubmit={handleFilterSubmit}>
          <input type="hidden" name="page" value="rentals" />
          
          {/* Search Input */}
          <div className="form-group">
            <label htmlFor="search">Search</label>
            <input 
              type="text" 
              id="search" 
              name="search" 
              placeholder="Vehicle name..." 
              defaultValue={searchQuery}
            />
          </div>
          
          {/* Fuel Type Filter */}
          <div className="form-group">
            <label htmlFor="fuelType">Fuel Type</label>
            <select id="fuelType" name="fuelType" defaultValue={fuelType}>
              <option value="">All Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>
          
          {/* Transmission Filter */}
          <div className="form-group">
            <label htmlFor="transmission">Transmission</label>
            <select id="transmission" name="transmission" defaultValue={transmission}>
              <option value="">All Types</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          
          {/* Capacity Filter */}
          <div className="form-group">
            <label htmlFor="capacity">Min Capacity (passengers)</label>
            <input 
              type="number" 
              id="capacity" 
              name="capacity" 
              placeholder="e.g., 4" 
              min="1" 
              defaultValue={capacity}
            />
          </div>
          
          {/* City Filter */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <select id="city" name="city" defaultValue={city}>
              <option value="">All Cities</option>
              {uniqueCities.map(cityOption => (
                <option key={cityOption} value={cityOption}>
                  {cityOption}
                </option>
              ))}
            </select>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button type="submit" className="apply-btn">Apply Filters</button>
            <button 
              type="button" 
              onClick={clearFilters}
              className="clear-btn"
            >
              Clear All
            </button>
          </div>
        </form>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {rentals.length} {rentals.length === 1 ? 'vehicle' : 'vehicles'} found
      </div>

      {/* Rentals Grid */}
      <div className="card-container">
        {rentals.length > 0 ? (
          rentals.map(rental => (
            <CarCard 
              key={rental._id} 
              item={rental} 
              type="rental"
              isInWishlist={wishlist.rentals?.some(item => item._id === rental._id)}
              onToggleWishlist={() => toggleWishlist(rental._id, 'rental')}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No rentals found matching your criteria.</p>
            <button 
              onClick={clearFilters}
              className="details-btn" 
              style={{ marginTop: '1rem', display: 'inline-block' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}