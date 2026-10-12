# DemoReady — AWS Deployment Notes & Step-by-Step Guide

This guide provides the exact commands and configurations required to deploy DemoReady to AWS using **AWS Lambda**, **Amazon API Gateway (HTTP API)**, **Amazon Bedrock**, and **AWS Amplify Hosting**.

---

## 1. Prerequisites

1. **AWS CLI** installed and configured (`aws configure` with valid credentials in your target region, e.g. `us-east-1`).
2. **Amazon Bedrock Model Access**:
   - Open AWS Console -> Amazon Bedrock -> **Model access**.
   - Enable model access for **Amazon Nova Lite** (`amazon.nova-lite-v1:0`) or **Anthropic Claude 3.5 Sonnet / Haiku** in your chosen region.
3. **Node.js 18+** and **Python 3.10+**.

---

## 2. Deploying the Backend (AWS Lambda & API Gateway)

### Step 2.1: Create the Lambda Execution Role

The Lambda function requires permissions to write CloudWatch logs and invoke Amazon Bedrock models.

```bash
# 1. Create trust policy
cat << 'EOF' > lambda-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# 2. Create IAM Role
aws iam create-role \
  --role-name DemoReadyLambdaExecutionRole \
  --assume-role-policy-document file://lambda-trust-policy.json

# 3. Attach basic execution policy for CloudWatch logs
aws iam attach-role-policy \
  --role-name DemoReadyLambdaExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# 4. Attach inline policy for Amazon Bedrock InvokeModel
cat << 'EOF' > bedrock-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy \
  --role-name DemoReadyLambdaExecutionRole \
  --policy-name DemoReadyBedrockInvoke \
  --policy-document file://bedrock-policy.json
```

### Step 2.2: Package and Deploy AWS Lambda

```bash
cd backend

# Create deployment package
zip -r ../demoready-lambda.zip lambda_function.py prompt.py

cd ..

# Deploy Lambda Function
aws lambda create-function \
  --function-name demoready-generate-plan \
  --runtime python3.10 \
  --role arn:aws:iam::<YOUR_ACCOUNT_ID>:role/DemoReadyLambdaExecutionRole \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://demoready-lambda.zip \
  --timeout 30 \
  --memory-size 256 \
  --environment "Variables={AWS_REGION=us-east-1,BEDROCK_MODEL_ID=amazon.nova-lite-v1:0,ALLOWED_ORIGIN=*}"
```

### Step 2.3: Create Amazon API Gateway (HTTP API)

```bash
# 1. Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name demoready-api \
  --protocol-type HTTP \
  --cors-configuration "AllowOrigins=*,AllowMethods=POST,OPTIONS,AllowHeaders=Content-Type,Authorization" \
  --query "ApiId" --output text)

# 2. Create Lambda Integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:<YOUR_ACCOUNT_ID>:function:demoready-generate-plan \
  --payload-format-version "2.0" \
  --query "IntegrationId" --output text)

# 3. Create POST /generate-plan Route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /generate-plan" \
  --target "integrations/$INTEGRATION_ID"

# 4. Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name demoready-generate-plan \
  --statement-id apigateway-access \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:<YOUR_ACCOUNT_ID>:$API_ID/*/*"

# Your public API endpoint will be:
# https://$API_ID.execute-api.us-east-1.amazonaws.com
```

---

## 3. Deploying the Frontend (AWS Amplify Hosting)

### Method A: AWS Amplify via GitHub / Git (Recommended)
1. Push this repository to GitHub.
2. In AWS Console, open **AWS Amplify** -> **Create new app** -> **GitHub**.
3. Select the repository and `main` branch.
4. Set App root to `frontend`.
5. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://<API_ID>.execute-api.us-east-1.amazonaws.com`
6. Click **Save and Deploy**.

### Method B: Manual Zip Deploy via Amplify CLI
```bash
cd frontend

# Set the deployed API Gateway endpoint in .env.production
echo "VITE_API_BASE_URL=https://<API_ID>.execute-api.us-east-1.amazonaws.com" > .env.production

# Build static bundle
npm run build

# Deploy dist/ directory via Amplify Console or AWS S3 + CloudFront
```

---

## 4. Production Security Review
- **No AWS Credentials in Client**: The frontend only accesses the public API Gateway HTTPS endpoint.
- **IAM Least Privilege**: Lambda only assumes its role with scoped CloudWatch and Bedrock permissions.
- **CORS Restriction**: Once the Amplify domain is provisioned (e.g., `https://main.<app-id>.amplifyapp.com`), update `ALLOWED_ORIGIN` in the Lambda environment variables and API Gateway CORS settings.
