"""
DemoReady - Bedrock Prompt Engineering
Generates structured demo plans, speaking prompts, verification checks, and safety net fallbacks.
"""

SYSTEM_PROMPT = """You are DemoReady, a practical, goal-oriented demo-preparation AI agent for software builders and hackathon participants.
Your job is to transform a project description into:
1. A realistic, timed demonstration sequence tailored to the exact requested duration.
2. Concrete actions the presenter must perform.
3. Concise speaking prompts (what to say) for each step.
4. Specific expected results the presenter should verify before and during the demo.
5. A "Demo Safety Net": realistic failure scenarios, preparation steps, recovery actions, and honest non-live disclosure guidance.
6. A pre-demo verification checklist.

CRITICAL RULES:
- Frame everything as PREPARATION guidance. Do NOT pretend you have executed, monitored, or tested the user's application.
- State expected outcomes as items the presenter must verify, never as proven facts.
- Identify plausible failure scenarios based strictly on the user's tech stack and features (e.g., API latency, rate limits, empty states, auth/token expiration). Never claim a failure is certain.
- All fallback actions must be HONEST. NEVER recommend faking a successful live operation if it failed.
- If recommending a backup screenshot, sample JSON, or prerecorded screencast, ALWAYS specify that it must be explicitly disclosed to the audience as a saved result.
- Step durations must sum to approximately the requested total demo duration (e.g., for 3 mins ~ 180s, for 5 mins ~ 300s, for 10 mins ~ 600s).
- Return ONLY a valid JSON object matching the requested schema. Do not include markdown code block formatting or commentary outside the JSON.
"""

def build_demo_prompt(project_name: str, problem: str, features: list[str], tech_stack: str, duration_minutes: int) -> str:
    total_seconds = duration_minutes * 60
    feature_list_str = "\n".join(f"- {f}" for f in features)
    tech_str = tech_stack.strip() if tech_stack and tech_stack.strip() else "Not specified"

    return f"""Analyze the following software project and generate a complete DemoReady preparation plan for a {duration_minutes}-minute ({total_seconds} seconds) demonstration.

PROJECT DETAILS:
- Project Name: {project_name}
- Problem Solved: {problem}
- Main Features:
{feature_list_str}
- Technology Stack: {tech_str}
- Target Demo Duration: {duration_minutes} minutes ({total_seconds} seconds)

OUTPUT REQUIREMENTS:
Output MUST be a single raw JSON object with this exact structure:
{{
  "projectSummary": "A concise 1-2 sentence summary of what this demo accomplishes based strictly on the input.",
  "durationMinutes": {duration_minutes},
  "steps": [
    {{
      "id": "step-1",
      "title": "Clear step title",
      "durationSeconds": 30,
      "action": "Concrete action the presenter performs on screen (e.g. 'Navigate to upload tab and submit sample PDF')",
      "say": "Concise speaking prompt for what the presenter should say in their own words",
      "expectedResult": "Specific observable outcome the presenter should verify (e.g. 'Ensure parsed skill tags appear within 3 seconds')"
    }}
  ],
  "safetyNet": [
    {{
      "scenario": "Plausible failure scenario (e.g. 'External API endpoint exceeds 5s timeout or returns 504')",
      "preparation": "Actionable step to do BEFORE presenting (e.g. 'Pre-run the query and save raw JSON payload in a local fallback tab')",
      "recovery": "Real-time recovery action during the demo (e.g. 'Acknowledge the live API latency calmly and switch to the pre-loaded result tab')",
      "disclosure": "Honest audience disclosure requirement (e.g. 'State clearly: This is our cached run from earlier today while the live endpoint catches up')"
    }}
  ],
  "preDemoChecklist": [
    "Verify item 1 before stepping on stage",
    "Verify item 2 before stepping on stage",
    "Verify item 3 before stepping on stage"
  ],
  "disclaimer": "This plan is AI-generated guidance. Verify all steps and expected results in your application before presenting."
}}

Guidelines for step counts:
- For 3 minutes ({total_seconds}s): generate 4 to 5 concise steps.
- For 5 minutes ({total_seconds}s): generate 5 to 7 steps.
- For 10 minutes ({total_seconds}s): generate 7 to 9 steps with a brief Q&A buffer.
Ensure step durationSeconds sum to approximately {total_seconds} seconds (+/- 15 seconds).
Provide 2 to 3 practical failure scenarios in safetyNet.
Provide 3 to 5 pre-demo checklist items.
"""
