import React from 'react';
import { DemoStep } from '../types';
import { Clock, Play, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';

interface DemoStepCardProps {
  step: DemoStep;
  index: number;
  isReady: boolean;
  onToggleReady: (stepId: string) => void;
}

export const DemoStepCard: React.FC<DemoStepCardProps> = ({
  step,
  index,
  isReady,
  onToggleReady,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
  };

  return (
    <div
      className={`glass-panel rounded-2xl p-5 sm:p-6 transition-all border ${
        isReady
          ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10 dark:shadow-emerald-950/30'
          : 'border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-900/60 shadow-sm dark:shadow-none'
      }`}
    >
      {/* Top Header: Step Number, Title, Duration, Ready Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-start sm:items-center gap-3">
          <span
            className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 ${
              isReady
                ? 'bg-emerald-500 text-white dark:text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {index + 1}
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {step.title}
          </h3>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            <span>{formatTime(step.durationSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => onToggleReady(step.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isReady
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/50 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <CheckCircle className={`w-3.5 h-3.5 ${isReady ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>{isReady ? 'Rehearsed' : 'Mark Ready'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="mt-4 space-y-3.5">
        {/* Action to perform */}
        <div className="flex items-start gap-2.5 text-sm">
          <div className="p-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0">
            <Play className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-0.5">
              Action to Perform
            </span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {step.action}
            </p>
          </div>
        </div>

        {/* Speaking Prompt */}
        <div className="flex items-start gap-2.5 text-sm">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
              Speaking Prompt (Say)
            </span>
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-slate-950/70 border border-indigo-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-300 italic text-sm leading-relaxed border-l-4 border-l-indigo-500 dark:border-l-indigo-400 shadow-sm dark:shadow-none">
              "{step.say}"
            </div>
          </div>
        </div>

        {/* Expected Result to Verify */}
        <div className="flex items-start gap-2.5 text-sm">
          <div className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-0.5">
              Expected Result to Verify
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {step.expectedResult}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
