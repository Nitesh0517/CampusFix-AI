import React from 'react';
import { Sparkles, Check, Cpu, Compass, Tag, ShieldCheck } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

export const AICard = ({ aiData, onApply, applied = false }) => {
  if (!aiData) return null;

  const isGemini = aiData.source === 'gemini';

  return (
    <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-5 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">AI Complaint Triage</h4>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isGemini 
                  ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}>
                {isGemini ? 'Gemini 1.5 Flash' : 'Smart Campus Heuristics'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Autonomous categorization & severity assessment</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">
            {Math.round(aiData.confidence * 100)}% Confidence
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-white/80 rounded-xl border border-indigo-50 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-500" />
            Detected Category
          </div>
          <div className="text-sm font-semibold text-slate-900">{aiData.category}</div>
        </div>

        <div className="p-3 bg-white/80 rounded-xl border border-indigo-50 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-orange-500" />
            Calculated Urgency
          </div>
          <div>
            <PriorityBadge priority={aiData.priority} size="sm" />
          </div>
        </div>

        <div className="p-3 bg-white/80 rounded-xl border border-indigo-50 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-blue-500" />
            Location Extraction
          </div>
          <div className="text-sm font-semibold text-slate-900 truncate">
            {aiData.location_hint || 'Campus Facilities'}
          </div>
        </div>
      </div>

      <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/80 mb-4">
        <div className="text-xs font-medium text-slate-500 mb-1">Generated Brief Summary:</div>
        <p className="text-sm text-slate-800 font-medium italic">"{aiData.summary}"</p>
        {aiData.reasoning && (
          <div className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2 flex items-start gap-1.5">
            <span className="font-semibold text-slate-600">AI Rationale:</span>
            <span>{aiData.reasoning}</span>
          </div>
        )}
      </div>

      {aiData.keywords && aiData.keywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[11px] text-slate-400 font-medium">Extracted Signals:</span>
          {aiData.keywords.map((kw, i) => (
            <span key={i} className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              #{kw}
            </span>
          ))}
        </div>
      )}

      {onApply && (
        <button
          type="button"
          onClick={onApply}
          disabled={applied}
          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
            applied 
              ? 'bg-emerald-600 text-white cursor-default' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98'
          }`}
        >
          {applied ? (
            <>
              <Check className="w-4 h-4" />
              Applied to Form Fields
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Apply AI Suggestions to Form
            </>
          )}
        </button>
      )}
    </div>
  );
};
