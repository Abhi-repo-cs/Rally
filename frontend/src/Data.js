// Mock data only — no network calls, no backend.

export const kpis = [
  {
    id: 'risk',
    label: 'Revenue at Risk',
    value: '₹12,450',
    delta: '+3.2%',
    trend: 'up',
    tone: 'warn',
  },
  {
    id: 'recovered',
    label: 'Recovered Revenue',
    value: '₹8,750',
    delta: '+18.4%',
    trend: 'up',
    tone: 'good',
  },
  {
    id: 'rate',
    label: 'Recovery Rate',
    value: '70.3%',
    delta: '+5.1%',
    trend: 'up',
    tone: 'good',
  },
  {
    id: 'failed',
    label: 'Failed Payments',
    value: '42',
    delta: '-6',
    trend: 'down',
    tone: 'neutral',
  },
]

export const weeklyPerformance = [
  { label: 'Mon', recovered: 1200, failed: 1800 },
  { label: 'Tue', recovered: 1450, failed: 1600 },
  { label: 'Wed', recovered: 980, failed: 1400 },
  { label: 'Thu', recovered: 1620, failed: 1900 },
  { label: 'Fri', recovered: 1890, failed: 2100 },
  { label: 'Sat', recovered: 1340, failed: 1500 },
  { label: 'Sun', recovered: 1270, failed: 1350 },
]

export const transactions = [
  {
    id: 'TX_TEST_001',
    amount: '₹999',
    reason: 'Insufficient Funds',
    probability: 82,
    action: 'RETRY',
    status: 'Recovered',
  },
  {
    id: 'TX_TEST_002',
    amount: '₹2,499',
    reason: 'Expired Card',
    probability: 87,
    action: 'PAYMENT_LINK',
    status: 'Recovered',
  },
  {
    id: 'TX_TEST_003',
    amount: '₹1,499',
    reason: 'Timeout',
    probability: 76,
    action: 'RETRY',
    status: 'Pending',
  },
  {
    id: 'TX_TEST_004',
    amount: '₹799',
    reason: 'Fraud',
    probability: 5,
    action: 'STOP',
    status: 'Stopped',
  },
  {
    id: 'TX_TEST_005',
    amount: '₹1,999',
    reason: 'Bank Declined',
    probability: 64,
    action: 'RETRY',
    status: 'Pending',
  },
  {
    id: 'TX_TEST_006',
    amount: '₹3,299',
    reason: 'Expired Card',
    probability: 91,
    action: 'PAYMENT_LINK',
    status: 'Recovered',
  },
  {
    id: 'TX_TEST_007',
    amount: '₹549',
    reason: 'Insufficient Funds',
    probability: 58,
    action: 'RETRY',
    status: 'Failed',
  },
  {
    id: 'TX_TEST_008',
    amount: '₹4,150',
    reason: 'Suspected Fraud',
    probability: 12,
    action: 'STOP',
    status: 'Stopped',
  },
]

export const decisionLog = [
  {
    id: 'TX_TEST_001',
    steps: [
      { label: 'Payment Failed', detail: 'Insufficient Funds · ₹999' },
      { label: 'Failure Diagnosed', detail: 'Card balance below charge amount' },
      { label: 'Recovery Probability: 82%', detail: 'High confidence, similar cases recovered' },
      { label: 'Decision: RETRY', detail: 'Scheduled retry in 24 hours' },
      { label: 'Recovery Intervention', detail: 'Automated retry executed' },
      { label: 'Payment Recovered', detail: '₹999 recovered' },
    ],
  },
  {
    id: 'TX_TEST_002',
    steps: [
      { label: 'Payment Failed', detail: 'Expired Card · ₹2,499' },
      { label: 'Failure Diagnosed', detail: 'Card expiry date passed' },
      { label: 'Recovery Probability: 87%', detail: 'Payment link conversion typically high' },
      { label: 'Decision: PAYMENT_LINK', detail: 'Secure update link generated' },
      { label: 'Recovery Intervention', detail: 'Link sent via email + SMS' },
      { label: 'Payment Recovered', detail: '₹2,499 recovered' },
    ],
  },
  {
    id: 'TX_TEST_004',
    steps: [
      { label: 'Payment Failed', detail: 'Fraud flag · ₹799' },
      { label: 'Failure Diagnosed', detail: 'Risk score exceeded safe threshold' },
      { label: 'Recovery Probability: 5%', detail: 'Low confidence, high fraud signal' },
      { label: 'Decision: STOP', detail: 'Recovery attempt blocked' },
      { label: 'Recovery Intervention', detail: 'Escalated to manual review' },
      { label: 'Payment Recovered', detail: 'No recovery — flagged as stopped' },
    ],
  },
]

export const activityFeed = [
  { id: 1, text: 'Retry succeeded for TX_TEST_006 — ₹3,299 recovered', time: '2m ago', tone: 'good' },
  { id: 2, text: 'Payment link sent for TX_TEST_002 — ₹2,499 pending confirmation', time: '14m ago', tone: 'neutral' },
  { id: 3, text: 'TX_TEST_008 flagged as fraud — recovery stopped', time: '32m ago', tone: 'bad' },
  { id: 4, text: 'Retry scheduled for TX_TEST_005 — ₹1,999 in 24h window', time: '48m ago', tone: 'neutral' },
  { id: 5, text: 'Retry succeeded for TX_TEST_001 — ₹999 recovered', time: '1h ago', tone: 'good' },
  { id: 6, text: 'Retry failed for TX_TEST_007 — will re-attempt tomorrow', time: '2h ago', tone: 'bad' },
]

export const demoSteps = [
  { key: 'failed', label: 'FAILED PAYMENT', detail: 'TX_DEMO_001 · ₹999 · Insufficient Funds' },
  { key: 'diagnosed', label: 'DIAGNOSED', detail: 'Card balance below charge amount' },
  { key: 'probability', label: '82% RECOVERY PROBABILITY', detail: 'Model confidence: high' },
  { key: 'decision', label: 'DECISION: RETRY', detail: 'Automated retry scheduled' },
  { key: 'intervention', label: 'RECOVERY INTERVENTION', detail: 'Executing retry now' },
  { key: 'recovered', label: 'PAYMENT RECOVERED', detail: '₹999 recovered successfully' },
]