import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, isPast } from 'date-fns';

const STATUS_COLORS = {
  'Todo':        'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Completed':   'bg-green-500/10 text-green-400 border-green-500/20',
};

const PRIORITY_COLORS = {
  'Low':    'bg-blue-500/10 text-blue-400',
  'Medium': 'bg-amber-500/10 text-amber-400',
  'High':   'bg-red-500/10 text-red-400',
};

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats()
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, recentTasks = [], tasksByProject = [] } = data || {};

  const statCards = [
    { label: 'Total Tasks',      value: stats?.tasks.total     ?? 0, color: 'text-brand-400',  icon: '📋' },
    { label: 'Completed',        value: stats?.tasks.completed ?? 0, color: 'text-green-400',  icon: '✅' },
    { label: 'In Progress',      value: stats?.tasks.inProgress?? 0, color: 'text-amber-400',  icon: '⚡' },
    { label: 'Overdue',          value: stats?.tasks.overdue   ?? 0, color: 'text-red-400',    icon: '🔥' },
    { label: 'Total Projects',   value: stats?.projects.total  ?? 0, color: 'text-purple-400', icon: '📁' },
    { label: 'Active Projects',  value: stats?.projects.active ?? 0, color: 'text-cyan-400',   icon: '🚀' },
    ...(isAdmin ? [{ label: 'Team Members', value: stats?.members ?? 0, color: 'text-pink-400', icon: '👥' }] : []),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#e8e8f0]">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[#8888a8] mt-1">Here's what's happening with your projects.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color, icon }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{icon}</span>
              <span className={`font-display text-3xl font-bold ${color}`}>{value}</span>
            </div>
            <p className="text-sm text-[#8888a8]">{label}</p>
            {label === 'Overdue' && value > 0 && (
              <div className="text-xs text-red-400 font-medium">Needs attention</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#e8e8f0]">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="text-center py-8 text-[#8888a8]">
              <p>No tasks yet.</p>
              {isAdmin && <Link to="/tasks" className="text-brand-400 text-sm mt-1 block">Create your first task</Link>}
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-start gap-3 p-3 rounded-xl bg-[#16161e] hover:bg-[#1a1a24] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e8e8f0] truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#8888a8]">{task.projectId?.title}</span>
                      {task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed' && (
                        <span className="text-xs text-red-400">Overdue</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`badge border ${STATUS_COLORS[task.status] || ''}`}>{task.status}</span>
                    {task.priority && (
                      <span className={`badge ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks by project */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-[#e8e8f0] mb-4">Tasks by Project</h2>
          {tasksByProject.length === 0 ? (
            <div className="text-center py-8 text-[#8888a8]">No project data yet.</div>
          ) : (
            <div className="space-y-4">
              {tasksByProject.map((p) => {
                const pct = p.count > 0 ? Math.round((p.completed / p.count) * 100) : 0;
                return (
                  <div key={p._id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#e8e8f0] truncate">{p.projectName || 'Untitled'}</span>
                      <span className="text-[#8888a8] flex-shrink-0">{p.completed}/{p.count}</span>
                    </div>
                    <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#8888a8] mt-0.5">{pct}% complete</p>
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
