import React, { useState, useEffect } from 'react';
import { DemoPlanRequest, DemoPlanResponse } from './types';
import { generateDemoPlan } from './api';
import { ProjectForm } from './components/ProjectForm';
import { DemoPlan } from './components/DemoPlan';
import { 
  RotateCcw, 
  AlertCircle, 
  ShieldCheck, 
  Radio, 
  Cpu 
} from 'lucide-react';

const TIPS = [
  "Structuring demonstration into clear chronological milestones...",
  "Calibrating speaking prompts to prevent stage rambling...",
  "Synthesizing concrete verification checks for every on-screen action...",
  "Analyzing technology stack for potential live failure points...",
  "Formulating honest fallback procedures and audience disclosures..."
];

export const App: React.FC = () => {
  const [currentRequest, setCurrentRequest] = useState<DemoPlanRequest | null>(null);
  const [demoPlan, setDemoPlan] = useState<DemoPlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState<number>(0);

  // Rotate tips during loading
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGeneratePlan = async (request: DemoPlanRequest) => {
    setCurrentRequest(request);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await generateDemoPlan(request);
      setDemoPlan(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while preparing your demo plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentRequest) {
      handleGeneratePlan(currentRequest);
    }
  };

  const handleReset = () => {
    setDemoPlan(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Goal-Oriented AI Demo Agent</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400">AWS Bedrock Powered</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-sky-200 to-indigo-300">
              DemoReady
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto">
            Prepare your demo. Tell your story. Be ready when things go wrong.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Turns any project description into a rehearsable timed plan, actionable speaking prompts, expected outcomes to verify, and a practical Demo Safety Net.
          </p>
        </header>

        {/* Error Alert with Retry */}
        {errorMessage && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Generation Issue</h4>
                <p className="text-xs sm:text-sm text-rose-200/90 mt-0.5 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleRetry}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State Animation */}
        {isLoading && (
          <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-sky-500/30 my-8 shadow-2xl space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-sky-400 border-t-transparent animate-spin" />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center text-sky-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">
                DemoReady Agent is at work
              </h3>
              <p className="text-sm font-mono text-sky-300/90 h-6 transition-all duration-300">
                {TIPS[tipIndex]}
              </p>
              <p className="text-xs text-slate-500">
                Synthesizing duration budget, stage risks, and recovery fallbacks.
              </p>
            </div>
          </div>
        )}

        {/* Form or Results View */}
        {!isLoading && !demoPlan && (
          <ProjectForm
            onSubmit={handleGeneratePlan}
            isLoading={isLoading}
            initialValues={currentRequest}
          />
        )}

        {!isLoading && demoPlan && (
          <DemoPlan
            plan={demoPlan}
            projectName={currentRequest?.projectName || 'Project'}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 backdrop-blur py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Built for hackathons & software builders</span>
          </div>

          <div className="flex items-center gap-4">
            <span>AWS Bedrock • Lambda • API Gateway • Amplify</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
