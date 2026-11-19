# 🏫 CampusFix AI
### AI-Powered Smart Campus Issue Management System
**Smart Campus. Smarter Solutions.**

Developed for the **AWS ShipIt Challenge**, organized by **Techfest, IIT Bombay**, in collaboration with **Amazon Web Services (AWS)**.

---

## 📌 Executive Summary & Problem Statement

College students and campus residents frequently face severe disruptions to their academic and daily campus life:
- **Hostel Wi-Fi & Intranet Outages**: Intermittent connectivity in rooms disrupting online submissions and exams.
- **Electrical & Safety Hazards**: Sparking switches, blown MCBs, dark unlit walkways, and malfunctioning ceiling fans.
- **Water Supply & Sanitation Faults**: Leaking water purifiers, burst washroom valves, and cold geysers.
- **Classroom & Lecture Hall Equipment Failures**: Flickering projectors, broken audio systems, and failed air conditioning in lecture theatres.
- **Mess Food Quality & Hygiene**: Undercooked meals, sanitary violations, and dining hall maintenance issues.

### The Legacy Problem
Historically, campuses manage these issues through physical register books or informal group chats. Complaints are frequently misplaced, hazardous emergencies get buried under routine requests, students receive zero visibility into resolution progress, and facility leadership lacks data to fix recurring root causes.

### The CampusFix AI Solution
**CampusFix AI** is a centralized, cloud-ready web application engineered to modernize campus facility maintenance:
1. **Intelligent AI Triage**: Autonomous categorization across 11 campus domains, instant urgency calculation (Urgent, High, Medium, Low), and concise 1-sentence summaries.
2. **Dual-Mode AI Resilience**: Powered by Google Gemini API with an immediate, rule-based heuristic NLP fallback.
3. **Photographic Evidence**: Students upload photos of equipment damage for pre-dispatch diagnosis.
4. **Live Transparent Lifecycle**: Real-time visual step steppers and chronological audit logs.
5. **Role-Based Access Control (RBAC)**: Dedicated Student Self-Service Portals and Administrator Control Consoles.
6. **Campus Infrastructure Analytics**: Interactive Recharts visualizations mapping failure hotspots and departmental SLA turnaround times.
7. **AWS Cloud-Ready Architecture**: Built locally on SQLite with an abstract service layer ready to switch to **AWS Lambda (Mangum)**, **Amazon DynamoDB**, and **Amazon S3**.

---

## 🏗️ Architecture & Technology Stack

```
                          ┌─────────────────────────────────────┐
                          │         CampusFix AI Frontend       │
                          │   React 19 • Vite • Tailwind CSS    │
                          │  Recharts • Lucide • Framer Motion  │
                          └──────────────────┬──────────────────┘
                                             │ HTTP / REST (JWT)
                                             ▼
                          ┌─────────────────────────────────────┐
                          │         FastAPI Backend Core        │
                          │      Pydantic v2 • RBAC Auth        │
                          └──────────┬──────────────────────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
                 ▼                   ▼                   ▼
    ┌───────────────────────┐ ┌──────────────┐ ┌──────────────────────┐
    │ Modular AI Engine     │ │ Storage Svc  │ │  Database Layer      │
    │ • Gemini 1.5 Flash    │ │ • Local Disk │ │  • SQLite (Local)    │
    │ • Heuristic NLP Rule  │ │ • Amazon S3  │ │  • DynamoDB (Cloud)  │
    └───────────────────────┘ └──────────────┘ └──────────────────────┘
```

### Technology Breakdown
- **Frontend**:
  - **Framework**: React 19 + Vite 8
  - **Styling**: Tailwind CSS v4 (SaaS aesthetic inspired by Linear, Stripe & Vercel)
  - **Routing**: React Router DOM v7
  - **HTTP Client**: Axios with automatic JWT token interceptors
  - **Icons**: Lucide React
  - **Charts & Data Visualizations**: Recharts
- **Backend**:
  - **Web Framework**: FastAPI (High performance ASGI)
  - **Validation & Settings**: Pydantic v2 & Pydantic-Settings
  - **ORM & Data**: SQLAlchemy 2.0 with SQLite locally
  - **Authentication**: JWT (JSON Web Tokens) with HS256 & Bcrypt password hashing
  - **Serverless Adapter**: Mangum (AWS Lambda ASGI translation)
- **Cloud Infrastructure (AWS ShipIt Ready)**:
  - **Compute**: AWS Lambda via Mangum handler (`aws/lambda_handler.py`)
  - **API Gateway**: Amazon API Gateway HTTP API
  - **Database**: Amazon DynamoDB single-table schema (`aws/serverless_template.yaml`)
  - **Storage**: Amazon S3 for photographic evidence
  - **CDN & Frontend**: AWS Amplify / Amazon CloudFront + S3

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- **Python**: 3.11 or higher (Python 3.14 compatible)
- **Node.js**: v18 or higher (v24.12 tested)
- **npm**: 9.x or higher

