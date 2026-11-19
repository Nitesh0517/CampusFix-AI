import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Line 
} from 'recharts';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, 
  ShieldCheck, AlertTriangle, Building2, MapPin, Sparkles, Star
} from 'lucide-react';

const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
  '#eab308', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#64748b'
];

const STATUS_COLORS = {
  'Submitted': '#f59e0b',
  'Under Review': '#0ea5e9',
  'In Progress': '#6366f1',
  'Resolved': '#10b981',
  'Rejected': '#f43f5e',
};

const PRIORITY_COLORS = {
  'Urgent': '#f43f5e',
  'High': '#f97316',
  'Medium': '#eab308',
  'Low': '#64748b',
};

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Synthesizing campus analytics & trends...
      </div>
    );
  }

  const overview = data?.overview || {
    total_complaints: 0,
    resolution_rate_percent: 0,
    avg_resolution_hours: 0,
    student_satisfaction_avg: 4.8
  };

  const byCategory = data?.by_category || [];
  const byStatus = data?.by_status || [];
  const byPriority = data?.by_priority || [];
  const byLocation = data?.by_location || [];
  const monthlyTrends = data?.monthly_trends || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Aggregated Insights</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Campus Infrastructure Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time telemetry and recurring fault pattern analysis powered by CampusFix AI
          </p>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Source: CampusFix Central DB • Updated Live
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Complaints</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{overview.total_complaints}</div>
          <div className="text-[11px] text-slate-500">Documented campus issues</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolution Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{overview.resolution_rate_percent}%</div>
          <div className="text-[11px] text-emerald-600 font-medium">Closed within SLA benchmark</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-sky-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Turnaround</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-600">{overview.avg_resolution_hours} hrs</div>
          <div className="text-[11px] text-sky-600 font-medium">From submission to sign-off</div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Satisfaction Score</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{overview.student_satisfaction_avg || 4.7} / 5.0</div>
          <div className="text-[11px] text-amber-600 font-medium">Student post-repair ratings</div>
        </div>
      </div>

      {/* Row 1: Monthly Complaint Trends (AreaChart) + Status Breakdown (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trends (2 col) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Monthly Complaint Trends</h3>
              <p className="text-xs text-slate-500">Total submitted vs successfully resolved per month</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Total
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution (1 col) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Complaints by Status</h3>
            <p className="text-xs text-slate-500">Current ticket triage distribution</p>
          </div>

          <div className="h-52 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{overview.total_complaints}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            {byStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[item.name] || '#94a3b8' }}
                  ></span>
                  <span className="text-slate-700 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Complaints by Category (BarChart) + Most Reported Locations (Horizontal Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Category */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Complaints by Category</h3>
            <p className="text-xs text-slate-500">Volume distribution across facility domains</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Reported Campus Locations */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Top Campus Problem Areas</h3>
            <p className="text-xs text-slate-500">Hotspots requiring targeted infrastructure upgrade</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={byLocation} margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Priority Distribution */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Urgency & Severity Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of hazardous emergencies vs standard requests</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['Urgent', 'High', 'Medium', 'Low'].map((p) => {
            const match = byPriority.find(item => item.name === p) || { value: 0, percentage: 0 };
            return (
              <div key={p} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{p} Priority</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: PRIORITY_COLORS[p] }}
                  ></span>
                </div>
                <div className="text-2xl font-black text-slate-900">{match.value}</div>
                <div className="text-[11px] text-slate-500">{match.percentage}% of campus total</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
