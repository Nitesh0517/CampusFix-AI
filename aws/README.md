# CampusFix AI — AWS Architecture & Cloud Readiness Guide
### Built for AWS ShipIt Challenge | Techfest, IIT Bombay in collaboration with AWS

## 1. Cloud Architecture Overview

CampusFix AI is engineered with an enterprise serverless architecture on Amazon Web Services (AWS), ensuring high availability, sub-second latency, and scale to thousands of campus users with zero idle server costs:

- **Frontend Hosting**: AWS Amplify / Amazon CloudFront + Amazon S3 static website hosting with global edge caching.
- **API Management**: Amazon API Gateway (HTTP APIs) routing requests with low latency, SSL termination, and rate-limiting.
- **Compute Layer**: AWS Lambda running Python 3.11/3.14 via Mangum ASGI adapter, handling user authentication, complaint triage, and analytics.
- **Primary Data Store**: Amazon DynamoDB with Single-Table Design (or Amazon Aurora Serverless PostgreSQL), supporting ACID transactions and high query throughput.
- **Evidence Storage**: Amazon S3 (Encrypted at rest with KMS, presigned uploads, lifecycle rules for cost efficiency).
- **AI Intelligence**: Modular AI service connecting to Gemini API (or AWS Bedrock Claude 3.5 Sonnet / Titan) with intelligent heuristic fallback.

## 2. Local to Cloud Dual-Mode Architecture

The backend implements the Adapter & Repository patterns:
- When running locally: Uses SQLite (`campusfix.db`) and local multipart disk uploads (`/uploads/`).
- When running on AWS: Activated automatically via `USE_AWS_STORAGE=true` and IAM execution roles without code modifications.

## 3. Deployment Commands (AWS SAM)

```bash
# 1. Build SAM package
sam build -t aws/serverless_template.yaml

# 2. Deploy to AWS
sam deploy --guided
```