### 1. Clone & Set Up Backend
```bash
# Navigate to project root
cd cam

# Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic pydantic-settings sqlalchemy python-multipart pyjwt cryptography bcrypt httpx mangum python-dotenv email-validator

# Run database migration & seed realistic campus data
cd backend
python -m app.db.seed

# Start backend server (runs at http://127.0.0.1:8000)
uvicorn app.main:app --reload --port 8000
```

### 2. Set Up & Start Frontend
```bash
# In a new terminal:
cd frontend

# Install npm packages
npm install

# Start Vite development server (runs at http://127.0.0.1:5173)
npm run dev
```

Open your browser at **`http://127.0.0.1:5173`**.

---

## 🔑 Pre-Seeded Demo Accounts (Instant 1-Click Login)

The system is pre-loaded with realistic campus accounts and complaint histories. Both login pages feature **1-Click Reviewer Access Buttons** for instant evaluation without typing:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `student@campusfix.edu` | `StudentDemo123!` | **Aarav Sharma**, CSE Dept, Roll `IITB-2024-CS101` |
| **Demo Admin** | `admin@campusfix.edu` | `AdminDemo123!` | **Dr. Rajesh Kulkarni**, Facilities & Student Affairs |
| **Student 2** | `priya.patel@campusfix.edu` | `StudentDemo123!` | **Priya Patel**, Electrical Eng, Roll `IITB-2024-EE205` |

---

## 🧠 AI Complaint Triage Engine

The backend provides a modular triage service (`backend/app/services/ai_service.py`):

1. **Category Classification**: Auto-tags complaints into 11 categories:
   - `Hostel`, `Internet/Wi-Fi`, `Electricity`, `Water Supply`, `Classroom`, `Library`, `Mess/Food`, `Cleanliness`, `Infrastructure`, `Security`, `Other`.
2. **Severity / Urgency Determination**:
   - `Urgent`: Hazard triggers (sparks, open circuits, flooding, gas leaks, medical risk).
   - `High`: Exam disruption, dead access points, whole-floor blackouts, food hygiene issues.
   - `Medium`: General functional maintenance.
   - `Low`: Cosmetic fixes, small requests.
3. **Location Extraction**: Automatically extracts campus blocks (e.g. `Hostel 14 Wing B`, `LHC Room 204`, `Central Library 3rd Floor`).
4. **1-Sentence Brief Summary**: Concisely summarizes student input for facility dispatch logs.
5. **Resilient Dual-Mode**:
   - If `GEMINI_API_KEY` is provided in `.env`: Calls Google Gemini 1.5 Flash.
   - If `GEMINI_API_KEY` is empty or unreachable: Uses built-in heuristic NLP classification with high accuracy.

---

## 📊 Live Endpoints (API Reference)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account | Public |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Bearer Token |
| `POST` | `/api/ai/analyze` | AI analysis of complaint text | Bearer Token |
| `POST` | `/api/complaints` | Submit a new complaint ticket | Student / Admin |
| `GET` | `/api/complaints` | List complaints (with filters) | Bearer Token |
| `GET` | `/api/complaints/{id}` | Get full complaint details & history | Bearer Token |
| `PATCH`| `/api/complaints/{id}/status` | Update status, assign team, add notes | Admin Only |
| `POST` | `/api/complaints/{id}/feedback` | Student 1-5 star resolution review | Student Only |
| `POST` | `/api/complaints/upload-image` | Upload photographic proof | Bearer Token |
| `GET` | `/api/analytics` | Recharts dashboard data & KPIs | Bearer Token |

---

## ☁️ AWS Cloud Readiness (Techfest AWS ShipIt Challenge)

CampusFix AI was architected from day one to deploy seamlessly to AWS serverless infrastructure:

1. **`aws/lambda_handler.py`**: Mangum wrapper that converts FastAPI ASGI events to AWS Lambda / API Gateway payload format.
2. **`aws/serverless_template.yaml`**: Full AWS SAM template specifying:
   - `AWS::Serverless::Function` (FastAPI backend)
   - `AWS::Serverless::HttpApi` (API Gateway HTTP API)
   - `AWS::DynamoDB::Table` (Single-table design with GSIs for status and category indexing)
   - `AWS::S3::Bucket` (Complaint photographic evidence storage)
3. **`backend/app/services/storage.py`**: Dual-mode storage adapter that switches from local disk to `S3StorageService` when `USE_AWS_STORAGE=true`.
4. **`backend/app/services/db_adapter.py`**: Repository interface isolating SQLite / DynamoDB implementations.

---

## 🏆 Project Highlights for AWS ShipIt Judges

1. **Full-Stack Working Architecture**: Complete end-to-end integration (Frontend, Backend, Database, Authentication, File Uploads, Analytics).
2. **Linear / Stripe Quality UI**: Modern typography, rounded cards, responsive mobile layout, custom step steppers.
3. **Real-Time Interactive AI Playground**: Integrated in the landing page hero and the complaint report form.
4. **SLA-Driven Lifecycle**: Audited timeline tracking every status transition from "Submitted" to "Resolved".
5. **No Pretend Cloud**: Transparent local development architecture with clean enterprise adapters ready for immediate AWS deployment.
