import { useState, useEffect } from 'react';
import { taskService, projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUS_STYLES = {
  'Todo':        'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Completed':   'bg-green-500/10 text-green-400 border-green-500/20',
};
const PRIORITY_STYLES = {
  'Low':    'bg-blue-500/10 text-blue-400',
  'Medium': 'bg-amber-500/10 text-amber-400',
  'High':   'bg-red-500/10 text-red-400',
};

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', projectId: '' });

  const fetchTasks = () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.projectId) params.projectId = filters.projectId;

    taskService.getAll(params)
      .then(({ data }) => setTasks(data.tasks))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    projectService.getAll().then(({ data }) => setProjects(data.projects)).catch(() => {});
  }, [filters]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await taskService.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalCount = tasks.length;
  const overdueCount = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#e8e8f0]">Tasks</h1>
        <p className="text-[#8888a8] mt-0.5">
          {totalCount} task{totalCount !== 1 ? 's' : ''}
          {overdueCount > 0 && <span className="text-red-400 ml-2">· {overdueCount} overdue</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input w-auto text-sm py-2"
          value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          <option>Todo</option><option>In Progress</option><option>Completed</option>
        </select>
        <select className="input w-auto text-sm py-2"
          value={filters.projectId} onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        {(filters.status || filters.projectId) && (
          <button onClick={() => setFilters({ status: '', projectId: '' })}
            className="text-sm text-[#8888a8] hover:text-[#e8e8f0] transition-colors px-3 py-2 rounded-xl border border-[#2a2a3a] hover:bg-[#2a2a3a]">
            Clear filters ×
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-[#e8e8f0] font-semibold text-lg mb-1">No tasks found</h2>
          <p className="text-[#8888a8]">
            {filters.status || filters.projectId
              ? 'Try adjusting your filters.'
              : isAdmin
              ? 'Create tasks from a project page.'
              : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed';
            return (
              <div key={task._id} className={`card p-4 hover:border-[#3a3a50] transition-all flex items-start gap-4 ${isOverdue ? 'border-red-500/20' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  task.status === 'Completed' ? 'bg-green-400' :
                  task.status === 'In Progress' ? 'bg-amber-400' : 'bg-slate-400'
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className={`font-medium ${task.status === 'Completed' ? 'line-through text-[#8888a8]' : 'text-[#e8e8f0]'}`}>
                        {task.title}
                      </h3>
                      {task.description && <p className="text-sm text-[#8888a8] mt-0.5 line-clamp-1">{task.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge border ${STATUS_STYLES[task.status] || ''}`}>{task.status}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#8888a8]">
                    {task.projectId && (
                      <Link to={`/projects/${task.projectId._id}`} className="text-brand-400 hover:text-brand-300 transition-colors">
                        📁 {task.projectId.title}
                      </Link>
                    )}
                    {task.assignedTo && (
                      <span className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs">
                          {task.assignedTo.name?.[0]?.toUpperCase()}
                        </div>
                        {task.assignedTo.name}
                      </span>
                    )}
                    {task.priority && (
                      <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                    )}
                    {task.dueDate && (
                      <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                        {isOverdue ? '🔥 ' : '📅 '}Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.status !== 'Completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-xs bg-[#2a2a3a] border border-[#3a3a50] rounded-lg px-2 py-1 text-[#e8e8f0] cursor-pointer focus:outline-none focus:border-brand-500">
                      <option>Todo</option><option>In Progress</option><option>Completed</option>
                    </select>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(task._id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors p-1">✕</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
