import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, taskService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';

const STATUS_COLUMNS = ['Todo', 'In Progress', 'Completed'];

const STATUS_STYLES = {
  'Todo':        { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  'In Progress': { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  'Completed':   { badge: 'bg-green-500/10 text-green-400 border-green-500/20', dot: 'bg-green-400' },
};

const PRIORITY_STYLES = {
  'Low':    'bg-blue-500/10 text-blue-400',
  'Medium': 'bg-amber-500/10 text-amber-400',
  'High':   'bg-red-500/10 text-red-400',
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('board');

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ projectId: id }),
      ]);
      setProject(projRes.data.project);
      setTasks(taskRes.data.tasks);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    if (isAdmin) authService.getUsers().then(({ data }) => setAllUsers(data.users)).catch(() => {});
  }, [id, isAdmin]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const { data } = await taskService.update(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectService.addMember(id, userId);
      const { data } = await projectService.getById(id);
      setProject(data.project);
      toast.success('Member added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectService.removeMember(id, userId);
      const { data } = await projectService.getById(id);
      setProject(data.project);
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member'); }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return <div className="text-center py-16 text-[#8888a8]">Project not found.</div>;

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const nonMembers = allUsers.filter(u => !project.members.some(m => m._id === u._id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="text-sm text-[#8888a8] hover:text-brand-400 transition-colors">← Projects</Link>
          <h1 className="font-display text-2xl font-bold text-[#e8e8f0] mt-1">{project.title}</h1>
          {project.description && <p className="text-[#8888a8] mt-1">{project.description}</p>}
        </div>
        {isAdmin && (
          <button onClick={() => { setEditingTask(null); setShowTaskModal(true); }} className="btn-primary flex-shrink-0 flex items-center gap-2">
            <span className="text-lg leading-none">+</span> Add Task
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#16161e] rounded-xl w-fit border border-[#2a2a3a]">
        {['board', 'members'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
              ${activeTab === tab ? 'bg-brand-600 text-white' : 'text-[#8888a8] hover:text-[#e8e8f0]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="grid md:grid-cols-3 gap-4">
          {STATUS_COLUMNS.map(status => (
            <div key={status} className="card p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].dot}`} />
                <span className="font-medium text-[#e8e8f0] text-sm">{status}</span>
                <span className="ml-auto text-xs text-[#8888a8] bg-[#2a2a3a] px-2 py-0.5 rounded-full">
                  {tasksByStatus[status].length}
                </span>
              </div>

              <div className="space-y-3 min-h-[120px]">
                {tasksByStatus[status].map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isAdmin}
                    currentUser={user}
                    onStatusChange={handleStatusChange}
                    onEdit={() => { setEditingTask(task); setShowTaskModal(true); }}
                    onDelete={() => handleDeleteTask(task._id)}
                  />
                ))}
                {tasksByStatus[status].length === 0 && (
                  <div className="text-center py-6 text-[#8888a8] text-sm opacity-50">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="font-semibold text-[#e8e8f0] mb-4">Current Members ({project.members.length})</h2>
            <div className="space-y-3">
              {project.members.map(m => (
                <div key={m._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {m.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#e8e8f0]">{m.name}</p>
                    <p className="text-xs text-[#8888a8]">{m.email}</p>
                  </div>
                  <span className={`badge text-xs ${m.role === 'Admin' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {m.role}
                  </span>
                  {isAdmin && project.createdBy?._id !== m._id && (
                    <button onClick={() => handleRemoveMember(m._id)} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isAdmin && nonMembers.length > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-[#e8e8f0] mb-4">Add Members</h2>
              <div className="space-y-3">
                {nonMembers.map(u => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#2a2a3a] flex items-center justify-center text-[#8888a8] font-semibold flex-shrink-0">
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#e8e8f0]">{u.name}</p>
                      <p className="text-xs text-[#8888a8]">{u.role}</p>
                    </div>
                    <button onClick={() => handleAddMember(u._id)} className="btn-primary text-xs py-1.5 px-3">Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          project={project}
          task={editingTask}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={() => { setShowTaskModal(false); setEditingTask(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, isAdmin, currentUser, onStatusChange, onEdit, onDelete }) {
  const isOwn = task.assignedTo?._id === currentUser?._id;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'Completed';

  return (
    <div className={`p-3 rounded-xl bg-[#16161e] border ${isOverdue ? 'border-red-500/30' : 'border-transparent'} hover:border-[#2a2a3a] transition-all`}>
      <p className="text-sm font-medium text-[#e8e8f0] mb-2">{task.title}</p>
      {task.description && <p className="text-xs text-[#8888a8] mb-2 line-clamp-2">{task.description}</p>}

      <div className="flex flex-wrap gap-1.5 mb-2">
        {task.priority && (
          <span className={`badge text-xs ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
        )}
        {isOverdue && <span className="badge text-xs bg-red-500/10 text-red-400">Overdue</span>}
      </div>

      {task.assignedTo && (
        <div className="flex items-center gap-1.5 mb-2 text-xs text-[#8888a8]">
          <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs flex-shrink-0">
            {task.assignedTo.name?.[0]?.toUpperCase()}
          </div>
          {task.assignedTo.name}
        </div>
      )}

      {task.dueDate && (
        <p className={`text-xs mb-2 ${isOverdue ? 'text-red-400' : 'text-[#8888a8]'}`}>
          Due {format(new Date(task.dueDate), 'MMM d')}
        </p>
      )}

      <div className="flex items-center gap-1 mt-2">
        {(isAdmin || isOwn) && task.status !== 'Completed' && (
          <button onClick={() => onStatusChange(task._id, task.status === 'Todo' ? 'In Progress' : 'Completed')}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            {task.status === 'Todo' ? 'Start →' : 'Complete ✓'}
          </button>
        )}
        {isAdmin && (
          <>
            <button onClick={onEdit} className="ml-auto text-xs text-[#8888a8] hover:text-[#e8e8f0] transition-colors">Edit</button>
            <button onClick={onDelete} className="text-xs text-red-400/50 hover:text-red-400 transition-colors ml-1">Del</button>
          </>
        )}
      </div>
    </div>
  );
}

function TaskModal({ project, task, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: project._id,
    assignedTo: task?.assignedTo?._id || '',
    status: task?.status || 'Todo',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, assignedTo: form.assignedTo || undefined, dueDate: form.dueDate || undefined };
      if (task) {
        await taskService.update(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-bold text-[#e8e8f0] mb-5">{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Task name" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Details..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Todo</option><option>In Progress</option><option>Completed</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assign To</label>
            <select className="input" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
