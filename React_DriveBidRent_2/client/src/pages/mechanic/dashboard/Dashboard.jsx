// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <p className="text-2xl text-red-600">Failed to load dashboard</p>
      </div>
    );
  }

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {showApprovalPopup && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-8 mb-12 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-amber-800 mb-4">Account Under Review</h2>
            <p className="text-lg text-gray-700 mb-6">Your profile is being verified by the admin team. You'll receive access once approved.</p>
            <button onClick={() => window.location.href = '/'} className="bg-orange-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-700 transition">
              Back to Home
            </button>
          </div>
        )}

        {/* Current Tasks */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-center text-orange-600 mb-10">Current Assignments</h2>
          {displayedVehicles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow">
              <p className="text-xl text-gray-600">No vehicles assigned at this time</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
          {displayedVehicles.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/mechanic/current-tasks" className="text-orange-600 font-bold text-lg hover:underline">
                View All Current Tasks →
              </Link>
            </div>
          )}
        </section>

        {/* Past Tasks */}
        <section>
          <h2 className="text-4xl font-bold text-center text-green-700 mb-10">Completed Inspections</h2>
          {completedTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow">
              <p className="text-xl text-gray-600">No completed tasks yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {completedTasks.slice(0, 6).map(v => <PastTaskCard key={v._id} vehicle={v} />)}
            </div>
          )}
          {completedTasks.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/mechanic/past-tasks" className="text-green-700 font-bold text-lg hover:underline">
                View All Past Tasks →
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}