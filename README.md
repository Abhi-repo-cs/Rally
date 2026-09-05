
Rally

AI-powered subscription payment recovery agent for Razorpay

Rally helps merchants recover failed subscription payments before they
become involuntary churn. Instead of treating every failed payment with
the same fixed retry schedule, Rally identifies the failure reason,
estimates the probability of recovery, selects the safest and most
effective intervention, and executes a personalized recovery workflow.

Problem

A recurring payment can fail even when the customer still wants to
continue their subscription.

For example:

Month 1 → ₹999 ✅
Month 2 → ₹999 ✅
Month 3 → ₹999 ❌

The failure could be caused by:

Insufficient funds
Expired or reissued card
Bank timeout or technical failure
Mandate or limit issue
Authentication problem
Hard issuer/fraud decline

A traditional system may simply retry after a fixed number of days:

Payment failed
      ↓
Retry after X days
      ↓
Retry again
      ↓
Subscription halted
      ↓
Customer becomes churned
      ↓
Merchant loses recurring revenue

Rally turns this into an intelligent recovery loop:

                 PAYMENT FAILS
                       ↓
                Diagnose failure
                       ↓
              Predict recoverability
                       ↓
               Check compliance
                       ↓
               Choose intervention
                 ↙      ↓       ↘
              Retry   Notify   Payment Link
                 \      |       /
                  \     |      /
                   Payment recovered
                         ↓
                  Revenue saved
One-line value proposition

Rally prevents revenue loss and involuntary churn by intelligently
recovering failed subscription payments through AI-driven, personalized
retries and customer interventions.

Key idea

Rally is not just a retry system and not just a chatbot.

It is a revenue recovery orchestration layer that sits on top of
Razorpay's subscription infrastructure.

For every failed payment, Rally aims to answer:

Why did the payment fail?
Can this payment realistically be recovered?
What action has the highest chance of recovery?
When should that action happen?
Which communication channel should be used?
Is the action compliant with the applicable rules?
Was the revenue actually recovered?

The system focuses on the business outcome: recovered revenue,
rather than simply counting retries or messages.

Features
1. Root-cause-aware failure diagnosis

Rally classifies payment failures into recovery-oriented categories.

Failure reason Typical strategy

Insufficient funds Retry at a more appropriate time
Expired/reissued card Ask the customer to update payment details
Bank timeout/technical failure Attempt an appropriate retry
Mandate/limit issue Use a payment-link/re-authorization flow
Fraud/hard issuer decline Stop automated recovery

The project research identifies materially different recoverability
across these failure categories, which is why a universal retry strategy
is insufficient.

2. Recovery propensity scoring

A machine-learning model estimates:

P(payment will be recovered)

The proposed MVP uses Logistic Regression with features such as:

Transaction amount
Failure reason/code
Customer tenure
Previous payment success rate
Retry count
Historical recovery behavior
Time-related features

A low-propensity transaction can be stopped instead of repeatedly
contacting the customer.

3. Intelligent retry timing

For recoverable failures such as insufficient funds, Rally can determine
a better retry window instead of blindly retrying at fixed intervals.

The architecture allows time-series forecasting to be introduced for:

Customer cash-flow patterns
Post-payday recovery windows
Historical successful payment times
Aggregate payment behavior
4. Multi-channel optimization

Rally can choose between:

WhatsApp
SMS
Email

The architecture proposes Thompson Sampling for channel selection.

The system learns from historical outcomes:

Customer
   ↓
WhatsApp → recovered?
SMS      → recovered?
Email    → recovered?
   ↓
Update channel statistics
   ↓
Choose better channel next time
5. Personalized recovery messaging

An LLM is used only for language generation.

The proposed architecture uses Llama 3.1 8B via Groq to generate
concise, localized messages such as Hinglish recovery communication.

The LLM does not decide:

Payment amount
Payment link
Retry limits
Compliance rules
Whether a hard decline should be retried

Those decisions remain deterministic and auditable.

6. Razorpay Payment Links

When automated retry is unsuitable or exhausted, Rally can generate a
Razorpay Payment Link and send it to the customer through an approved
communication channel.

