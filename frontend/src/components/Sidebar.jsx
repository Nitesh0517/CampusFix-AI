import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, PlusCircle, ClipboardList, BarChart3, 
  Building2, Sparkles, LogOut, Shield, User, CloudCheck, ExternalLink
} from 'lucide-react';

export const Sidebar = ({ onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = isAdmin
    ? [
        { name: 'Overview', to: '/admin', icon: LayoutDashboard },
        { name: 'All Complaints', to: '/tracking', icon: ClipboardList },
        { name: 'Campus Analytics', to: '/analytics', icon: BarChart3 },
      ]
    : [
        { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Report Issue', to: '/report', icon: PlusCircle },
        { name: 'My Complaints', to: '/tracking', icon: ClipboardList },
        { name: 'Campus Analytics', to: '/analytics', icon: BarChart3 },
      ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 h-full flex flex-col justify-between select-none">
      <div>
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 tracking-tight text-base">CampusFix</span>
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">IIT Bombay Techfest</div>
            </div>
          </Link>
        </div>

        {/* User Profile Pill */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs ${
              isAdmin ? 'bg-violet-600' : 'bg-indigo-600'
            }`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || 'Campus User'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {isAdmin ? 'Campus Administrator' : user?.student_id || user?.department || 'Student'}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
              isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {user?.role || 'student'}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">{user?.department ? user.department.split(' ')[0] : 'IITB'}</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="px-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer & Cloud Status */}
      <div className="p-4 border-t border-slate-200/80 space-y-3">
        {/* AWS Readiness indicator */}
        <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-2 text-xs text-indigo-900">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-[11px]">AWS Ready Dual-Mode</div>
            <div className="text-[10px] text-indigo-700">Lambda & DynamoDB Ready</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
