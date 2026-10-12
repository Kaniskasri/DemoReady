export type DemoDuration = 3 | 5 | 10;

export interface DemoPlanRequest {
  projectName: string;
  problem: string;
  features: string[];
  techStack?: string;
  durationMinutes: DemoDuration;
}

export interface DemoStep {
  id: string;
  title: string;
  durationSeconds: number;
  action: string;
  say: string;
  expectedResult: string;
}

export interface SafetyNetItem {
  scenario: string;
  preparation: string;
  recovery: string;
  disclosure: string;
}

export interface DemoPlanResponse {
  projectSummary: string;
  durationMinutes: number;
  steps: DemoStep[];
  safetyNet: SafetyNetItem[];
  preDemoChecklist: string[];
  disclaimer: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