7. Compliance guardrails

Rally follows a bounded-autonomy architecture:

ML suggests an action
        ↓
Rules Engine validates it
        ↓
Compliant? ── No ──→ Defer / Stop
        │
       Yes
        ↓
Execute

The research architecture includes controls for:

Communication time windows
Contact-frequency limits
Retry limits
UPI AutoPay constraints
Customer opt-out
Immutable audit logging

Important: Regulatory requirements can change and must be
independently verified before production deployment. The rules
described here represent the hackathon architecture and research
assumptions, not legal advice.

8. Explainable audit trail

Every important decision can be recorded with:

Input features
Failure reason
Model propensity
Rule evaluations
Selected action
Channel
Timestamp
Outcome

This makes the agent's decisions visible to merchants and useful for
compliance review.

9. Merchant dashboard

The dashboard focuses on measurable business impact.

Core metrics
Revenue at Risk
Recovered Revenue
Recovery Rate
Average Contacts per Customer
Recovery actions
Propensity scores
Compliance decisions
Recent payment events

The primary KPI is:

Recovery Rate =
Recovered Revenue / Revenue at Risk × 100
Architecture

Rally uses a hybrid architecture separating high-throughput
orchestration from machine-learning inference.

                         ┌──────────────────────┐
                         │       Razorpay       │
                         │ Subscriptions / APIs │
                         └──────────┬───────────┘
                                    │
                              Webhooks
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Node.js + Express    │
                         │ Orchestration Layer  │
                         └──────────┬───────────┘
                                    │
                             XState Machine
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
               ▼                    ▼                    ▼
          PostgreSQL          FastAPI / ML          Rules Engine
               │                    │                    │
               │              Propensity Score         │
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    │
                              Decision
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
                Payment Link                Retry / Schedule
                       │
                       ▼
                  Groq / Llama
                 Message Generation
                       │
                       ▼
                Twilio WhatsApp/SMS
                       │
                       ▼
                    Customer
                       │
                       ▼
               Successful Payment
                       │
                       ▼
                Razorpay Webhook
                       │
                       ▼
                 Recovered Revenue
Technology stack

Layer Technology

Frontend React + Tailwind CSS
Backend Node.js + Express
State orchestration XState
Database PostgreSQL
DB connection pooling PgBouncer
ML service Python + FastAPI
ML Scikit-learn
Propensity model Logistic Regression
Failure classification XGBoost / LightGBM (planned enhancement)
Retry timing Prophet / ARIMA (planned enhancement)
Channel optimization Thompson Sampling
LLM Llama 3.1 8B via Groq
Messaging Twilio WhatsApp/SMS
Payments Razorpay APIs
Local webhook testing ngrok

Agent State Machine

Each failed payment moves through an auditable lifecycle.

DETECT
  ↓
DIAGNOSE
  ↓
PREDICT
  ↓
DECIDE
  ↓
INTERVENE
  ↓
OBSERVE
  ├──→ RECOVERED
  │
  └──→ ESCALATE
             ↓
            STOP
DETECT

Receive a verified Razorpay webhook and extract:

Transaction ID
Customer ID
Amount
Failure code
Retry count
Payment status
DIAGNOSE

Classify the failure.

Hard declines should bypass unnecessary recovery actions.

PREDICT

Call the FastAPI ML service and obtain a recovery propensity score.

Example:

{
  "transaction_id": "pay_demo_001",
  "propensity": 0.78
}

A low score can result in:

STOP → low_propensity
DECIDE

Combine ML recommendations with deterministic rules.

The rules engine can check:

Retry count
Contact count
Communication time
Customer opt-out
Failure category
Payment amount
Applicable payment-network constraints
INTERVENE

Execute the selected action:

Retry payment
Generate Payment Link
Generate personalized message
Send WhatsApp/SMS
Schedule a future action
OBSERVE

Wait for the next payment/subscription webhook.

Successful payment:

payment.captured
        ↓
RECOVERED
        ↓
Update recovered_amount
        ↓
Update dashboard

Unsuccessful completion:

Retries exhausted
        ↓
ESCALATE
        ↓
