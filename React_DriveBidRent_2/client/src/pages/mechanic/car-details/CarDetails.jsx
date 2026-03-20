// client/src/pages/mechanic/car-details/CarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicleDetails, submitReview } from '../../../services/mechanic.services';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function CarDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    mechanicalCondition: '',
    bodyCondition: '',
    recommendations: '',
    conditionRating: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVehicleDetails(id)
      .then(res => setData(res.data.data))
      .catch(() => {
        toast.error('Failed to load vehicle details');
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.conditionRating) {
      toast.error('Please select a star rating');
      return;
    }

    setLoading(true);

    try {
      await submitReview(id, form);
      toast.success('Inspection report submitted successfully');
      setTimeout(() => {
        window.location.href = '/mechanic/current-tasks';
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inspection report');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><LoadingSpinner /></div>;

  const { vehicle, seller } = data;

  return (
    <div className="min-h-screen font-montserrat" style={{ background: '#f8fafc' }}>
      
      {/* ── HERO — Full width image banner ── */}
      <section style={{
        position: 'relative',
        height: '400px',
        overflow: 'hidden',
        background: '#0c1220'
      }}>
        <img
          src={vehicle.vehicleImage || '/placeholder-car.jpg'}
          alt={vehicle.vehicleName}
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(12,18,32,1) 0%, rgba(12,18,32,0.4) 60%, transparent 100%)'
        }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', position: 'absolute', bottom: 48, left: 0, right: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 14px', borderRadius: 100, marginBottom: 16, backdropFilter: 'blur(4px)'
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.18em' }}>Inspection Target</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.05, marginBottom: 8 }}>
            {vehicle.vehicleName}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 18, fontWeight: 500 }}>
            {vehicle.year} • {vehicle.mileage.toLocaleString()} km • {vehicle.fuelType}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto pb-24 px-4 pt-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12">
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Vehicle Specs */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">🏎️</span>
                  Vehicle Specifications
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Year</span>
                    <span className="font-bold text-gray-900">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Mileage</span>
                    <span className="font-bold text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Condition</span>
                    <span className="font-bold text-gray-900">{vehicle.condition}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Fuel Type</span>
                    <span className="font-bold text-gray-900">{vehicle.fuelType}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Transmission</span>
                    <span className="font-bold text-gray-900">{vehicle.transmission}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Auction Date</span>
                    <span className="font-bold text-gray-900">{new Date(vehicle.auctionDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">👤</span>
                  Seller Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Name</span>
                    <span className="font-bold text-gray-900">{seller.firstName} {seller.lastName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Phone</span>
                    <span className="font-bold text-gray-900">{seller.phone}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">Location</span>
                    <span className="font-bold text-gray-900">{seller.city}, {seller.state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Section */}
            {vehicle.reviewStatus === 'completed' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-2xl font-black text-green-800">Inspection Already Completed</p>
                <p className="text-green-700 mt-2 font-medium">
                  Your review has been successfully submitted and is under manager review.
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-3xl p-8 md:p-12 bg-white shadow-sm mt-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <h3 className="text-3xl font-black text-gray-900 text-center mb-10">
                  Submit Inspection Report
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Overall Condition Rating
                    </label>
                    <select
                      required
                      value={form.conditionRating}
                      onChange={(e) => setForm({ ...form, conditionRating: e.target.value })}
                      className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-900 font-bold"
                    >
                      <option value="">Choose rating (1-5)</option>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} Star{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Mechanical Condition
                    </label>
                    <textarea
                      required
                      rows="5"
                      placeholder="Engine, transmission, brakes, suspension, electrical..."
                      className="w-full p-5 border border-gray-200 bg-gray-50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium resize-none text-gray-900"
                      value={form.mechanicalCondition}
                      onChange={(e) => setForm({ ...form, mechanicalCondition: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Body & Interior Condition
                    </label>
                    <textarea
                      required
                      rows="5"
                      placeholder="Paint, dents, interior wear, AC, lights..."
                      className="w-full p-5 border border-gray-200 bg-gray-50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium resize-none text-gray-900"
                      value={form.bodyCondition}
                      onChange={(e) => setForm({ ...form, bodyCondition: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                      Recommendations (Optional)
                    </label>
                    <textarea
                      rows="4"
                      placeholder="Suggested repairs or notes for auction manager..."
                      className="w-full p-5 border border-gray-200 bg-gray-50 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium resize-none text-gray-900"
                      value={form.recommendations}
                      onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gray-900 hover:bg-indigo-600 text-white font-bold py-5 rounded-xl text-lg transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
                      loading ? 'cursor-wait opacity-80' : ''
                    }`}
                  >
                    {loading ? 'Submitting Report...' : 'Submit Final Inspection'}
                  </button>
                </form>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}