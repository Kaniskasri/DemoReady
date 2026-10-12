import React from 'react';
import { DemoStep } from '../types';
import { CheckCircle2, RotateCcw, Award } from 'lucide-react';

interface RehearsalChecklistProps {
  steps: DemoStep[];
  readyStepIds: Set<string>;
  onToggleStep: (id: string) => void;
  onReset: () => void;
}

export const RehearsalChecklist: React.FC<RehearsalChecklistProps> = ({
  steps,
  readyStepIds,
  onToggleStep,
  onReset,
}) => {
  const total = steps.length;
  const readyCount = steps.filter((s) => readyStepIds.has(s.id)).length;
  const percentage = total > 0 ? Math.round((readyCount / total) * 100) : 0;
  const isAllReady = total > 0 && readyCount === total;

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Rehearsal Readiness Checklist
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Practice each step live on your screen before taking the stage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-300">
              {readyCount} of {total} steps ready
            </span>
            <span className="text-xs text-slate-500 ml-1">({percentage}%)</span>
          </div>
          {readyCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1 transition"
              title="Reset checklist"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 mb-5">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            isAllReady
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Completion Trophy Card */}
      {isAllReady && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-emerald-200 text-sm animate-fade-in">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold block">All Demo Steps Rehearsed!</span>
            <span className="text-xs text-emerald-300/80">
              You've verified all actions and expected outcomes. You are ready to present with confidence.
            </span>
          </div>
        </div>
      )}

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {steps.map((step, idx) => {
          const ready = readyStepIds.has(step.id);
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onToggleStep(step.id)}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                ready
                  ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={ready}
                onChange={() => {}} // handled by parent button click
                className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 pointer-events-none"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold block truncate">
                  {idx + 1}. {step.title}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {step.action}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
