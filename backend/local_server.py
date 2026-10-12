"""
Local development server for DemoReady backend.
Emulates AWS API Gateway HTTP API and forwards requests to lambda_function.lambda_handler.
"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add current directory to path
current_dir = os.path.dirname(__file__)
sys.path.insert(0, current_dir)

# Load backend/.env if present
env_file = os.path.join(current_dir, ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

from lambda_function import lambda_handler

PORT = int(os.environ.get("PORT", 3001))

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "DemoReady API",
        "description": "AI-powered demo preparation API built with AWS Lambda and Amazon Bedrock.",
        "version": "1.0.0"
    },
    "servers": [
        {"url": f"http://127.0.0.1:{PORT}", "description": "Local Development Gateway"}
    ],
    "paths": {
        "/generate-plan": {
            "post": {
                "summary": "Generate AI Demo Plan",
                "description": "Synthesizes timed demo steps, speaking prompts, rehearsal checklist, and demo safety net.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "required": ["projectName", "problem", "features"],
                                "properties": {
                                    "projectName": {"type": "string", "example": "DemoReady"},
                                    "problem": {"type": "string", "example": "Builders freeze or ramble during live hackathon demos when unexpected bugs happen."},
                                    "features": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                        "example": [
                                            "Timed demo sequence generator",
                                            "Observable outcome verification checklist",
                                            "Demo Safety Net contingency playbook"
                                        ]
                                    },
                                    "techStack": {"type": "string", "example": "React, TypeScript, AWS Lambda, Amazon Bedrock"},
                                    "durationMinutes": {"type": "integer", "enum": [3, 5, 10], "default": 5}
                                }
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Successfully generated demo plan with checklist and safety net"
                    },
                    "400": {
                        "description": "Validation error (missing fields or exceeded bounds)"
                    },
                    "502": {
                        "description": "Bedrock generation failure"
                    }
                }
            }
        },
        "/health": {
            "get": {
                "summary": "Health Check",
                "description": "Returns current backend health status.",
                "responses": {
                    "200": {"description": "Server is healthy and ready to accept requests"}
                }
            }
        }
    }
}

SWAGGER_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DemoReady API - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><circle cx='12' cy='12' r='10'/></svg>" />
  <style>
    body {{ margin: 0; padding: 0; background: #fafafa; font-family: sans-serif; }}
    .topbar-banner {{
      background: #1e1e2f; color: #fff; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
    }}
    .topbar-banner a {{
      color: #38bdf8; text-decoration: none; font-weight: bold; margin-left: 12px;
    }}
    .topbar-banner a:hover {{ text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="topbar-banner">
    <div><strong>DemoReady API Server</strong> &bull; Local Gateway active on port {PORT}</div>
    <div>Frontend Web UI: <a href="http://localhost:5173" target="_blank">http://localhost:5173 &rarr;</a></div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {{
      window.ui = SwaggerUIBundle({{
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true
      }});
    }};
  </script>
</body>
</html>
"""

class LocalGatewayHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        clean_path = self.path.split("?")[0].rstrip("/")
        if clean_path in ("", "/docs", "/swagger"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(SWAGGER_HTML.encode("utf-8"))
        elif clean_path in ("/openapi.json", "/openapi.yaml", "/swagger.json"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(OPENAPI_SPEC, indent=2).encode("utf-8"))
        else:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            info = {
                "status": "healthy",
                "service": "DemoReady Backend API",
                "swagger": f"http://127.0.0.1:{PORT}/docs",
                "frontend": "http://localhost:5173",
                "endpoints": {
                    "health": f"GET http://127.0.0.1:{PORT}/health",
                    "generate_plan": f"POST http://127.0.0.1:{PORT}/generate-plan"
                }
            }
            self.wfile.write(json.dumps(info, indent=2).encode("utf-8"))

    def do_OPTIONS(self):
        event = {
            "httpMethod": "OPTIONS",
            "headers": dict(self.headers),
            "body": ""
        }
        resp = lambda_handler(event, None)
        self.send_response(resp["statusCode"])
        for k, v in resp.get("headers", {}).items():
            self.send_header(k, v)
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else ""

        event = {
            "httpMethod": "POST",
            "headers": dict(self.headers),
            "body": post_data,
            "path": self.path,
            "requestContext": {
                "http": {
                    "method": "POST",
                    "path": self.path
                }
            }
        }

        resp = lambda_handler(event, None)
        self.send_response(resp["statusCode"])
        for k, v in resp.get("headers", {}).items():
            self.send_header(k, v)
        self.end_headers()

        response_body = resp.get("body", "")
        self.wfile.write(response_body.encode("utf-8"))

    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write(f"[LocalGateway] {self.address_string()} - {format % args}\n")

if __name__ == "__main__":
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, LocalGatewayHandler)
    print(f"[*] DemoReady local backend listening at http://127.0.0.1:{PORT}")
    print(f"[*] Ready to handle POST /generate-plan")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down local server...")
        httpd.server_close()
