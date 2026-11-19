import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useAuth } from '../context/AuthContext';
import { Menu, X, PlusCircle, Search, Shield, User } from 'lucide-react';

export const DashboardLayout = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, isAdmin, quickLogin } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = async () => {
    const targetRole = isAdmin ? 'student' : 'admin';
    await quickLogin(targetRole);
    navigate(targetRole === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
        mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="absolute top-4 right-3">
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onClose={() => setMobileDrawerOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>CampusFix AI</span>
              <span>/</span>
              <span className="text-slate-900 capitalize">{isAdmin ? 'Admin Console' : 'Student Portal'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch role pill for judges */}
            <button
              onClick={handleRoleToggle}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
              title="Quickly switch between Student and Admin perspective"
            >
              {isAdmin ? (
                <>
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Switch to Student</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-violet-600" />
                  <span>Switch to Admin</span>
                </>
              )}
            </button>

            {!isAdmin && (
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all active:scale-98"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Issue</span>
              </Link>
            )}

            <NotificationsDropdown />

            <div className="h-5 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isAdmin ? 'bg-violet-600' : 'bg-indigo-600'
              }`}>
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'User'}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role || 'student'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
