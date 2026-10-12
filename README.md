# DemoReady

> **Prepare your demo. Tell your story. Be ready when things go wrong.**

DemoReady is a goal-oriented AI demo-preparation agent that turns a project description into a timed demonstration plan, concise speaking prompts, expected outcomes to verify, and a practical **Demo Safety Net** for likely live failures.

Built for the **AWS "Build an Agent People Actually Enjoy Using" Weekend Challenge**.

---

## Target Users
- **Hackathon participants** preparing to present to judges under tight time constraints.
- **Software builders & students** demonstrating applications and prototypes.
- **Founders & engineers** giving live technical demos without freezing or rambling.

---

## Key Features

1. **Project Input Form & Presets**: Enter project name, problem solved, 1–8 demonstration features, optional tech stack, and target demo duration (3, 5, or 10 minutes). Includes 1-click presets for immediate testing.
2. **AI-Generated Demo Plan**:
   - Short, punchy opening hook.
   - Ordered demonstration steps tailored to your duration budget.
   - Action instructions (what to physically do on screen).
   - Concise speaking prompts (what to say).
   - Observable verification outcomes (what to visually verify).
3. **Demo Safety Net**:
   - Identifies plausible failure scenarios based on your tech stack (latency, rate limits, token expiration).
   - Practical pre-demo preparation steps.
   - Real-time stage recovery actions.
   - **Honest Presentation Rule**: Requires clear disclosure whenever switching to pre-recorded/saved sample outputs.
4. **Interactive Rehearsal Checklist**:
   - Real-time progress bar (`X of Y steps ready`).
   - Ability to mark steps as ready and toggle them back.
   - Resets automatically when generating a new plan.
5. **Robust UX & Error States**:
   - Animated agent progress with rotating preparation tips.
   - Graceful error recovery with preserved form inputs and a 1-click **Retry** button.
   - One-click **Copy Outline** action for quick export into speaker notes.

---

## Architecture Diagram

```text
User's Browser
    │
    ▼ HTTPS
React + TypeScript Frontend (AWS Amplify Hosting / Vite)
    │
    ▼ HTTPS POST /generate-plan
Amazon API Gateway (HTTP API)
    │
    ▼ Authenticated Proxy
AWS Lambda (Python 3.10)
    │
    ▼ IAM Role (bedrock:InvokeModel)
Amazon Bedrock (Amazon Nova Lite / Anthropic Claude)
    │
    ▼ Validated JSON Response
Frontend renders Demo Plan, Rehearsal Checklist, and Safety Net
```

### AWS Services & Responsibilities

| Service | Role in DemoReady |
| :--- | :--- |
| **Amazon Bedrock** | Foundation model inference to synthesize timed sequences, failure risks, and recovery actions. |
| **AWS Lambda** | Request validation, payload bounds checking, Bedrock prompt construction, schema normalization, and error handling. |
| **Amazon API Gateway** | Public HTTPS entrypoint providing low-latency routing, payload size restrictions, and CORS preflight handling. |
| **AWS IAM** | Least-privilege authorization using a Lambda execution role (`bedrock:InvokeModel`), keeping credentials off client devices. |
| **AWS Amplify Hosting** | Host the React/TypeScript frontend with automated deployments and custom domain/SSL support. |

---

## Security & Environment Configuration

> ⚠️ **CRITICAL SECURITY RULE:** Never put AWS access keys, secret keys, or credentials into frontend environment variables (`VITE_*`). Frontend variables are bundled into client-side JavaScript and are visible to everyone.

### Environment Variables

#### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `AWS_REGION` | AWS Region for Bedrock model invocation | `us-east-1` |
| `BEDROCK_MODEL_ID` | Foundation Model ID in Amazon Bedrock | `amazon.nova-lite-v1:0` |
| `ALLOWED_ORIGIN` | Allowed CORS origin (set to your Amplify URL in prod) | `*` |
| `ENABLE_LOCAL_FALLBACK`| Enables local schema-compliant fallback when developing offline | `true` |

#### Frontend (`frontend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public URL of the backend API Gateway | `http://127.0.0.1:3001` |

---

## Local Development & Setup

### Prerequisites
- Node.js 18+ & npm 9+
- Python 3.10+
- AWS CLI (optional for local fallback mode, required for AWS deployment)

### 1. Run the Backend Locally

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the local gateway server (listens on port 3001)
python local_server.py
```

### 2. Run the Frontend Locally

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## Running the Tests

### Backend Unit Tests
Run the comprehensive validation and schema verification test suite:
```bash
python -m unittest discover -s backend/tests -p "test_*.py" -v
```

This verifies:
- Valid payload produces complete schema-compliant plan.
- Validation rejects missing project names or problems (HTTP 400).
- Validation rejects feature lists with 0 or >8 items (HTTP 400).
- Validation enforces allowed durations: 3, 5, or 10 minutes.
- Payloads exceeding bounds or with malformed JSON are rejected.
- CORS preflight `OPTIONS` requests respond correctly with allowed methods and headers.

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## AWS Deployment

See [infrastructure/deployment-notes.md](infrastructure/deployment-notes.md) for full step-by-step AWS deployment commands.

Quick summary:
1. **Lambda Role**: Create IAM role with `AWSLambdaBasicExecutionRole` and `bedrock:InvokeModel`.
2. **Lambda**: Package `backend/` as zip and deploy to AWS Lambda.
3. **API Gateway**: Create HTTP API with `POST /generate-plan` integration and CORS configured.
4. **Amplify**: Connect your repository to AWS Amplify Hosting, set `VITE_API_BASE_URL` to your API Gateway URL, and deploy!

---

## Known Limitations

- **Preparation Guidance Only**: DemoReady generates structured preparation blueprints and contingency advice based on the information provided. It does not automatically run, monitor, or test your application code.
- **In-Memory Session**: Rehearsal checklist progress is maintained in the current browser session and does not persist across full page reloads.

---

## License
MIT License. Created for the AWS Weekend Challenge.
