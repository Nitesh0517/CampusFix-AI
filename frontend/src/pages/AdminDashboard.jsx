import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { 
  Shield, AlertTriangle, Clock, Wrench, CheckCircle2, 
  Search, Filter, ArrowUpRight, User, Eye, Edit3, X, Sparkles, BarChart3, Building2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Quick Action Modal state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('');
  const [modalPriority, setModalPriority] = useState('');
  const [modalAssigned, setModalAssigned] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, anaRes] = await Promise.all([
        api.get('/complaints'),
        api.get('/analytics')
      ]);
      setComplaints(compRes.data);
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openActionModal = (c) => {
    setSelectedComplaint(c);
    setModalStatus(c.status);
    setModalPriority(c.priority);
    setModalAssigned(c.assigned_to || '');
    setModalNotes(c.resolution_notes || '');
    setModalOpen(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setModalSaving(true);
    try {
      const res = await api.patch(`/complaints/${selectedComplaint.id}/status`, {
        status: modalStatus,
        priority: modalPriority,
        assigned_to: modalAssigned || null,
        resolution_notes: modalNotes || null,
      });

      // Update in local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === selectedComplaint.id ? res.data : c))
      );
      setModalOpen(false);
      // Refresh analytics
      const anaRes = await api.get('/analytics');
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update complaint.');
    } finally {
      setModalSaving(false);
    }
  };

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch = !search.trim() || 
      c.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.campus_location.toLowerCase().includes(search.toLowerCase()) ||
      (c.student_name && c.student_name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const overview = analytics?.overview || {
    total_complaints: complaints.length,
    pending_complaints: complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length,
    high_urgency_complaints: complaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length,
    resolved_complaints: complaints.filter(c => c.status === 'Resolved').length,
    avg_resolution_hours: 14.2,
    resolution_rate_percent: 88.5
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Admin Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Facilities Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Campus Operations Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Triage inbound student complaints, coordinate estate engineering squads, and monitor campus health KPIs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analytics"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Campus Analytics Deep-Dive</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Logged</div>
          <div className="text-3xl font-black text-slate-900">{overview.total_complaints}</div>
          <div className="text-[11px] text-slate-400">Campus tickets</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Triage</div>
          <div className="text-3xl font-black text-amber-600">{overview.pending_complaints}</div>
          <div className="text-[11px] text-amber-600 font-medium">Needs assignment</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Urgent & High</div>
          <div className="text-3xl font-black text-rose-600">{overview.high_urgency_complaints}</div>
          <div className="text-[11px] text-rose-600 font-medium">Safety / Critical SLA</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</div>
          <div className="text-3xl font-black text-emerald-600">{overview.resolved_complaints}</div>
          <div className="text-[11px] text-emerald-600 font-medium">{overview.resolution_rate_percent}% success</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Avg Triage Speed</div>
          <div className="text-3xl font-black text-indigo-600">{overview.avg_resolution_hours}h</div>
          <div className="text-[11px] text-indigo-600 font-medium">Turnaround time</div>
        </div>
      </div>

      {/* Complaint Management Table & Triage Filters */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Work Orders</h2>
            <p className="text-xs text-slate-500">Assign maintenance squads and adjust ticket statuses</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ticket / student..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading operations queue...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No complaints found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Reporter</th>
                  <th className="py-3 px-3">Issue Title & Category</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned To</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 whitespace-nowrap">
                      <Link to={`/complaints/${c.id}`} className="hover:underline">
                        {c.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.student_name || 'Student'}</div>
                      <div className="text-[10px] text-slate-400">{c.student_department || 'Campus'}</div>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{c.campus_location}</div>
                      {c.building_block && (
                        <div className="text-[10px] text-slate-400">{c.building_block}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                      {c.assigned_to ? (
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {c.assigned_to}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openActionModal(c)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold transition-all inline-flex items-center gap-1"
                        title="Triage & Update Status"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Manage</span>
                      </button>
                      <Link
                        to={`/complaints/${c.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Modal for Admins */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {selectedComplaint.ticket_number}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Manage Complaint Status
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-800">Issue: </span>
              <span>{selectedComplaint.title}</span>
              <div className="mt-1 text-slate-500">
                Location: <strong>{selectedComplaint.campus_location}</strong>
              </div>
            </div>

            <form onSubmit={handleModalSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={modalPriority}
                  onChange={(e) => setModalPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assign Maintenance Team
                </label>
                <input
                  type="text"
                  value={modalAssigned}
                  onChange={(e) => setModalAssigned(e.target.value)}
                  placeholder="e.g. Estate Plumbing Division, NOC Wi-Fi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Resolution / Progress Notes
                </label>
                <textarea
                  rows={3}
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notes explaining technician action taken..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs shadow-xs transition-colors"
                >
                  {modalSaving ? 'Saving...' : 'Apply Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
