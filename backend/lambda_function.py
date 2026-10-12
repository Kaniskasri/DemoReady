import json
import os
import re
import base64
import logging
from typing import Any, Dict, List, Tuple, Optional
from prompt import SYSTEM_PROMPT, build_demo_prompt

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Configuration from environment
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")
ENABLE_LOCAL_FALLBACK = os.environ.get("ENABLE_LOCAL_FALLBACK", "true").lower() in ("true", "1", "yes")

def get_cors_headers(origin: Optional[str] = None) -> Dict[str, str]:
    header_origin = ALLOWED_ORIGIN
    if ALLOWED_ORIGIN != "*" and origin:
        allowed_list = [o.strip() for o in ALLOWED_ORIGIN.split(",")]
        if origin in allowed_list:
            header_origin = origin
    return {
        "Access-Control-Allow-Origin": header_origin,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Requested-With",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
        "Content-Type": "application/json"
    }

def build_response(status_code: int, body_data: Dict[str, Any], origin: Optional[str] = None) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": get_cors_headers(origin),
        "body": json.dumps(body_data)
    }

def validate_request_payload(data: Any) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object.", None

    project_name = data.get("projectName")
    if not isinstance(project_name, str) or not project_name.strip():
        return False, "Project name is required.", None
    project_name = project_name.strip()
    if len(project_name) > 100:
        return False, "Project name must not exceed 100 characters.", None

    problem = data.get("problem")
    if not isinstance(problem, str) or not problem.strip():
        return False, "Problem description is required.", None
    problem = problem.strip()
    if len(problem) > 1000:
        return False, "Problem description must not exceed 1000 characters.", None

    raw_features = data.get("features")
    if not isinstance(raw_features, list) or len(raw_features) == 0:
        return False, "At least one feature is required.", None
    if len(raw_features) > 8:
        return False, "Maximum 8 features are allowed.", None

    cleaned_features: List[str] = []
    for idx, f in enumerate(raw_features):
        if not isinstance(f, str) or not f.strip():
            return False, f"Feature at index {idx} must be a non-empty text string.", None
        trimmed_f = f.strip()
        if len(trimmed_f) > 160:
            return False, f"Feature '{trimmed_f[:20]}...' exceeds maximum 160 characters.", None
        cleaned_features.append(trimmed_f)

    tech_stack = data.get("techStack", "")
    if tech_stack is not None:
        if not isinstance(tech_stack, str):
            return False, "Technology stack must be a string.", None
        tech_stack = tech_stack.strip()
        if len(tech_stack) > 300:
            return False, "Technology stack must not exceed 300 characters.", None
    else:
        tech_stack = ""

    duration_minutes = data.get("durationMinutes")
    if duration_minutes not in (3, 5, 10):
        return False, "Duration must be exactly 3, 5, or 10 minutes.", None

    sanitized = {
        "projectName": project_name,
        "problem": problem,
        "features": cleaned_features,
        "techStack": tech_stack,
        "durationMinutes": duration_minutes
    }
    return True, None, sanitized

