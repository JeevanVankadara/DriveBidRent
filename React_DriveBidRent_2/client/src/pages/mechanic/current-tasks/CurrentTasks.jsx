// client/src/pages/mechanic/current-tasks/CurrentTasks.jsx
import { useEffect, useState } from 'react';
import { getCurrentTasks } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CurrentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentTasks()
      .then(res => setTasks(res.data.data.assignedVehicles || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-orange-600 mb-12">Current Tasks</h1>

        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600">No vehicles assigned at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}