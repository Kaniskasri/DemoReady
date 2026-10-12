import React, { useState } from 'react';
import { DemoPlanRequest, DemoDuration } from '../types';
import { Sparkles, Plus, X, Clock, HelpCircle, Layers } from 'lucide-react';

interface ProjectFormProps {
  onSubmit: (data: DemoPlanRequest) => void;
  isLoading: boolean;
  initialValues?: DemoPlanRequest | null;
}

const PRESETS: Array<{ label: string; data: DemoPlanRequest }> = [
  {
    label: "AI Resume Analyzer",
    data: {
      projectName: "AI Resume Analyzer",
      problem: "Job seekers struggle to identify missing keywords and technical skill gaps in their resumes before applying.",
      features: [
        "Instant PDF resume parsing & skill extraction",
        "Target job description gap comparison",
        "Actionable bullet-point rewrite suggestions"
      ],
      techStack: "React, Python FastAPI, Amazon Bedrock",
      durationMinutes: 3
    }
  },
  {
    label: "Real-time Collaborative Whiteboard",
    data: {
      projectName: "CanvasSync",
      problem: "Remote engineering teams lose momentum during design sessions due to laggy, non-persistent whiteboarding tools.",
      features: [
        "Sub-50ms peer-to-peer vector stroke sync",
        "Automated architecture diagram generation",
        "Live presence avatars and laser pointers"
      ],
      techStack: "Next.js, WebSockets, Canvas API, Redis",
      durationMinutes: 5
    }
  },
  {
    label: "Local Code Security Auditor",
    data: {
      projectName: "CodeShield CLI",
      problem: "Developers frequently commit hard-coded API secrets and misconfigured cloud credentials into public git repositories.",
      features: [
        "Zero-latency pre-commit git hook scanning",
        "Entropy-based regex secret detection",
        "Automated secret redaction and remediation suggestions"
      ],
      techStack: "Rust CLI, Tree-sitter, Git hooks",
      durationMinutes: 3
    }
  }
];

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading, initialValues }) => {
  const [projectName, setProjectName] = useState(initialValues?.projectName || '');
  const [problem, setProblem] = useState(initialValues?.problem || '');
  const [features, setFeatures] = useState<string[]>(
    initialValues?.features && initialValues.features.length > 0
      ? initialValues.features
      : ['']
  );
  const [newFeatureText, setNewFeatureText] = useState('');
  const [techStack, setTechStack] = useState(initialValues?.techStack || '');
  const [durationMinutes, setDurationMinutes] = useState<DemoDuration>(
    initialValues?.durationMinutes || 3
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const applyPreset = (preset: DemoPlanRequest) => {
    setProjectName(preset.projectName);
    setProblem(preset.problem);
    setFeatures([...preset.features]);
    setTechStack(preset.techStack || '');
    setDurationMinutes(preset.durationMinutes);
    setValidationError(null);
  };

  const handleAddFeature = () => {
    const text = newFeatureText.trim();
    if (!text) return;
    if (features.length >= 8) {
      setValidationError('You can add up to 8 key features.');
      return;
    }
    if (text.length > 160) {
      setValidationError('Each feature description must be under 160 characters.');
      return;
    }
    setFeatures([...features.filter(f => f.trim() !== ''), text]);
    setNewFeatureText('');
    setValidationError(null);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = features.filter((_, i) => i !== index);
    setFeatures(updated.length > 0 ? updated : ['']);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = projectName.trim();
    if (!trimmedName) {
      setValidationError('Please provide your project name.');
      return;
    }
    if (trimmedName.length > 100) {
      setValidationError('Project name must be 100 characters or fewer.');
      return;
    }

    const trimmedProblem = problem.trim();
    if (!trimmedProblem) {
      setValidationError('Please describe the problem your project solves.');
      return;
    }
    if (trimmedProblem.length > 1000) {
      setValidationError('Problem description must be 1,000 characters or fewer.');
      return;
    }

    const activeFeatures = features.map(f => f.trim()).filter(f => f.length > 0);
    if (newFeatureText.trim()) {
      activeFeatures.push(newFeatureText.trim());
    }

    if (activeFeatures.length === 0) {
      setValidationError('Please specify at least 1 feature to demonstrate.');
      return;
    }
    if (activeFeatures.length > 8) {
      setValidationError('Please provide no more than 8 features.');
      return;
    }

    for (const f of activeFeatures) {
      if (f.length > 160) {
        setValidationError(`Feature '${f.slice(0, 24)}...' is too long (max 160 chars).`);
        return;
      }
    }

    const trimmedTech = techStack.trim();
    if (trimmedTech.length > 300) {
      setValidationError('Technology stack must be 300 characters or fewer.');
      return;
    }

    onSubmit({
      projectName: trimmedName,
      problem: trimmedProblem,
      features: activeFeatures,
      techStack: trimmedTech,
      durationMinutes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Quick Presets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
            Quick Start Presets
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">Click to autofill sample details</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p.data)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-slate-700/60 hover:border-sky-500/50 transition duration-150 font-medium"
            >
              ⚡ {p.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800/80" />

      {/* Project Name */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="projectName" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Project Name <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">{projectName.length}/100</span>
        </div>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          maxLength={100}
          placeholder="e.g. AI Resume Analyzer"
          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition shadow-sm dark:shadow-none"
          required
        />
      </div>

      {/* Problem */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="problem" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Problem Solved <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">{problem.length}/1000</span>
        </div>
        <textarea
          id="problem"
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          maxLength={1000}
          placeholder="What specific friction does this solve? Why does the audience care?"
          className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none shadow-sm dark:shadow-none"
          required
        />
      </div>

      {/* Main Features */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            Main Features to Demo <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">1 to 8 key features</span>
        </div>
        <div className="space-y-2 mb-2">
          {features.map((feat, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-5">{idx + 1}.</span>
              <input
                type="text"
                value={feat}
                onChange={(e) => handleFeatureChange(idx, e.target.value)}
                maxLength={160}
                placeholder={`Feature ${idx + 1} (e.g. Instant skill gap detection)`}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-sm dark:shadow-none"
              />
              {features.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Remove feature"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {features.length < 8 && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              maxLength={160}
              placeholder="Add another feature & press Enter..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-100/80 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 flex items-center gap-1 border border-slate-300 dark:border-slate-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        )}
      </div>

      {/* Tech Stack & Duration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Tech Stack */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="techStack" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Technology Stack <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">{techStack.length}/300</span>
          </div>
          <input
            id="techStack"
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            maxLength={300}
            placeholder="e.g. React, Python, AWS Bedrock, Redis"
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition shadow-sm dark:shadow-none"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Helps tailor realistic failure scenarios in the Safety Net.</p>
        </div>

        {/* Demo Duration Selector */}
        <div>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            Target Demo Duration <span className="text-rose-500 dark:text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[3, 5, 10].map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => setDurationMinutes(dur as DemoDuration)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                  durationMinutes === dur
                    ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-500 dark:border-sky-400 text-sky-700 dark:text-sky-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span>{dur} Minutes</span>
                <span className="text-[11px] font-normal opacity-80 mt-0.5">
                  {dur === 3 ? 'Lightning' : dur === 5 ? 'Standard' : 'Deep Dive'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 flex-shrink-0 text-rose-500 dark:text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition duration-200 shadow-lg ${
          isLoading
            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
            : 'bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-500 dark:to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing Project & Crafting Demo Plan...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-sky-200" />
            <span>Generate My Demo Plan & Safety Net</span>
          </>
        )}
      </button>
    </form>
  );
};
