Rally
AI-Powered Subscription Payment Recovery
Rally is an AI-driven payment recovery system designed to reduce revenue
loss caused by failed subscription payments and involuntary churn.
When a recurring payment fails because of insufficient funds, expired
cards, bank timeouts, mandate issues, or other failure reasons,
traditional systems often apply the same retry strategy to every
customer. Rally instead analyzes the failure, evaluates recoverability,
selects an appropriate recovery action, and records the decision for
transparency and auditability.
> **Core idea:** Turn failed subscription payments from lost revenue
> into recoverable revenue.
---
The Problem
A customer may still want to continue a subscription even when a
recurring payment fails.
For example:
``` text
Month 1 → ₹999 ✅
Month 2 → ₹999 ✅
Month 3 → ₹999 ❌
```
A payment can fail because of:
Insufficient funds
Expired or reissued cards
Bank/network timeout
Mandate or limit issues
Authentication problems
Hard issuer/fraud declines
If the failure is not handled intelligently:
``` text
Payment fails
      ↓
Generic retry
      ↓
Retry fails
      ↓
Customer does not notice
      ↓
Subscription is halted
      ↓
Involuntary churn
      ↓
Merchant loses recurring revenue
```
Rally addresses this by making the recovery process failure-aware,
data-driven, and explainable.
---
How Rally Works
``` text
Failed Subscription Payment
            │
            ▼
       Detect Failure
            │
            ▼
      Diagnose Reason
            │
            ▼
     Predict Recovery
            │
            ▼
       Decide Action
        /     |      \
     Retry  Notify   Update
        \     |      /
            ▼
       Recovery Action
            │
            ▼
     Payment Recovered
            │
            ▼
      Audit / Tracking
```
The architecture follows the core states:
DETECT -- receive the failed payment event.
DIAGNOSE -- identify the failure reason.
PREDICT -- estimate recovery propensity using ML.
DECIDE -- select an appropriate recovery strategy.
INTERVENE -- execute the selected recovery action.
OBSERVE -- wait for the next payment result.
ESCALATE / STOP -- stop safely or hand the case to a human when
recovery is not appropriate.
---
Why AI Instead of Blind Retries?
Different failures require different actions.
Failure                Example Recovery Strategy
---
Insufficient funds     Retry at a more suitable time
Expired card           Ask customer to update payment details
Bank timeout           Retry quickly
Mandate issue          Request re-authorization / payment
Hard decline / fraud   Stop automated recovery
Rally combines:
Machine Learning for recovery propensity
Rules-based decisioning for deterministic controls
Failure classification for root-cause-aware actions
Multi-channel recovery for customer intervention
PostgreSQL for transaction and audit data
Node.js/Express as the orchestration layer
FastAPI + Scikit-learn as the intelligence layer
The architecture deliberately keeps financial decisions deterministic
and auditable rather than relying on an LLM to make payment decisions.
---
Project Architecture
``` text
                         RALLY
                           │
              ┌────────────┴────────────┐
              │                         │
        React Frontend             Node.js Backend
        Vite + Tailwind              Express :5000
              │                         │
              │                         ├──────────────┐
              │                         │              │
              │                    PostgreSQL      ML Service
              │                                    FastAPI :8000
              │
              └──── Merchant Dashboard
```
Components
1. Frontend
React + Vite + Tailwind CSS
The frontend provides the merchant-facing dashboard and demo experience.
Current MVP status:
UI is available
Dashboard is implemented
Backend/database integration is not fully connected to the dashboard
yet
This does not affect the core backend recovery workflow.
2. Backend
Node.js + Express
The backend acts as the orchestration layer.
Responsibilities include:
Receiving payment/recovery events
Diagnosing payment failures
Running recovery decision logic
Communicating with the ML service
Executing recovery actions
Persisting transaction/recovery information
Maintaining the audit trail
Backend port:
``` text
5000
```
3. Intelligence Layer
Python + FastAPI + Scikit-learn
The ML service provides recovery propensity predictions.
The architecture uses classical ML because payment recovery requires:
Fast inference
Predictable behavior
Explainability
Deterministic outputs
Low infrastructure requirements
4. Database
PostgreSQL
The database stores the core recovery state.
Main entities:
``` text
transactions
recovery_actions
customer_history
audit_log
```
The audit layer records recovery actions and decision information for
transparency.
---
Technology Stack
Layer              Technology
---
Frontend           React
Build Tool         Vite
Styling            Tailwind CSS
Backend            Node.js
API Framework      Express
Database           PostgreSQL
ML Service         Python + FastAPI
ML                 Scikit-learn
Model              Logistic Regression / classification pipeline
Payment Platform   Razorpay
Messaging          Twilio
AI Messaging       Groq / Llama
Version Control    Git
---
Project Structure
The current MVP is organized approximately as:
``` text
C:\rally
│
├── backend
│   ├── package.json
│   ├── node_modules
│   └── src
│       ├── server.js
│       ├── .env
│       └── ...
│
├── frontend
│   ├── package.json
│   ├── src
│   └── ...
│
└── ml-service
    ├── app
    └── ...
```
> The current local backend setup keeps `.env` inside `backend/src`,
> because `server.js` is currently located there and is being launched
> directly from that directory.
---
How to Run Rally
Prerequisites
Install:
Node.js
npm
PostgreSQL
Python 3.x
Git
---
1. Start PostgreSQL
Make sure PostgreSQL is running locally.
Verify that your Rally database exists and that the connection details
are available to the backend.
---
2. Configure the Backend
Open:
``` text
C:\rally\backend\src\.env
```
Example:
``` env
PORT=5000
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/rally
```
Use the actual PostgreSQL username, password, host, port, and database
configured on your machine.
Do not commit `.env` or real API keys to GitHub.
---
3. Start the Node.js Backend
Open PowerShell:
``` powershell
cd C:\rally\backend\src
node server.js
```
A successful startup should show PostgreSQL connection messages and the
server should listen on:
``` text
http://localhost:5000
```
Important
If you see:
``` text
EADDRINUSE: address already in use :::5000
```
it means another Rally/Node process is already using port 5000.
Do not start a second backend instance.
Check the process with:
``` powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen |
Select-Object LocalPort,OwningProcess
```
Then test the running backend:
``` powershell
Invoke-RestMethod http://localhost:5000/health
```
---
4. Start the ML Service
Open a second PowerShell window.
Go to the ML service:
``` powershell
cd C:\rally\ml-service
```
Activate the Python environment if one exists:
``` powershell
.\venv\Scripts\Activate.ps1
```
Then start FastAPI:
``` powershell
uvicorn app.main:app --reload --port 8000
```
The ML service should be available on:
``` text
http://localhost:8000
```
---
5. Start the React Frontend
Open a third PowerShell window:
``` powershell
cd C:\rally\frontend
npm install
npm run dev
```
Vite will display the local frontend URL, normally:
``` text
http://localhost:5173
```
Open that address in your browser.
---
Running All Three Layers
For the complete local MVP:
Terminal 1 --- Backend
``` powershell
cd C:\rally\backend\src
node server.js
```
Terminal 2 --- ML Service
``` powershell
cd C:\rally\ml-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```
Terminal 3 --- Frontend
``` powershell
cd C:\rally\frontend
npm run dev
```
You should have:
``` text
Frontend     → http://localhost:5173
Backend      → http://localhost:5000
ML Service   → http://localhost:8000
PostgreSQL   → local database
```
---
MVP Demo Flow
For a hackathon demonstration, the intended flow is:
``` text
1. Payment fails
       ↓
2. Backend receives failure
       ↓
3. Failure reason is diagnosed
       ↓
4. ML estimates recovery probability
       ↓
5. Recovery strategy is selected
       ↓
6. Recovery action is executed/simulated
       ↓
7. Result is stored in PostgreSQL
       ↓
8. Audit information is recorded
```
A representative transaction can be:
``` text
Transaction: TX_TEST_001
Customer:    CUS_TEST_001
Amount:      ₹999
Failure:     INSUFFICIENT_FUNDS
```
Expected reasoning:
``` text
INSUFFICIENT_FUNDS
        ↓
Recoverable failure
        ↓
Evaluate recovery probability
        ↓
Select retry/recovery action
        ↓
Recovery succeeds (demo simulation)
        ↓
₹999 recovered
```
---
Dashboard
The frontend is designed to present the metrics that matter to merchants
and judges:
``` text
Revenue at Risk
Recovered Revenue
Recovery Rate
Recovery Decisions
Audit Trail
```
The architecture defines these metrics as the primary business-facing
measurements of the system.
Current MVP limitation
The dashboard is currently not fully connected to the live
backend/database.
The core backend, PostgreSQL connection, and recovery logic are the
priority MVP components. The dashboard can be connected to backend APIs
as a subsequent integration step.
Do not interpret static/demo dashboard values as live production data.
---
Database Model
The core data model contains:
`transactions`
Tracks payment state:
``` text
transaction_id
merchant_id
customer_id
amount
timestamp
payment_method
issuing_bank
initial_status
failure_code
failure_reason
retry_count
final_status
recovered_amount
```
`recovery_actions`
Tracks interventions:
``` text
action_id
transaction_id
action_type
channel
message_content
sent_at
status
metadata
```
`customer_history`
Stores recovery and compliance features:
``` text
customer_id
merchant_id
tenure_days
previous_success_rate
customer_value
opt_out_whatsapp
opt_out_email
opt_out_sms
last_contact_at
contact_count_last_7_days
```
`audit_log`
Records decision and action history:
``` text
log_id
transaction_id
event_type
input_features
model_prediction
rule_evaluations
action_taken
outcome
timestamp
```
---
Compliance-by-Design
Rally is designed around bounded autonomy.
The ML model does not have unlimited authority to contact customers or
execute recovery actions.
The architecture applies deterministic controls around:
Communication timing
Retry limits
Customer opt-out status
Hard payment declines
Maximum outreach frequency
Audit logging
This creates a system where:
``` text
ML Prediction
      ↓
Rules / Compliance Check
      ↓
Approved Action
```
rather than:
``` text
LLM/AI
  ↓
Unrestricted Financial Action
```
---
Security Notes
For production Razorpay webhook integration, webhook authenticity must
be verified using the original request body and the Razorpay webhook
signature before processing the event.
The intended architecture is:
``` text
Razorpay Webhook
       ↓
Raw Request Body
       ↓
Signature Verification
       ↓
Parse JSON
       ↓
Recovery State Machine
```
Never expose:
Database passwords
Razorpay secret keys
Razorpay webhook secrets
Twilio credentials
Groq API keys
in source control.
Use environment variables for secrets.
---
What Makes Rally Different?
Traditional payment recovery:
``` text
Payment failed
      ↓
Wait fixed period
      ↓
Retry
      ↓
Retry again
      ↓
Stop
```
Rally:
``` text
Payment failed
      ↓
Why did it fail?
      ↓
Can it be recovered?
      ↓
What is the best action?
      ↓
When should we act?
      ↓
Which channel should we use?
      ↓
Execute safely
      ↓
Observe outcome
      ↓
Measure revenue recovered
```
The key metric is therefore not:
> "How many messages did we send?"
It is:
> **"How much revenue did we recover?"**
---
Hackathon MVP Scope
The MVP focuses on demonstrating the core vertical slice rather than
production-scale infrastructure.
Included
React merchant interface
Node.js orchestration backend
PostgreSQL persistence
Payment failure diagnosis
Recovery decision logic
ML propensity scoring architecture
Recovery action tracking
Audit trail
Simulated recovery flow
Razorpay-oriented architecture
Compliance-oriented rules
Current limitations
Dashboard is not fully connected to live backend data
Some external integrations may operate in test/sandbox/demo mode
Recovery success can be simulated for demonstration
Production Razorpay/Twilio credentials and deployment infrastructure
are outside the local MVP
These limitations are intentional MVP scoping decisions for a hackathon
prototype.
---
Judge Quick Start
If you are evaluating Rally, the shortest explanation is:
``` text
Rally detects failed subscription payments,
understands why they failed,
predicts whether recovery is worthwhile,
chooses the appropriate recovery action,
and records the result.
```
Architecture
``` text
React
  ↓
Node.js / Express
  ↓
PostgreSQL
  ↓
FastAPI / ML
```
Business Value
``` text
Failed Payment
      ↓
Recoverable Revenue
      ↓
Reduced Involuntary Churn
      ↓
Higher Merchant Revenue
```
Demo Metric
``` text
Revenue Recovered
```
---
Future Roadmap
After the MVP, Rally can be extended with:
Live Razorpay webhook ingestion
Live Razorpay Payment Links
Twilio WhatsApp/SMS integration
Connected real-time dashboard
Automated retry scheduling
Customer-level recovery propensity
Channel optimization
Production-grade webhook verification
Real-time audit streaming
Multi-tenant merchant architecture
---
Project Vision
Rally is not intended to be another generic notification or retry
system.
Its purpose is to build an intelligent recovery layer around recurring
payments:
``` text
Payment Infrastructure
        +
Machine Learning
        +
Deterministic Rules
        +
Customer Intervention
        +
Auditability
        =
Rally
```
Rally helps merchants recover revenue that would otherwise be lost to
failed subscription payments and involuntary churn.
---
License
This project was developed as a hackathon MVP.