def generate_offline_plan(validated_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates an honest, schema-compliant demo plan when Bedrock runtime is unreachable in dev."""
    name = validated_data["projectName"]
    problem = validated_data["problem"]
    features = validated_data["features"]
    tech = validated_data["techStack"] or "standard web/API stack"
    duration = validated_data["durationMinutes"]
    total_seconds = duration * 60

    if duration == 3:
        step_templates = [
            ("Hook & Problem Statement", 35, f"Open application landing view and introduce problem: '{problem[:90]}...'", f"Hello everyone, this is {name}. Everyday builders encounter a painful challenge: {problem[:100]}.", "Audience clearly grasps the core pain point within the first 30 seconds."),
            ("Feature Walkthrough: " + features[0], 55, f"Trigger primary workflow for {features[0]} with prepared demonstration input.", f"Let me show you how {name} tackles this. Watch as we trigger {features[0]}.", f"Primary output for {features[0]} renders cleanly without UI freezing."),
            ("Secondary Highlight: " + (features[1] if len(features) > 1 else "Core Capability"), 50, f"Demonstrate {features[1] if len(features) > 1 else 'immediate output feedback'}.", f"Notice the instant feedback loop here, built using {tech}.", "Verification check confirms expected state transition on screen."),
            ("Closing & Impact", 40, "Display final outcome summary and deliver clear conclusion.", f"In under 3 minutes, {name} transformed that friction into an actionable result. Thank you!", "Final slide or dashboard view displays cleanly with all metrics intact.")
        ]
    elif duration == 5:
        step_templates = [
            ("The Problem in Context", 45, f"Display initial friction state before {name}.", f"Welcome. Today we're showing {name}. Here is the core problem: {problem[:120]}.", "Audience recognizes the friction and relevance."),
            ("Primary Workflow: " + features[0], 75, f"Step through live demonstration of {features[0]}.", f"First, let's execute our flagship capability: {features[0]}.", "Execution completes smoothly and expected output appears."),
            ("Feature Deep-Dive: " + (features[1] if len(features) > 1 else features[0]), 70, f"Demonstrate {features[1] if len(features) > 1 else 'deeper controls'} with realistic parameters.", f"Next, let's inspect how {features[1] if len(features) > 1 else name} handles this edge case.", "Data updates correctly and UI indicates success state."),
            ("Interactive Result: " + (features[2] if len(features) > 2 else features[0]), 60, "Highlight unique output or user feedback loop.", f"What makes this unique is the automated result feedback powered by {tech}.", "Visual verification confirms expected values match inputs."),
            ("Architecture Recap & Wrap-up", 50, "Show summary architecture or next milestones and conclude.", f"To recap, {name} delivers a fast, resilient solution to {problem[:60]}. Happy to answer questions!", "Clear call to action or link presented on screen.")
        ]
    else: # 10 minutes
        step_templates = [
            ("Opening Hook & Motivation", 60, "Set the stage with real-world examples of the problem.", f"Welcome everyone. Today we are presenting {name}. Why did we build this? Because {problem[:140]}.", "Audience is engaged and understands why this problem matters."),
            ("Architecture & Setup Overview", 75, f"Briefly explain application stack ({tech}) and demo setup.", f"Here is how we architected {name} using {tech} for optimal performance.", "Architecture diagram or pristine app entrypoint loaded."),
            ("Core Workflow Part 1: " + features[0], 110, f"Perform end-to-end execution of {features[0]}.", f"Let's jump into the live demo starting with {features[0]}.", "Live execution completes and primary artifacts are generated."),
            ("Core Workflow Part 2: " + (features[1] if len(features) > 1 else features[0]), 105, f"Interact with {features[1] if len(features) > 1 else 'extended flow'}.", f"Now let's examine {features[1] if len(features) > 1 else 'the secondary controls'}.", "State transitions and responsive feedback verified."),
            ("Deep-dive: " + (features[2] if len(features) > 2 else features[0]), 90, "Demonstrate system responsiveness and edge case handling.", f"Notice how {name} gracefully validates and processes this scenario.", "Validation checks pass and UI updates without lag."),
            ("Live Verification & Q&A Transition", 100, "Review key results generated during the demo and invite audience questions.", f"To review, we took an input, executed {features[0]}, and verified outcomes. Let's open the floor to questions.", "Audience questions addressed with live app ready in background."),
            ("Conclusion & Next Steps", 60, "Summarize key accomplishments and share repository / roadmap link.", f"Thank you for your time. {name} is open source and ready to test.", "Closing screen displays links and contact info.")
        ]

    steps = []
    for idx, (title, dur, action, say, result) in enumerate(step_templates, start=1):
        steps.append({
            "id": f"step-{idx}",
            "title": title,
            "durationSeconds": dur,
            "action": action,
            "say": say,
            "expectedResult": result
        })

    safety_net = [
        {
            "scenario": f"Live {tech} service or external endpoint experiences high latency or timeout.",
            "preparation": "Run a full pass 15 minutes before presenting; cache sample input data and keep a completed result loaded in a background browser tab.",
            "recovery": "If the live call spins past 5 seconds, explain that the network is congested and switch tabs to show the pre-computed run.",
            "disclosure": "Explicitly state: 'While our live request is processing over conference Wi-Fi, here is the verified output from our rehearsal 10 minutes ago.'"
        },
        {
            "scenario": "Authentication token or session expires right before going on stage.",
            "preparation": "Log in immediately before your slot, disable auto-logout or extend local JWT expiration, and bookmark the authenticated view.",
            "recovery": "If redirected to login, stay calm, log in using pre-filled credentials from a password manager or local env, and resume the flow.",
            "disclosure": "Briefly mention: 'Refreshing our demo session credentials' without pretending the page didn't reload."
        },
        {
            "scenario": "Live input data causes an unhandled boundary state or unexpected error alert.",
            "preparation": "Prepare a vetted, proven test dataset in a text file ready to copy-paste; avoid typing unvetted input live on stage.",
            "recovery": "Acknowledge the boundary case honestly, reset with the verified test dataset, and demonstrate the happy path.",
            "disclosure": "State: 'We hit a corner case here—let's load our standard test case to verify the primary pipeline.'"
        }
    ]

    checklist = [
        "Test the complete primary workflow end-to-end on the presentation laptop.",
        "Open a backup browser tab with pre-loaded sample results in case of network latency.",
        "Verify presentation display resolution, zoom level (125-150% recommended), and dark/light contrast.",
        "Close all notification apps, messaging clients, and background downloaders.",
        "Check audio and microphone levels if presenting virtually or with screen recording."
    ]

    return {
        "projectSummary": f"{name} addresses '{problem[:120]}' through targeted capabilities including {', '.join(features[:3])}.",
        "durationMinutes": duration,
        "steps": steps,
        "safetyNet": safety_net,
        "preDemoChecklist": checklist,
        "disclaimer": "This plan is AI-generated guidance. Verify all steps and expected results in your own application before presenting."
    }

def invoke_bedrock(validated_data: Dict[str, Any]) -> Dict[str, Any]:
    import boto3
    from botocore.exceptions import ClientError

    prompt_text = build_demo_prompt(
        project_name=validated_data["projectName"],
        problem=validated_data["problem"],
        features=validated_data["features"],
        tech_stack=validated_data["techStack"],
        duration_minutes=validated_data["durationMinutes"]
    )

    client = boto3.client("bedrock-runtime", region_name=AWS_REGION)

    # Prepare model payload based on model family
    if "nova" in BEDROCK_MODEL_ID.lower():
        payload = {
            "system": [{"text": SYSTEM_PROMPT}],
            "messages": [{"role": "user", "content": [{"text": prompt_text}]}],
            "inferenceConfig": {"temperature": 0.3, "max_new_tokens": 2048}
        }
    elif "claude" in BEDROCK_MODEL_ID.lower():
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "system": SYSTEM_PROMPT,
            "max_tokens": 2048,
            "temperature": 0.3,
            "messages": [{"role": "user", "content": prompt_text}]
        }
    else:
        # Default Claude/Nova compatible format
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "system": SYSTEM_PROMPT,
            "max_tokens": 2048,
            "temperature": 0.3,
            "messages": [{"role": "user", "content": prompt_text}]
        }

    response = client.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        body=json.dumps(payload),
        contentType="application/json",
        accept="application/json"
    )

    raw_response_body = response["body"].read().decode("utf-8")
    resp_obj = json.loads(raw_response_body)

    # Extract text from response depending on model family
    extracted_text = ""
    if "output" in resp_obj and "message" in resp_obj["output"]:
        # Amazon Nova format
        content_items = resp_obj["output"]["message"].get("content", [])
        extracted_text = "".join(item.get("text", "") for item in content_items)
    elif "content" in resp_obj and isinstance(resp_obj["content"], list):
        # Anthropic Claude format
        extracted_text = "".join(item.get("text", "") for item in resp_obj["content"] if item.get("type") == "text")
    elif "completion" in resp_obj:
        extracted_text = resp_obj["completion"]
    else:
        extracted_text = raw_response_body

    # Clean potential markdown wrapping
    cleaned_json_str = extracted_text.strip()
    if cleaned_json_str.startswith("```json"):
        cleaned_json_str = cleaned_json_str[7:]
    elif cleaned_json_str.startswith("```"):
        cleaned_json_str = cleaned_json_str[3:]
    if cleaned_json_str.endswith("```"):
        cleaned_json_str = cleaned_json_str[:-3]
    cleaned_json_str = cleaned_json_str.strip()

    parsed_plan = json.loads(cleaned_json_str)
    return validate_and_normalize_plan(parsed_plan, validated_data)

def validate_and_normalize_plan(plan: Any, validated_data: Dict[str, Any]) -> Dict[str, Any]:
    if not isinstance(plan, dict):
        raise ValueError("Model output is not a JSON object.")

    if not isinstance(plan.get("projectSummary"), str) or not plan["projectSummary"].strip():
        plan["projectSummary"] = f"{validated_data['projectName']} demonstration plan."

    plan["durationMinutes"] = validated_data["durationMinutes"]

    raw_steps = plan.get("steps")
    if not isinstance(raw_steps, list) or len(raw_steps) == 0:
        raise ValueError("Model output missing steps.")

    normalized_steps = []
    for idx, s in enumerate(raw_steps, start=1):
        if not isinstance(s, dict):
            continue
        step_id = s.get("id") or f"step-{idx}"
        title = str(s.get("title", f"Step {idx}")).strip()
        dur = s.get("durationSeconds")
        try:
            dur = int(dur) if dur is not None else 30
        except (ValueError, TypeError):
            dur = 30
        action = str(s.get("action", "Perform step action.")).strip()
        say = str(s.get("say", "Explain this step.")).strip()
        result = str(s.get("expectedResult", "Verify output is displayed.")).strip()

        normalized_steps.append({
            "id": step_id,
            "title": title,
            "durationSeconds": dur,
            "action": action,
            "say": say,
            "expectedResult": result
        })

    if not normalized_steps:
        raise ValueError("No valid steps could be parsed.")
    plan["steps"] = normalized_steps

    raw_safety = plan.get("safetyNet")
    if not isinstance(raw_safety, list) or len(raw_safety) == 0:
        raw_safety = []
    normalized_safety = []
    for s in raw_safety:
        if not isinstance(s, dict):
            continue
        normalized_safety.append({
            "scenario": str(s.get("scenario", "Potential delay or interruption")).strip(),
            "preparation": str(s.get("preparation", "Prepare fallback samples before presenting")).strip(),
            "recovery": str(s.get("recovery", "Switch to pre-loaded sample")).strip(),
            "disclosure": str(s.get("disclosure", "Disclose pre-loaded state to audience")).strip()
        })
    plan["safetyNet"] = normalized_safety

    raw_checklist = plan.get("preDemoChecklist")
    if not isinstance(raw_checklist, list):
        plan["preDemoChecklist"] = [
            "Test the main workflow.",
            "Prepare a genuine sample result.",
            "Check internet connection."
        ]
    else:
        plan["preDemoChecklist"] = [str(item).strip() for item in raw_checklist if str(item).strip()]

    plan["disclaimer"] = "This plan is AI-generated guidance. Verify the steps and expected results in your own application before presenting."
    return plan

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """AWS Lambda entry point for API Gateway HTTP/REST API."""
    origin = None
    headers = event.get("headers") or {}
    for k, v in headers.items():
        if k.lower() == "origin":
            origin = v
            break

    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "POST")
    if http_method.upper() == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": get_cors_headers(origin),
            "body": ""
        }

    raw_body = event.get("body")
    if event.get("isBase64Encoded", False) and raw_body:
        try:
            raw_body = base64.b64decode(raw_body).decode("utf-8")
        except Exception:
            return build_response(400, {
                "error": {
                    "code": "INVALID_ENCODING",
                    "message": "Failed to decode base64 body."
                }
            }, origin)

    if not raw_body:
        return build_response(400, {
            "error": {
                "code": "EMPTY_BODY",
                "message": "Request body must not be empty."
            }
        }, origin)

    # Check payload size (max 50KB)
    if len(raw_body) > 50000:
        return build_response(400, {
            "error": {
                "code": "PAYLOAD_TOO_LARGE",
                "message": "Request body exceeds maximum size limit (50KB)."
            }
        }, origin)

    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError:
        return build_response(400, {
            "error": {
                "code": "INVALID_JSON",
                "message": "Malformed JSON in request body."
            }
        }, origin)

    is_valid, err_msg, validated_data = validate_request_payload(data)
    if not is_valid or validated_data is None:
        return build_response(400, {
            "error": {
                "code": "VALIDATION_ERROR",
                "message": err_msg or "Invalid request parameters."
            }
        }, origin)

    logger.info("Generating demo plan for project '%s', duration %d min", validated_data["projectName"], validated_data["durationMinutes"])

    # Try Bedrock invocation
    try:
        plan = invoke_bedrock(validated_data)
        return build_response(200, plan, origin)
    except Exception as exc:
        logger.warning("Bedrock invocation failed: %s (%s)", type(exc).__name__, str(exc))
        if ENABLE_LOCAL_FALLBACK:
            logger.info("Serving schema-compliant plan via fallback engine.")
            plan = generate_offline_plan(validated_data)
            return build_response(200, plan, origin)

        return build_response(502, {
            "error": {
                "code": "GENERATION_FAILED",
                "message": "We couldn't prepare your plan right now. Please try again."
            }
        }, origin)
