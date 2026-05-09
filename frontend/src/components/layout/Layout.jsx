import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/projects',  label: 'Projects',  icon: FolderIcon },
  { to: '/tasks',     label: 'My Tasks',  icon: CheckIcon },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#16161e] border-r border-[#2a2a3a] 
        flex flex-col transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display text-lg font-700 text-[#e8e8f0]">ProjectFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/20' 
                  : 'text-[#8888a8] hover:text-[#e8e8f0] hover:bg-[#2a2a3a]'
                }
              `}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c27]">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e8e8f0] truncate">{user?.name}</p>
              <p className="text-xs text-[#8888a8] truncate">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1 text-[#8888a8] hover:text-red-400 transition-colors" title="Logout">
              <LogoutIcon size={16} />
            </button>
          </div>
          {isAdmin && (
            <div className="mt-2">
              <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs">
                ⚡ Admin
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-[#16161e] border-b border-[#2a2a3a]">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-[#8888a8] hover:text-[#e8e8f0]">
            <MenuIcon size={20} />
          </button>
          <span className="font-display font-bold text-[#e8e8f0]">ProjectFlow</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ─── Inline Icons ─────────────────────────────────────────────────────────────
function GridIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function FolderIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>;
}
function CheckIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
}
function LogoutIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function MenuIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
