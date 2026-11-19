import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { ProgressStepper, ActivityFeed } from '../components/Timeline';
import { 
  Building2, ArrowLeft, Sparkles, MapPin, Calendar, 
  User, Shield, Wrench, MessageSquare, Star, CheckCircle2, 
  AlertTriangle, Image as ImageIcon, Send
} from 'lucide-react';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Quick Update State
  const [adminStatus, setAdminStatus] = useState('');
  const [adminPriority, setAdminPriority] = useState('');
  const [adminAssignedTo, setAdminAssignedTo] = useState('');
  const [adminResolutionNotes, setAdminResolutionNotes] = useState('');
  const [adminUpdating, setAdminUpdating] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');

  // Student Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setAdminStatus(res.data.status);
      setAdminPriority(res.data.priority);
      setAdminAssignedTo(res.data.assigned_to || '');
      setAdminResolutionNotes(res.data.resolution_notes || '');
    } catch (err) {
      console.error(err);
      setError('Could not load complaint details or access unauthorized.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    setAdminUpdating(true);
    setAdminSuccess('');
    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status: adminStatus,
        priority: adminPriority,
        assigned_to: adminAssignedTo || null,
        resolution_notes: adminResolutionNotes || null,
      });
      setComplaint(res.data);
      setAdminSuccess('Ticket status updated and logged to history!');
      setTimeout(() => setAdminSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to update complaint.');
    } finally {
      setAdminUpdating(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackSuccess('');
    try {
      const res = await api.post(`/complaints/${id}/feedback`, {
        feedback_rating: feedbackRating,
        feedback_comment: feedbackComment || null,
      });
      setComplaint(res.data);
      setFeedbackSuccess('Thank you for rating this campus resolution!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to submit feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading complaint ticket details...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="p-8 max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Complaint Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'This ticket does not exist or you lack permission to view it.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Complaints</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {complaint.ticket_number}
            </h1>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Reported {new Date(complaint.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Visual Step Progress Timeline Stepper */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Resolution Lifecycle
        </h3>
        <ProgressStepper currentStatus={complaint.status} />
      </div>

      {/* Main Grid: Details (2 col) + Sidebar Info & Actions (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description, AI Summary, Photo Evidence, Timeline History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Complaint Specification
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {complaint.category}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              {complaint.title}
            </h2>

            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>

            {/* AI Summary Banner */}
            {complaint.ai_summary && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Triage Summary:</span>
                </div>
                <p className="italic font-medium">"{complaint.ai_summary}"</p>
                {complaint.ai_suggested_priority && (
                  <div className="text-[11px] text-indigo-600 pt-1">
                    AI Auto-Triage: Categorized as <strong>{complaint.ai_suggested_category}</strong> with <strong>{complaint.ai_suggested_priority}</strong> priority.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photographic Evidence Gallery */}
          {complaint.image_url && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Photographic Evidence</span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-96 bg-slate-900/5">
                <img
                  src={complaint.image_url}
                  alt="Fault evidence"
                  className="w-full h-auto object-contain max-h-96"
                />
              </div>
            </div>
          )}

          {/* Resolution Notes (if resolved or in progress) */}
          {complaint.resolution_notes && (
            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Official Resolution Notes from Facilities Team</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {complaint.resolution_notes}
              </p>
              {complaint.resolved_at && (
                <div className="text-[11px] text-emerald-700 pt-1">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Student Feedback Card (if resolved) */}
          {complaint.status === 'Resolved' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Student Resolution Feedback</span>
                </h3>
                {complaint.feedback_rating && (
                  <span className="text-xs font-bold text-amber-600">
                    Rated {complaint.feedback_rating}/5 Stars
                  </span>
                )}
              </div>

              {complaint.feedback_rating ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= complaint.feedback_rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "{complaint.feedback_comment || 'No written feedback provided.'}"
                  </p>
                </div>
              ) : user?.id === complaint.user_id ? (
                /* Feedback submission form for the reporting student */
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Please rate the quality and timeliness of the maintenance team's repair:
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 transition-all ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-500 scale-110'
                              : 'text-slate-300 hover:text-amber-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {feedbackRating} of 5 Stars
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Optional comment on repair quality or speed..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {feedbackSuccess && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      {feedbackSuccess}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Rating</span>
                  </button>
                </form>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  Awaiting student verification and rating.
                </div>
              )}
            </div>
          )}

          {/* Activity / Timeline Audit Log */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Status Change History & Activity Stream
            </h3>
            <ActivityFeed activities={complaint.activities || []} />
          </div>
        </div>

        {/* Right Column: Location, Student Details, Admin Controls */}
        <div className="space-y-6">
          {/* Location & Metadata Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Campus Location
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-slate-400 text-[11px]">Primary Area</div>
                <div className="text-slate-900 font-bold text-sm mt-0.5">
                  📍 {complaint.campus_location}
                </div>
              </div>

              {complaint.building_block && (
                <div>
                  <div className="text-slate-400 text-[11px]">Block / Wing / Room</div>
                  <div className="text-slate-800 font-semibold mt-0.5">
                    {complaint.building_block}
                  </div>
                </div>
              )}

              <div>
                <div className="text-slate-400 text-[11px]">Assigned Division</div>
                <div className="text-indigo-700 font-semibold mt-0.5 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{complaint.assigned_to || 'Pending Assignment'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reporter Details Card */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Reporting Student
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-100">
                {complaint.student_name ? complaint.student_name.charAt(0) : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {complaint.student_name || 'Campus Student'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {complaint.student_department || 'Student'}
                </div>
              </div>
            </div>
            {complaint.student_id && (
              <div className="text-xs text-slate-500 pt-1">
                Student ID: <span className="font-mono text-slate-700 font-semibold">{complaint.student_id}</span>
              </div>
            )}
          </div>

          {/* Admin Management Panel (If logged in as Admin) */}
          {isAdmin && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/50 border border-purple-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
                <Shield className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-purple-950">
                  Administrator Actions
                </h3>
              </div>

              {adminSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {adminSuccess}
                </div>
              )}

              <form onSubmit={handleAdminUpdate} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Update Status
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
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
                  <label className="block font-bold text-slate-700 mb-1">
                    Urgency / Priority
                  </label>
                  <select
                    value={adminPriority}
                    onChange={(e) => setAdminPriority(e.target.value)}
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
                    Assign Maintenance Team / Staff
                  </label>
                  <input
                    type="text"
                    value={adminAssignedTo}
                    onChange={(e) => setAdminAssignedTo(e.target.value)}
                    placeholder="e.g. CC Network Operations, Estate Plumbing"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Resolution / Progress Notes
                  </label>
                  <textarea
                    rows={3}
                    value={adminResolutionNotes}
                    onChange={(e) => setAdminResolutionNotes(e.target.value)}
                    placeholder="Action taken, replacement parts, technician dispatched..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminUpdating}
                  className="w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  {adminUpdating ? 'Updating...' : 'Save & Publish Update'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
