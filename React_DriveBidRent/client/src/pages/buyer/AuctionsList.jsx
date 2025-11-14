import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CarCard from './components/CarCard';
import { getAuctions, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function AuctionsList() {
  const [auctions, setAuctions] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get('search') || '';
  const condition = searchParams.get('condition') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const transmission = searchParams.get('transmission') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    console.log('Search params updated:', {
      search,
      condition, 
      fuelType,
      transmission,
      minPrice,
      maxPrice
    });
    fetchAuctions();
    fetchWishlist();
  }, [searchParams]);

  const fetchAuctions = async () => {
    try {
      // Create filters object from search params
      const filters = {
        search,
        condition,
        fuelType,
        transmission,
        minPrice,
        maxPrice
      };
      
      console.log('Fetching auctions with filters:', filters);
      const data = await getAuctions(filters);
      console.log('Received auctions data:', data);
      
      setAuctions(data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
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

  const resetFilters = () => {
    setSearchParams({});
  };

  if (loading) return <div className="text-center py-10">Loading auctions...</div>;

  return (
    <section className="auctions">
      {/* Page Header */}
      <div className="page-header">
        <h1>Available Auctions</h1>
        <p>Find your dream car at the best price through our transparent auction system</p>
      </div>

      {/* Filters Section */}
      <div className="search-filter">
        <h3>Filter Auctions</h3>
        <form onSubmit={handleFilterSubmit}>
          <input type="hidden" name="page" value="auctions" />
          
          <div className="form-group">
            <label htmlFor="search">Search by Name</label>
            <input 
              type="text" 
              id="search" 
              name="search" 
              placeholder="Search for vehicles..." 
              defaultValue={search}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select id="condition" name="condition" defaultValue={condition}>
              <option value="">All Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="fuelType">Fuel Type</label>
            <select id="fuelType" name="fuelType" defaultValue={fuelType}>
              <option value="">All Types</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="transmission">Transmission</label>
            <select id="transmission" name="transmission" defaultValue={transmission}>
              <option value="">All Types</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="minPrice">Min Price (₹)</label>
            <input 
              type="number" 
              id="minPrice" 
              name="minPrice" 
              placeholder="Min Price" 
              min="0"
              defaultValue={minPrice}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxPrice">Max Price (₹)</label>
            <input 
              type="number" 
              id="maxPrice" 
              name="maxPrice" 
              placeholder="Max Price" 
              min="0"
              defaultValue={maxPrice}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="apply-btn">Apply Filters</button>
            <button type="button" className="clear-btn" onClick={resetFilters}>
              Clear All
            </button>
          </div>
        </form>
      </div>

      {/* Results Count */}
      <div className="results-count">
        {auctions.length} {auctions.length === 1 ? 'auction' : 'auctions'} found
      </div>

      {/* Auctions Grid */}
      <div className="card-container">
        {auctions.length > 0 ? (
          auctions.map(auction => (
            <CarCard 
              key={auction._id} 
              item={auction} 
              type="auction"
              isInWishlist={wishlist.auctions?.some(item => item._id === auction._id)}
              onToggleWishlist={() => toggleWishlist(auction._id, 'auction')}
            />
          ))
        ) : (
          <div className="no-results">
            <p>No auctions found matching your criteria.</p>
            <button 
              onClick={resetFilters}
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