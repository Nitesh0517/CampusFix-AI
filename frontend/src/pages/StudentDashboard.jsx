import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  ClipboardList, Clock, Wrench, CheckCircle2, PlusCircle, 
  ArrowUpRight, AlertCircle, Sparkles, ExternalLink, Activity, Award
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const STATUS_COLORS = {
  'Submitted': '#f59e0b',
  'Under Review': '#0ea5e9',
  'In Progress': '#6366f1',
  'Resolved': '#10b981',
  'Rejected': '#f43f5e',
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints?my_only=true');
        setComplaints(res.data);
      } catch (err) {
        console.error('Failed to load student complaints', err);
        setError('Failed to load your complaints.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Compute metrics
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  // Status Chart Data
  const chartData = [
    { name: 'Submitted', value: complaints.filter(c => c.status === 'Submitted').length },
    { name: 'Under Review', value: complaints.filter(c => c.status === 'Under Review').length },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved },
  ].filter(d => d.value > 0);

  // Fallback demo chart data if student just joined
  const activeChartData = chartData.length > 0 ? chartData : [
    { name: 'Under Review', value: 1 },
    { name: 'In Progress', value: 1 },
    { name: 'Resolved', value: 2 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Student Facility Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hello, {user?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl">
              Track your reported campus issues in real-time or file a new problem ticket with automatic AI categorization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-indigo-900 font-bold text-sm shadow-md flex items-center gap-2 transition-all active:scale-98"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Report Issue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Filed</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{total}</div>
          <div className="text-[11px] text-slate-500 font-medium">All logged requests</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{pending}</div>
          <div className="text-[11px] text-amber-600 font-medium">Awaiting facility dispatch</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{inProgress}</div>
          <div className="text-[11px] text-indigo-600 font-medium">Technicians on site</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{resolved}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Verified & completed</div>
        </div>
      </div>

      {/* Main Grid: Recent Complaints + Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Complaints</h2>
              <p className="text-xs text-slate-500">Your latest campus reports and real-time status</p>
            </div>
            <Link
              to="/tracking"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading your complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">No complaints reported yet</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Notice an issue with Wi-Fi, classroom equipment, water supply, or mess food? File your first report.
              </p>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Report Campus Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to={`/complaints/${c.id}`}
                  className="block p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 transition-all hover:border-slate-300 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600">
                          {c.ticket_number}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {c.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {c.title}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={c.status} size="sm" />
                      <PriorityBadge priority={c.priority} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/50">
                    <span className="truncate">📍 {c.campus_location} {c.building_block ? `• ${c.building_block}` : ''}</span>
                    <span className="flex-shrink-0 text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution Chart + Resolution Stats */}
        <div className="space-y-6">
          {/* Status Doughnut Chart */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Status Overview</h3>
            <p className="text-xs text-slate-500">Distribution of your filed tickets</p>

            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">{total || 4}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tickets</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
              {['Submitted', 'Under Review', 'In Progress', 'Resolved'].map((st) => (
                <div key={st} className="flex items-center gap-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: STATUS_COLORS[st] }}
                  ></span>
                  <span className="text-slate-600 truncate">{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Resolution SLA Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Award className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold">Campus SLA Commitment</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hazardous and urgent complaints are escalated directly to facility on-duty engineers within <strong>30 minutes</strong>.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700">
              ✓ 24x7 Emergency electrical & plumbing response
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
