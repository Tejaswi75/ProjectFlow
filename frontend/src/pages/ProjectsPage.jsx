import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Active':    'bg-green-500/10 text-green-400 border-green-500/20',
  'Completed': 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  'On Hold':   'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  const fetchProjects = () => {
    setLoading(true);
    projectService.getAll()
      .then(({ data }) => setProjects(data.projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) authService.getUsers().then(({ data }) => setAllUsers(data.users)).catch(() => {});
  }, [isAdmin]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}" and all its tasks?`)) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete project'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#e8e8f0]">Projects</h1>
          <p className="text-[#8888a8] mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <span className="text-lg leading-none">+</span> New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">📁</div>
          <h2 className="text-[#e8e8f0] font-semibold text-lg mb-1">No projects yet</h2>
          <p className="text-[#8888a8]">{isAdmin ? 'Create your first project to get started.' : 'You haven\'t been added to any project yet.'}</p>
          {isAdmin && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create Project</button>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project._id} className="card p-5 hover:border-[#3a3a50] transition-all duration-200 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Link to={`/projects/${project._id}`} className="font-semibold text-[#e8e8f0] hover:text-brand-400 transition-colors line-clamp-1">
                  {project.title}
                </Link>
                <span className={`badge border ${STATUS_COLORS[project.status] || ''} ml-2 flex-shrink-0`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-[#8888a8] line-clamp-2 mb-3">{project.description}</p>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 4).map((m, i) => (
                    <div key={m._id} className="w-7 h-7 rounded-full bg-brand-600 border-2 border-[#1c1c27] flex items-center justify-center text-white text-xs font-semibold"
                      style={{ zIndex: 10 - i }} title={m.name}>
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-[#2a2a3a] border-2 border-[#1c1c27] flex items-center justify-center text-xs text-[#8888a8]">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-[#8888a8]">{project.members?.length} member{project.members?.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Task progress */}
              {project.taskCount > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#8888a8] mb-1">
                    <span>Progress</span>
                    <span>{project.completedCount}/{project.taskCount} tasks</span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a3a] rounded-full">
                    <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all"
                      style={{ width: `${Math.round((project.completedCount / project.taskCount) * 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-auto flex items-center justify-between text-xs text-[#8888a8]">
                <span>By {project.createdBy?.name}</span>
                <div className="flex items-center gap-2">
                  <Link to={`/projects/${project._id}`} className="text-brand-400 hover:text-brand-300">View →</Link>
                  {isAdmin && (
                    <button onClick={() => handleDelete(project._id, project.title)} className="text-red-400/60 hover:text-red-400 transition-colors">Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          allUsers={allUsers}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchProjects(); }}
        />
      )}
    </div>
  );
}

function CreateProjectModal({ allUsers, onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', memberIds: [] });
  const [loading, setLoading] = useState(false);

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id) ? f.memberIds.filter(m => m !== id) : [...f.memberIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectService.create(form);
      toast.success('Project created!');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  const otherUsers = allUsers.filter(u => u._id !== user?._id);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-bold text-[#e8e8f0] mb-5">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="Project name" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What's this project about?"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {otherUsers.length > 0 && (
            <div>
              <label className="label">Add Members</label>
              <div className="max-h-36 overflow-y-auto space-y-2 rounded-xl border border-[#2a2a3a] p-2">
                {otherUsers.map(u => (
                  <label key={u._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#2a2a3a] cursor-pointer">
                    <input type="checkbox" checked={form.memberIds.includes(u._id)}
                      onChange={() => toggleMember(u._id)} className="accent-brand-500" />
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-[#e8e8f0]">{u.name}</p>
                      <p className="text-xs text-[#8888a8]">{u.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