Human intervention
Security: Razorpay Webhook Verification

Webhook authenticity is critical.

The webhook endpoint must verify the Razorpay HMAC-SHA256 signature
using the raw request body before processing the event.

The important sequence is:

Incoming webhook
      ↓
Capture raw bytes
      ↓
Read x-razorpay-signature
      ↓
Compute HMAC-SHA256
      ↓
Compare signatures
      ↓
Only then parse JSON

Do not allow a JSON body parser to modify the payload before signature
verification.

Example:

app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const signature = req.headers['x-razorpay-signature'];

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return res.status(401).send('Invalid signature');
    }

    const payload = JSON.parse(req.body.toString());

    // Process verified webhook
    handleRazorpayEvent(payload);

    res.status(200).send('Webhook received');
  }
);
Database

PostgreSQL stores the state required for recovery, customer history and
auditability.

Core tables
transactions

Tracks payment state.

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
recovery_actions

Tracks every intervention.

action_id
transaction_id
action_type
channel
message_content
sent_at
status
metadata
customer_history

Stores ML features and communication controls.

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
audit_log

Stores the decision trail.

log_id
transaction_id
event_type
input_features
model_prediction
rule_evaluations
action_taken
outcome
timestamp
API Design

The following endpoints are the intended MVP interface.

Webhook
POST /api/webhooks/razorpay

Receives Razorpay events.

Propensity prediction
POST /api/predict

Example request:

{
  "amount": 999,
  "tenure_days": 180,
  "previous_success_rate": 0.92,
  "retry_count": 1,
  "failure_code": "insufficient_funds"
}

Example response:

{
  "propensity": 0.81,
  "recoverable": true
}
Dashboard metrics
GET /api/dashboard/metrics

Example:

{
  "revenueAtRisk": 750000,
  "recoveredRevenue": 450000,
  "recoveryRate": 60,
  "averageContactsPerCustomer": 1.8
}
Audit feed
GET /api/audit

Returns recent agent decisions and actions.

Project Structure

The recommended repository structure is:

rally/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── state-machine/
│   │   ├── rules/
│   │   ├── integrations/
│   │   └── utils/
│   ├── package.json
│   └── server.js
│
├── ml-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── model.py
│   │   └── schemas.py
│   ├── models/
│   │   └── propensity_model.joblib
│   ├── training/
│   │   └── train.py
│   └── requirements.txt
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── migrations/
│
├── scripts/
│   └── generate_mock_data.py
│
├── docs/
│   └── architecture.md
│
├── .env.example
├── .gitignore
└── README.md
Getting Started
Prerequisites

Install:

Node.js
npm
Python 3.10+
PostgreSQL
Git
ngrok

For the complete external integration demo, you will also need
credentials for:

Razorpay Test Mode
Twilio
Groq
1. Clone the repository
git clone <your-repository-url>
cd rally
2. Configure environment variables

Create .env files based on .env.example.

Example:

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Database
DATABASE_URL=

# ML service
ML_SERVICE_URL=http://localhost:8000

# Groq
GROQ_API_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
TWILIO_MESSAGING_SERVICE_SID=

# Application
PORT=5000

Never commit secrets to Git.

3. Start PostgreSQL

Create the database and run:

psql "$DATABASE_URL" -f database/schema.sql
4. Start the ML service
cd ml-service

python -m venv .venv

Activate the environment.

Windows
.venv\Scripts\activate
macOS/Linux
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run the service:

uvicorn app.main:app --reload --port 8000
5. Start the backend
cd backend
npm install
npm run dev
6. Start the frontend
cd frontend
npm install
npm run dev
Synthetic Data

The hackathon MVP should not wait for production payment data.

Generate synthetic payment events for development and model training.

Example:

python scripts/generate_mock_data.py

The intended dataset contains fields such as:

transaction_id
customer_id
amount
failure_code
retry_count
tenure_days
previous_success_rate
timestamp
payment_method
recovered

A larger synthetic dataset allows the ML service and dashboard to be
developed in parallel.

ML Pipeline

The initial MVP uses Logistic Regression because it is:

Fast
Lightweight
Interpretable
Suitable for binary outcomes
Able to return probability scores

