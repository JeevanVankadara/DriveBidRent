// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-2xl text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">

        {showApprovalPopup && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6 mb-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-amber-800 mb-3">Account Under Review</h2>
            <p className="text-sm text-gray-700 mb-4">Your profile is being verified by the admin team. You'll receive access once approved.</p>
            <button onClick={() => window.location.href = '/'} className="bg-orange-600 text-white px-6 py-2 text-sm rounded-lg font-medium hover:bg-orange-700 transition">
              Back to Home
            </button>
          </div>
        )}

        {/* Current Tasks */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Current Assignments</h2>
          {displayedVehicles.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow">
              <p className="text-base text-gray-600">No vehicles assigned at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
          {displayedVehicles.length > 0 && (
            <div className="text-center mt-6">
              <Link to="/mechanic/current-tasks" className="text-orange-600 font-semibold text-sm hover:underline">
                View All Current Tasks →
              </Link>
            </div>
          )}
        </section>

        {/* Past Tasks */}
        <section>
          <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Completed Inspections</h2>
          {completedTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow">
              <p className="text-base text-gray-600">No completed tasks yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completedTasks.slice(0, 6).map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="text-center mt-6">
              <Link to="/mechanic/past-tasks" className="text-green-700 font-semibold text-sm hover:underline">
                View All Past Tasks →
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}