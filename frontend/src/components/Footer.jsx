import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Sparkles, Cloud, ShieldAlert, Heart, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusFix AI</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart Campus. Smarter Solutions. A centralized autonomous complaint triage and resolution ecosystem.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-indigo-400 font-medium">
              <Cloud className="w-3.5 h-3.5" />
              AWS ShipIt Challenge • Techfest IIT Bombay
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Overview</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-indigo-400 transition-colors">Report an Issue</Link></li>
              <li><Link to="/tracking" className="hover:text-indigo-400 transition-colors">Complaint Tracking</Link></li>
              <li><Link to="/analytics" className="hover:text-indigo-400 transition-colors">Campus Analytics</Link></li>
            </ul>
          </div>

          {/* Campus Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Campus Facilities</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Hostel Maintenance & Electrical</li>
              <li>CC Network Operations & Wi-Fi</li>
              <li>Estate Water & Sanitation Works</li>
              <li>Lecture Hall Complex (LHC) AV Cell</li>
              <li>Campus Security Control Room</li>
            </ul>
          </div>

          {/* Emergency & Tech Stack */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Emergency & Cloud</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Campus Control Room
                </div>
                <div>24x7 Emergency Line: +91 22 2576 8999</div>
                <div>Ambulance / Fire: 108 / 101</div>
              </div>
              <div className="text-[11px] text-slate-400">
                Built with React, Vite, Tailwind CSS, FastAPI, SQLite/DynamoDB, and Google Gemini AI.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} CampusFix AI. Developed for AWS ShipIt Challenge, Techfest IIT Bombay.
          </div>
          <div className="flex items-center gap-2">
            <span>Engineered with excellence for smart campus infrastructure</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
