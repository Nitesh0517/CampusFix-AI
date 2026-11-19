# CampusFix AI — AWS Cost Estimation & Economics
### Built for AWS ShipIt Challenge | Techfest, IIT Bombay in collaboration with AWS

## 1. Projected Campus Workload
Based on an Indian institute campus (e.g. IIT Bombay) with **15,000 students and residents**:
- **Daily active users**: ~1,500 students & facility staff
- **Monthly complaints submitted**: ~3,000 tickets
- **Monthly API Gateway requests**: ~300,000 API requests (triage, status tracking, notifications, analytics)
- **Monthly photo evidence uploads**: ~2,500 images @ 1.5 MB avg = ~3.75 GB / month

---

## 2. Monthly AWS Cost Breakdown

| AWS Service | Usage Metric | Free Tier Allowance | Estimated Monthly Cost |
| :--- | :--- | :--- | :--- |
| **AWS Lambda** (Python 3.11 / Mangum) | 300,000 requests @ 512 MB memory, 400ms avg execution = 61,440 GB-seconds | **1,000,000 requests & 400,000 GB-seconds free forever** | **\$0.00** |
| **Amazon API Gateway** (HTTP APIs v2) | 300,000 HTTP requests | **1,000,000 requests free for first 12 months** | **\$0.00** (\$0.30 thereafter) |
| **Amazon DynamoDB** (Pay-Per-Request) | ~3,000 items + 30,000 reads/writes (< 1 GB data) | **25 GB storage + 2.5M stream read units free forever** | **\$0.00** |
| **Amazon S3** (Evidence Photos) | 3.75 GB / month standard storage + 2,500 PUTs | **5 GB storage, 20,000 GETs, 2,000 PUTs free for 12 months** | **\$0.05 – \$0.15** |
| **Amazon CloudFront** (Global Edge CDN) | 15 GB data transfer out | **1 TB data transfer out free forever** | **\$0.00** |
| **AWS Secrets Manager** (Optional) | 1 secret (JWT Secret) | 30-day free trial | **\$0.40** (or \$0 using SAM Parameters) |

---

## 3. Total Estimated Monthly Cost

- **During AWS Free Tier (First 12 Months)**: **\$0.00 – \$0.50 / month**
- **Post Free Tier (Ongoing Enterprise Production)**: **~\$1.50 – \$3.00 / month**

---

## 4. Architectural Cost-Optimizations Applied

1. **HTTP APIs v2 vs REST APIs**:
   Using Amazon API Gateway HTTP API v2 provides a **71% cost reduction** compared to legacy REST APIs (\$1.00/million vs \$3.50/million).
2. **DynamoDB Pay-Per-Request (On-Demand)**:
   Avoids paying for provisioned throughput capacity during night hours and university vacation periods.
3. **S3 Intelligent Lifecycle Rules**:
   Evidence photos automatically transition from S3 Standard to S3 One Zone-IA after 60 days, and archive to S3 Glacier Flexible Retrieval after 180 days, reducing storage costs by over 70%.
4. **Lambda Memory Optimization**:
   Configured at 512 MB to balance CPU allocation (which scales linearly with memory in Lambda) against execution duration for minimum GB-second costs.
