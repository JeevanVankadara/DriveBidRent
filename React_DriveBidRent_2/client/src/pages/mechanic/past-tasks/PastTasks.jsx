// client/src/pages/mechanic/past-tasks/PastTasks.jsx
import { useEffect, useState } from 'react';
import { getPastTasks } from '../../../services/mechanic.services';
import PastTaskCard from '../components/PastTaskCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PastTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPastTasks()
      .then(res => setTasks(res.data.data.completedTasks || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-green-700 mb-12">Past Inspections</h1>

        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow">
            <p className="text-2xl text-gray-600">No past inspections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map(v => <PastTaskCard key={v._id} vehicle={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}