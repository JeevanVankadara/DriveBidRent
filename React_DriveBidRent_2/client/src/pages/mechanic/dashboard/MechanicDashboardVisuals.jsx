import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MechanicDashboardVisuals({ currentTasks = [], completedTasks = [] }) {
  // Compute chart data
  const dataCounts = useMemo(() => {
    let pending = 0;
    let inProgress = 0;
    
    currentTasks.forEach(task => {
      if (task.status === 'assignedMechanic') pending++;
      else inProgress++; // Any other active state is counted as in-progress
    });

    return {
      pending: pending || (currentTasks.length > 0 ? currentTasks.length : 0),
      inProgress: inProgress,
      completed: completedTasks.length
    };
  }, [currentTasks, completedTasks]);

  const chartData = {
    labels: ['Assigned (Pending)', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [dataCounts.pending, dataCounts.inProgress, dataCounts.completed],
        backgroundColor: [
          '#3b82f6', // blue-500
          '#f59e0b', // amber-500
          '#10b981', // emerald-500
        ],
        borderColor: [
          '#ffffff',
          '#ffffff',
          '#ffffff',
        ],
        borderWidth: 4,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: {
        display: false, // We'll build a custom HTML legend for better styling
      },
      tooltip: {
        backgroundColor: '#111827',
        titleFont: { family: 'Montserrat', size: 14 },
        bodyFont: { family: 'Montserrat', size: 14, weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    maintainAspectRatio: false,
  };

  // Compute timeline data (latest 5 activities)
  const timelineActivities = useMemo(() => {
    const activities = [];
    
    currentTasks.forEach(task => {
      activities.push({
        id: task._id,
        vehicleName: task.vehicleName,
        type: task.status === 'assignedMechanic' ? 'assigned' : 'in-progress',
        date: new Date(task.updatedAt || task.createdAt),
        link: `/mechanic/car-details/${task._id}`
      });
    });

    completedTasks.forEach(task => {
      activities.push({
        id: task._id,
        vehicleName: task.vehicleName,
        type: 'completed',
        date: new Date(task.mechanicReview?.reviewDate || task.updatedAt || task.createdAt),
        link: `/mechanic/past-tasks` // No detail page for past tasks, link to list
      });
    });

    // Sort by date descending and limit to 5
    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  }, [currentTasks, completedTasks]);

  const getTimeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return 'Recently';
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' min ago';
    return 'Just now';
  };

  const hasData = currentTasks.length > 0 || completedTasks.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      
      {/* ── DOUGHNUT CHART CARD ── */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg className="w-48 h-48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M11 6h2v6h-2zM11 14h2v2h-2z"/></svg>
        </div>
        
        <div className="w-full mb-8">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-sm shadow-sm">📊</span>
            Task Distribution
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Breakdown of your entire workload</p>
        </div>

        {!hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 my-10">
             <div className="w-24 h-24 rounded-full border-8 border-gray-100 mb-4"></div>
             <p className="font-bold text-gray-400">No task data available</p>
          </div>
        ) : (
          <>
            <div className="relative w-full aspect-square max-h-[220px] mb-8">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-gray-900">{currentTasks.length + completedTasks.length}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-3 gap-2">
              <div className="text-center p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-2 shadow-sm"></div>
                <div className="text-xl font-bold text-gray-900">{dataCounts.pending}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Assigned</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-2 shadow-sm"></div>
                <div className="text-xl font-bold text-gray-900">{dataCounts.inProgress}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Progress</div>
              </div>
              <div className="text-center p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-2 shadow-sm"></div>
                <div className="text-xl font-bold text-gray-900">{dataCounts.completed}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase">Done</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── RECENT ACTIVITY TIMELINE CARD ── */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col">
        <div className="w-full mb-8 flex justify-between items-end border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-sm shadow-sm">⚡</span>
              Recent Activity
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Your latest inspection events and updates</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {!hasData || timelineActivities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-300 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
               <p className="font-bold text-gray-500">No recent activity detected.</p>
               <p className="text-sm text-gray-400 mt-1">New assignments and completed inspections will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {timelineActivities.map((activity, idx) => {
                const isCompleted = activity.type === 'completed';
                const isAssigned = activity.type === 'assigned';
                
                let iconBg = 'bg-amber-100';
                let iconColor = 'text-amber-500';
                let actionText = 'In Progress';
                let ringColor = 'ring-amber-50';
                let IconSvg = <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></>;

                if (isCompleted) {
                  iconBg = 'bg-emerald-100';
                  iconColor = 'text-emerald-500';
                  actionText = 'Completed Inspection';
                  ringColor = 'ring-emerald-50';
                  IconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
                } else if (isAssigned) {
                  iconBg = 'bg-blue-100';
                  iconColor = 'text-blue-500';
                  actionText = 'Assigned Vehicle';
                  ringColor = 'ring-blue-50';
                  IconSvg = <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
                }

                return (
                  <div key={`${activity.id}-${idx}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    {/* Marker */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${iconBg} ${iconColor} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ring-4 ${ringColor} z-10 transition-transform duration-300 group-hover:scale-110`}>
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         {IconSvg}
                       </svg>
                    </div>
                    
                    {/* Card container */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${iconColor}`}>{actionText}</span>
                        <time className="text-[11px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">{getTimeAgo(activity.date)}</time>
                      </div>
                      <Link to={activity.link} className="text-base font-black text-gray-900 hover:text-orange-500 transition-colors truncate block">
                        {activity.vehicleName}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
