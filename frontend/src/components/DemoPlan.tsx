import React, { useState } from 'react';
import { DemoPlanResponse } from '../types';
import { DemoStepCard } from './DemoStepCard';
import { RehearsalChecklist } from './RehearsalChecklist';
import { SafetyNet } from './SafetyNet';
import { Clock, ShieldAlert, ArrowLeft, Share2, CheckCheck } from 'lucide-react';

interface DemoPlanProps {
  plan: DemoPlanResponse;
  projectName: string;
  onReset: () => void;
}

export const DemoPlan: React.FC<DemoPlanProps> = ({ plan, projectName, onReset }) => {
  const [readyStepIds, setReadyStepIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleStepReady = (stepId: string) => {
    setReadyStepIds((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const handleResetChecklist = () => {
    setReadyStepIds(new Set());
  };

  const totalCalculatedSeconds = plan.steps.reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalMins = Math.floor(totalCalculatedSeconds / 60);
  const totalSecs = totalCalculatedSeconds % 60;

  const copyScriptToClipboard = () => {
    const lines = [
      `DemoReady Plan for ${projectName} (${plan.durationMinutes} Minutes)`,
      `Summary: ${plan.projectSummary}`,
      '',
      '--- DEMONSTRATION STEPS ---',
      ...plan.steps.map((s, idx) => 
        `Step ${idx + 1}: ${s.title} (${s.durationSeconds}s)\n` +
        `Action: ${s.action}\n` +
        `Say: "${s.say}"\n` +
        `Verify: ${s.expectedResult}\n`
      ),
      '--- DEMO SAFETY NET ---',
      ...plan.safetyNet.map((sn, idx) =>
        `Scenario ${idx + 1}: ${sn.scenario}\n` +
        `Prep: ${sn.preparation}\n` +
        `Recovery: ${sn.recovery}\n` +
        `Disclosure: ${sn.disclosure}\n`
      )
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner: Project Summary & Actions */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-sky-500/20 bg-sky-950/10 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Demo Blueprint Generated
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {projectName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyScriptToClipboard}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
              title="Copy demo outline and script to clipboard"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
              <span>{copied ? 'Copied!' : 'Copy Outline'}</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Details</span>
            </button>
          </div>
        </div>

        {/* Short Project Summary */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
          {plan.projectSummary}
        </p>

        {/* Timing Badge Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">Target Duration:</span>
            <span className="font-mono text-sky-300">{plan.durationMinutes} Minutes</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="font-semibold">Planned Steps:</span>
            <span className="font-mono text-sky-300">{plan.steps.length} Steps</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="font-semibold">Allocated Time:</span>
            <span className="font-mono text-sky-300">
              {totalMins}m {totalSecs > 0 ? `${totalSecs}s` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Rehearsal Checklist Component */}
      <RehearsalChecklist
        steps={plan.steps}
        readyStepIds={readyStepIds}
        onToggleStep={toggleStepReady}
        onReset={handleResetChecklist}
      />

      {/* Ordered Demonstration Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Ordered Demonstration Sequence</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {plan.steps.length} phases
            </span>
          </h3>
          <span className="text-xs text-slate-400">Follow sequentially</span>
        </div>

        <div className="space-y-4">
          {plan.steps.map((step, idx) => (
            <DemoStepCard
              key={step.id}
              step={step}
              index={idx}
              isReady={readyStepIds.has(step.id)}
              onToggleReady={toggleStepReady}
            />
          ))}
        </div>
      </div>

      {/* Demo Safety Net Component */}
      <SafetyNet
        items={plan.safetyNet}
        preDemoChecklist={plan.preDemoChecklist}
      />

      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {plan.disclaimer}
        </p>
      </div>
    </div>
  );
};
