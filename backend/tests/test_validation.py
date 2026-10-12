import json
import sys
import os
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lambda_function import lambda_handler, validate_request_payload

class TestDemoReadyValidation(unittest.TestCase):

    def test_valid_payload_success(self):
        payload = {
            "projectName": "SmartDoc Scanner",
            "problem": "Manual document sorting takes too much time and results in errors.",
            "features": ["OCR text extraction", "Auto categorization", "Export to CSV"],
            "techStack": "React, Python, OpenCV",
            "durationMinutes": 3
        }
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json", "Origin": "http://localhost:5173"},
            "body": json.dumps(payload)
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 200)
        self.assertIn("Access-Control-Allow-Origin", resp["headers"])
        
        body = json.loads(resp["body"])
        self.assertIn("projectSummary", body)
        self.assertEqual(body["durationMinutes"], 3)
        self.assertIsInstance(body["steps"], list)
        self.assertGreaterEqual(len(body["steps"]), 3)
        
        # Verify step contract
        first_step = body["steps"][0]
        self.assertIn("id", first_step)
        self.assertIn("title", first_step)
        self.assertIn("durationSeconds", first_step)
        self.assertIn("action", first_step)
        self.assertIn("say", first_step)
        self.assertIn("expectedResult", first_step)

        # Verify safety net
        self.assertIn("safetyNet", body)
        self.assertGreaterEqual(len(body["safetyNet"]), 1)
        first_safety = body["safetyNet"][0]
        self.assertIn("scenario", first_safety)
        self.assertIn("preparation", first_safety)
        self.assertIn("recovery", first_safety)
        self.assertIn("disclosure", first_safety)

        # Verify pre-demo checklist and disclaimer
        self.assertIn("preDemoChecklist", body)
        self.assertIn("disclaimer", body)

    def test_missing_project_name(self):
        payload = {
            "projectName": "  ",
            "problem": "Valid problem description",
            "features": ["Feature 1"],
            "durationMinutes": 5
        }
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload)
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 400)
        body = json.loads(resp["body"])
        self.assertIn("error", body)
        self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

    def test_missing_features(self):
        payload = {
            "projectName": "Valid Name",
            "problem": "Valid problem description",
            "features": [],
            "durationMinutes": 5
        }
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload)
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 400)
        body = json.loads(resp["body"])
        self.assertIn("error", body)
        self.assertEqual(body["error"]["code"], "VALIDATION_ERROR")

    def test_too_many_features(self):
        payload = {
            "projectName": "Valid Name",
            "problem": "Valid problem description",
            "features": [f"Feature {i}" for i in range(1, 10)], # 9 features > max 8
            "durationMinutes": 5
        }
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload)
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 400)
        body = json.loads(resp["body"])
        self.assertIn("error", body)
        self.assertIn("Maximum 8 features", body["error"]["message"])

    def test_invalid_duration(self):
        payload = {
            "projectName": "Valid Name",
            "problem": "Valid problem description",
            "features": ["Feature 1"],
            "durationMinutes": 7 # Invalid duration (must be 3, 5, or 10)
        }
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(payload)
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 400)
        body = json.loads(resp["body"])
        self.assertIn("error", body)
        self.assertIn("Duration must be exactly 3, 5, or 10", body["error"]["message"])

    def test_malformed_json(self):
        event = {
            "httpMethod": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": "{invalid_json: 123"
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 400)
        body = json.loads(resp["body"])
        self.assertEqual(body["error"]["code"], "INVALID_JSON")

    def test_options_cors_preflight(self):
        event = {
            "httpMethod": "OPTIONS",
            "headers": {"Origin": "http://localhost:5173"}
        }
        resp = lambda_handler(event, None)
        self.assertEqual(resp["statusCode"], 200)
        self.assertIn("Access-Control-Allow-Origin", resp["headers"])
        self.assertIn("Access-Control-Allow-Methods", resp["headers"])

if __name__ == "__main__":
    unittest.main()