Training flow:

Synthetic payment data
        ↓
Feature engineering
        ↓
Categorical encoding
        ↓
Train/Test split
        ↓
Logistic Regression
        ↓
Probability calibration/evaluation
        ↓
joblib model
        ↓
FastAPI
        ↓
Node.js

The target variable is:

recovered = 1
not recovered = 0

The model should be evaluated using appropriate classification metrics
rather than accuracy alone.

Compliance Architecture

Rally uses deterministic controls to constrain AI decisions.

Example:

function canContactCustomer(customer, now) {
  const withinAllowedHours =
    now.getHours() >= 8 &&
    now.getHours() < 19;

  const withinContactLimit =
    customer.contact_count_last_7_days < 3;

  const optedOut =
    customer.opt_out_whatsapp ||
    customer.opt_out_sms ||
    customer.opt_out_email;

  return withinAllowedHours &&
         withinContactLimit &&
         !optedOut;
}

The exact production rules must be validated against the current
applicable RBI, NPCI, DPDP and other regulatory requirements before
deployment.

Demo Flow

The strongest hackathon demonstration is an end-to-end recovery event.

Scenario

Use a failed subscription payment such as:

Customer: Demo Customer
Amount: ₹999
Failure: insufficient_funds
Demo sequence
1. Trigger failed payment
          ↓
2. Razorpay sends webhook
          ↓
3. Rally verifies webhook signature
          ↓
4. DETECT
          ↓
5. DIAGNOSE
   → insufficient_funds
          ↓
6. PREDICT
   → propensity = 0.81
          ↓
7. DECIDE
   → retry later / customer intervention
          ↓
8. Compliance check
   → allowed
          ↓
9. INTERVENE
   → create Payment Link
   → generate personalized message
   → send through Twilio
          ↓
10. Customer pays
          ↓
11. Razorpay sends success webhook
          ↓
12. RECOVERED
          ↓
13. Dashboard updates
   → Revenue Recovered: +₹999

The dashboard should make each step visible to judges.

Dashboard

The dashboard should prioritize business outcomes rather than technical
complexity.

Example layout:

┌──────────────────────────────────────────────────────┐
│                      RALLY                            │
│          Subscription Revenue Recovery                │
├───────────────┬───────────────┬──────────────────────┤
│ Revenue       │ Recovered     │ Recovery Rate         │
│ at Risk       │ Revenue       │                      │
│ ₹7,50,000     │ ₹4,50,000     │ 60%                  │
├───────────────┴───────────────┴──────────────────────┤
│                                                      │
│                 Recovery Activity                   │
│                                                      │
│ 14:32  payment.failed                                │
│       ↓                                              │
│       Diagnose: insufficient_funds                   │
│       ↓                                              │
│       Propensity: 0.81                               │
│       ↓                                              │
│       Decision: retry / WhatsApp                     │
│       ↓                                              │
│       Payment Link generated                         │
│       ↓                                              │
│       Payment recovered                              │
│                                                      │
└──────────────────────────────────────────────────────┘
Business Model

Rally is designed around a performance-based model.

The research architecture models fees as a percentage of successfully
recovered revenue.

Example:

Failed Revenue
      ↓
Traditional Recovery
      ↓
₹225,000 recovered

Rally
      ↓
₹450,000 recovered

Incremental recovery
      ↓
₹225,000

The merchant pays only for the value generated under a performance-based
pricing model.

This aligns the merchant's incentives with Rally's core metric:

Revenue recovered.

Why Rally?

Existing payment-recovery systems often focus on fixed retry schedules,
generic dunning or card-centric infrastructure.

Rally is designed around five differentiators:

1. India-first

Designed around Indian payment rails and the operational realities of
recurring payments in India.

2. Root-cause-aware

Different failure reasons produce different recovery actions.

3. AI + deterministic rules

Machine learning recommends; deterministic rules constrain.

4. Multi-channel

The system can learn whether WhatsApp, SMS or Email works best for a
customer.

5. Revenue-centric

The primary success metric is not:

messages sent

It is:

₹ recovered
MVP Scope

