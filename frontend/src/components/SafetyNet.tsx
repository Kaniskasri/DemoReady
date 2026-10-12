import React from 'react';
import { SafetyNetItem } from '../types';
import { AlertTriangle, Wrench, LifeBuoy, Info, CheckCircle } from 'lucide-react';

interface SafetyNetProps {
  items: SafetyNetItem[];
  preDemoChecklist: string[];
}

export const SafetyNet: React.FC<SafetyNetProps> = ({ items, preDemoChecklist }) => {
  return (
    <div className="space-y-6">
      {/* Safety Net Header */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 bg-amber-950/10 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Demo Safety Net
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Resilience Protocols
              </span>
            </h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              Demos can encounter network latency, API rate limits, or unexpected edge cases. Here are concrete fallback plans so you never freeze on stage.
            </p>
          </div>
        </div>

        {/* Failure Scenarios Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl p-5 bg-slate-900/90 border border-slate-800 space-y-3.5 hover:border-slate-700 transition"
            >
              {/* Scenario */}
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded bg-rose-500/10 text-rose-400 mt-0.5 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block mb-0.5">
                    Plausible Failure Scenario
                  </span>
                  <p className="text-sm font-semibold text-slate-100">
                    {item.scenario}
                  </p>
                </div>
              </div>

              {/* Preparation & Recovery 2-column on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Preparation */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                    <Wrench className="w-3.5 h-3.5" />
                    Preparation Before Demo
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.preparation}
                  </p>
                </div>

                {/* Live Recovery */}
                <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    Live Recovery Action
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.recovery}
                  </p>
                </div>
              </div>

              {/* Disclosure Requirement */}
              <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/20 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
                    Honest Presentation Rule
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {item.disclosure}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Demo Verification Checklist */}
      {preDemoChecklist && preDemoChecklist.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-md">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Pre-Demo Hardware & Environment Checks
          </h4>
          <ul className="space-y-2.5">
            {preDemoChecklist.map((check, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/70"
              >
                <span className="w-4 h-4 rounded-full bg-slate-800 text-sky-400 font-mono text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
