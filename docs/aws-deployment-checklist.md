# CampusFix AI — AWS Deployment Checklist & Execution Guide
### Built for AWS ShipIt Challenge | Techfest, IIT Bombay in collaboration with AWS

> [!NOTE]
> This guide is prepared for execution once AWS account access is fully reactivated. Do not run deployment commands until account reactivation is confirmed by AWS Support.

---

## 1. Pre-Deployment Prerequisites

- [ ] **AWS Account Status**: Verified active and in good standing.
- [ ] **AWS CLI**: Installed and configured (`aws configure` with region `ap-south-1`).
- [ ] **AWS SAM CLI**: Installed (`sam --version`).
- [ ] **IAM Permissions**: User / deployment role with permissions for CloudFormation, Lambda, API Gateway, DynamoDB, S3, and IAM Role creation.

---

## 2. Phase 1: Deploy Backend (AWS SAM)

### Step 1: Build SAM Package
```bash
# Navigate to project root
cd cam

# Build serverless deployment bundle
sam build -t aws/serverless_template.yaml
```

### Step 2: Deploy Guided Stack
```bash
sam deploy --guided \
  --stack-name campusfix-ai-prod \
  --region ap-south-1 \
  --capabilities CAPABILITY_IAM
```

During guided deployment, answer the prompts:
- **Stack Name**: `campusfix-ai-prod`
- **AWS Region**: `ap-south-1`
- **Parameter JwtSecret**: *(Enter secure JWT secret phrase)*
- **Parameter GeminiApiKey**: *(Enter Gemini API key or leave empty for rule-based NLP)*
- **Confirm changes before deploy**: `y`
- **Allow SAM CLI to create IAM roles**: `y`
- **CampusFixApiFunction has no authentication**: `y` *(API Gateway routes to FastAPI JWT middleware)*
- **Save arguments to configuration file**: `y`

### Step 3: Capture Outputs
Upon successful deployment, SAM outputs the API Gateway Endpoint:
```
Key: CampusFixApiUrl
Value: https://<api-id>.execute-api.ap-south-1.amazonaws.com/
```

---

## 3. Phase 2: Deploy Frontend (AWS Amplify or CloudFront + S3)

### Option A: AWS Amplify (Recommended & Fastest)
1. In the **AWS Management Console**, navigate to **AWS Amplify**.
2. Click **Deploy an app** ➔ Select **GitHub** ➔ Authorize `Nitesh0517/CampusFix-AI`.
3. Select branch: `main`.
4. Amplify automatically detects `amplify.yml`.
5. Under **Environment variables**, set:
   - `VITE_API_URL`: `https://<api-id>.execute-api.ap-south-1.amazonaws.com`
6. Click **Save and Deploy**.

### Option B: Amazon S3 + Amazon CloudFront
```bash
# 1. Build frontend with cloud API URL
cd frontend
export VITE_API_URL="https://<api-id>.execute-api.ap-south-1.amazonaws.com"
npm run build

# 2. Create static website bucket
aws s3 mb s3://campusfix-frontend-<account-id> --region ap-south-1

# 3. Sync build artifacts
aws s3 sync dist/ s3://campusfix-frontend-<account-id> --delete

# 4. Create CloudFront distribution with SPA error response:
# Custom Error Response: Error Code 404 -> Response Path /index.html -> HTTP Code 200
```

---

## 4. Phase 3: Post-Deployment Smoke Tests

- [ ] **Health Check**:
  ```bash
  curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/api/health
  # Expected: {"status":"healthy","database":"connected"}
  ```
- [ ] **Root Endpoint**:
  ```bash
  curl https://<api-id>.execute-api.ap-south-1.amazonaws.com/
  ```
- [ ] **Student Authentication**: Register and log in via the deployed frontend URL.
- [ ] **AI Complaint Triage**: Submit a test ticket and verify category, priority, and summary generation.
- [ ] **Image Upload**: Upload a sample photo and verify S3 storage URL.
- [ ] **Admin Triage & Status Update**: Update status to "In Progress" and "Resolved".
- [ ] **Campus Analytics**: Verify Recharts graphs render live data.

---

## 5. Rollback & Teardown Instructions

To completely remove all deployed AWS resources and prevent any residual charges:
```bash
# Delete CloudFormation SAM stack
sam delete --stack-name campusfix-ai-prod --region ap-south-1

# Empty and delete S3 Evidence Bucket if needed
aws s3 rm s3://campusfix-evidence-<account-id> --recursive
aws s3 rb s3://campusfix-evidence-<account-id>
```
