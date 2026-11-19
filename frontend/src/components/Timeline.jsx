import React from 'react';
import { CheckCircle2, Clock, Wrench, AlertCircle, MessageSquare, Star } from 'lucide-react';

const STAGES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

export const ProgressStepper = ({ currentStatus }) => {
  const isRejected = currentStatus === 'Rejected';
  
  const getStageIndex = (st) => {
    switch (st) {
      case 'Submitted': return 0;
      case 'Under Review': return 1;
      case 'In Progress': return 2;
      case 'Resolved': return 3;
      default: return 0;
    }
  };

  const currentIndex = isRejected ? -1 : getStageIndex(currentStatus);

  if (isRejected) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700">
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
        <div>
          <div className="font-semibold text-sm">Complaint Closed / Rejected</div>
          <div className="text-xs text-rose-600 mt-0.5">This issue was marked as duplicate, non-actionable, or cancelled.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
        {/* Active track line */}
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 -z-0"
          style={{ width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%` }}
        ></div>

        {STAGES.map((stage, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 shadow-sm ${
                  isDone 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                } ${isCurrent ? 'scale-110 ring-4 ring-indigo-200' : ''}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={`text-xs mt-2 font-medium tracking-tight whitespace-nowrap ${
                isCurrent ? 'text-indigo-600 font-semibold' : isDone ? 'text-slate-800' : 'text-slate-400'
              }`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        No recorded status history yet.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((act, actIdx) => {
          const isLast = actIdx === activities.length - 1;
          const formattedDate = new Date(act.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <li key={act.id || actIdx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center ring-4 ring-white shadow-xs">
                      {act.action === 'CREATED' && <Clock className="w-4 h-4 text-amber-500" />}
                      {act.action === 'STATUS_CHANGE' && <Wrench className="w-4 h-4 text-indigo-600" />}
                      {act.action === 'FEEDBACK_SUBMITTED' && <Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                      {act.action === 'NOTE_ADDED' && <MessageSquare className="w-4 h-4 text-slate-600" />}
                      {!['CREATED', 'STATUS_CHANGE', 'FEEDBACK_SUBMITTED', 'NOTE_ADDED'].includes(act.action) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {act.notes || `Updated status to ${act.to_status}`}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-medium text-slate-700">{act.user_name}</span>
                        <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="capitalize px-1.5 py-0.2 bg-slate-100 rounded text-[10px] text-slate-600 font-medium">
                          {act.user_role}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs whitespace-nowrap text-slate-400">
                      {formattedDate}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
