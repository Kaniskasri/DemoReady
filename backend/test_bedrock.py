import boto3
import json
import os

# Uses AWS CLI credentials or environment variables
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")

print(f"Connecting to Amazon Bedrock in region '{AWS_REGION}'...")
print(f"Testing model: '{MODEL_ID}'...")

client = boto3.client("bedrock-runtime", region_name=AWS_REGION)

# Simple ping message
payload = {
    "messages": [
        {"role": "user", "content": [{"text": "Say 'Bedrock is working!' in 5 words."}]}
    ],
    "inferenceConfig": {"max_new_tokens": 50}
}

try:
    response = client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(payload),
        contentType="application/json",
        accept="application/json"
    )
    res_body = json.loads(response["body"].read().decode("utf-8"))
    
    # Extract text from Amazon Nova response
    message_content = res_body.get("output", {}).get("message", {}).get("content", [])
    reply_text = "".join(item.get("text", "") for item in message_content)
    
    print("\n" + "=" * 50)
    print("SUCCESS! Amazon Bedrock answered:")
    print(reply_text.strip())
    print("=" * 50)
    print("\nYour AWS Bedrock access is 100% active and working!")
except Exception as e:
    print("\n" + "!" * 50)
    print(f"Invocation failed: {type(e).__name__}")
    print(f"Error details: {e}")
    print("!" * 50)
    print("\nTip: Attach 'AmazonBedrockFullAccess' to your IAM user in AWS IAM Console.")
