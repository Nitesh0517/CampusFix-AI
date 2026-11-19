import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Sparkles, User, Shield, LogOut, 
  Menu, X, ChevronRight, BarChart3, PlusCircle, LayoutDashboard
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchLoading, setSwitchLoading] = useState(false);

  const handleQuickSwitch = async (role) => {
    setSwitchLoading(true);
    try {
      await quickLogin(role);
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSwitchLoading(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900 tracking-tight">CampusFix</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  AI
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                IIT Bombay Techfest • AWS ShipIt
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link to="/" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
              Home
            </Link>
            <a href="#how-it-works" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
              How It Works
            </a>
            <a href="#features" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
              Features
            </a>
            <a href="#impact" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors">
              Campus Impact
            </a>
            <Link to="/analytics" className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              Live Analytics
            </Link>
          </div>

          {/* Auth / Quick Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Demo Switcher Quick Pill */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium border border-slate-200">
                  <button
                    onClick={() => handleQuickSwitch('student')}
                    disabled={switchLoading}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      !isAdmin 
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Student View
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    disabled={switchLoading}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      isAdmin 
                        ? 'bg-white text-indigo-700 shadow-2xs font-semibold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Admin View
                  </button>
                </div>

                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-98"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* 1-Click Demo Buttons for Reviewers */}
                <button
                  onClick={() => handleQuickSwitch('student')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Demo Student
                </button>
                <button
                  onClick={() => handleQuickSwitch('admin')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                >
                  <Shield className="w-3.5 h-3.5 text-violet-600" />
                  Demo Admin
                </button>

                <div className="h-5 w-px bg-slate-200 mx-1"></div>

                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Live Analytics
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                Go to Dashboard
              </Link>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleQuickSwitch('student')}
                  className="flex-1 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700"
                >
                  Switch to Student
                </button>
                <button
                  onClick={() => handleQuickSwitch('admin')}
                  className="flex-1 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700"
                >
                  Switch to Admin
                </button>
              </div>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickSwitch('student')}
                  className="py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  ⚡ Demo Student
                </button>
                <button
                  onClick={() => handleQuickSwitch('admin')}
                  className="py-2 text-xs font-semibold rounded-lg bg-violet-50 text-violet-700 border border-violet-200"
                >
                  ⚡ Demo Admin
                </button>
              </div>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