For a 24--72 hour hackathon, Rally should focus on the smallest
end-to-end system that proves the concept.

Must have

React dashboard

Node.js/Express backend

Razorpay webhook receiver

Webhook signature verification

PostgreSQL database

Synthetic payment dataset

Failure diagnosis

Recovery propensity model

Compliance rules engine

Payment Link generation

Twilio WhatsApp/SMS integration

Personalized message generation

Audit logging

Recovered revenue metric

Nice to have

XState production state machine

Thompson Sampling channel optimization

Retry-time forecasting

XGBoost failure classifier

Real-time dashboard updates

Human escalation workflow

Advanced analytics

Do not overbuild during the hackathon

Avoid spending the majority of the hackathon on:

Complex microservice infrastructure
Large LLM deployments
Perfect production-scale ML
Elaborate UI animations
Multi-gateway routing
Full enterprise authentication
Edge cases that cannot be demonstrated

The goal is a convincing end-to-end recovery loop.

24--72 Hour Build Plan

Time Focus

Hours 1--6 Project setup, database, synthetic data
Hours 7--18 Webhook receiver + orchestration
Hours 19--30 ML propensity model + FastAPI
Hours 31--48 Payment Links + Twilio
Hours 49--60 Dashboard + metrics
Hours 61--72 End-to-end testing + pitch/demo

The most important milestone is:

Webhook
   ↓
AI decision
   ↓
Compliance
   ↓
Intervention
   ↓
Payment recovered
   ↓
Dashboard updated
Success Metrics

Rally should ultimately be evaluated using measurable recovery outcomes.

Primary metrics

Revenue at Risk

Sum of failed payment amounts

Recovered Revenue

Sum of successfully recovered payment amounts

Recovery Rate

Recovered Revenue / Revenue at Risk

Incremental Revenue

Rally recovered revenue
-
baseline recovery
Safety metrics
Average contacts per customer
Opt-out compliance
Retry-limit compliance
Percentage of hard declines stopped
Audit-log completeness
Future Roadmap
Phase 1 --- Hackathon MVP

Webhook → Diagnose → Predict → Decide → Intervene → Recover.

Phase 2 --- Learning system

Add:

Better propensity models
Calibrated probabilities
Customer-level historical features
Thompson Sampling
Retry-time forecasting
Phase 3 --- Production platform

Add:

Multi-tenant architecture
Strong authentication/authorization
Queue-based event processing
Observability
Rate limiting
Secrets management
Automated model monitoring
Robust idempotency
Disaster recovery
Phase 4 --- Revenue intelligence

Expand beyond individual payment recovery into:

Customer LTV-aware recovery
Merchant-level optimization
Recovery forecasting
Cohort analytics
Intervention ROI
Automated strategy experimentation
Responsible AI

Rally intentionally limits the role of generative AI.

                 ┌─────────────────────┐
                 │ Deterministic Rules  │
                 │ Compliance + Limits  │
                 └──────────┬──────────┘
                            │
                            ▼
Payment Event → ML Score → Decision → Action
                            │
                            ▼
                    LLM Message Copy

The LLM generates language, not financial truth.

Amounts, payment links, retry limits and compliance decisions are
generated and validated by deterministic application logic.

This makes the system more explainable, predictable and safer to
operate.

References

The project architecture and implementation plan are based primarily on
the project research documents covering:

Subscription payment failure recovery
Razorpay Subscriptions and webhooks
Razorpay Payment Links
UPI AutoPay
Machine-learning propensity scoring
FastAPI model serving
XState orchestration
PostgreSQL and audit trails
Twilio WhatsApp/SMS
Groq/Llama-based message generation
Compliance and bounded autonomy

See the project research documents for the detailed analysis,
assumptions, competitive landscape, architecture and cited external
sources.

Disclaimer

Rally is a hackathon/research prototype.

Payment APIs, messaging policies, RBI/NPCI requirements, DPDP
requirements and other regulatory obligations may change. Production
deployment requires validation against the current official
documentation, legal requirements, security standards and the applicable
terms of each integrated service.

License



Rally

Turn failed subscription payments into recovered revenue.
