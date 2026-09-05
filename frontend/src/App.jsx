import { useEffect, useState } from 'react'
import { runRecovery } from "./api.js";
import {
  LayoutGrid,
  Activity,
  ListOrdered,
  GitBranch,
  Settings as SettingsIcon,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  X,
  CheckCircle2,
  Circle,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import {
  kpis,
  weeklyPerformance,
  transactions,
  decisionLog,
  activityFeed,
  demoSteps,
} from './data.js'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'activity', label: 'Recovery Activity', icon: Activity },
  { id: 'transactions', label: 'Transactions', icon: ListOrdered },
  { id: 'decisions', label: 'Decision Log', icon: GitBranch },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

const STATUS_STYLES = {
  Recovered: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Stopped: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Failed: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

const ACTION_STYLES = {
  RETRY: 'bg-rally-50 text-rally-700 ring-1 ring-rally-200',
  PAYMENT_LINK: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  STOP: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export default function App() {
  const [activeNav, setActiveNav] = useState('overview')
  const [demoOpen, setDemoOpen] = useState(false)
const [recoveryResult, setRecoveryResult] = useState(null)

  return (
    <div className="flex min-h-screen bg-rally-bg text-rally-text">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onRunDemo={() => setDemoOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {activeNav === 'overview' && <Overview onRunDemo={() => setDemoOpen(true)} />}
          {activeNav === 'activity' && <RecoveryActivity />}
          {activeNav === 'transactions' && <TransactionsPage />}
          {activeNav === 'decisions' && <DecisionLogPage />}
          {activeNav === 'settings' && <SettingsPage />}
        </main>
      </div>

      {demoOpen && (
  <RecoveryDemoModal
    onClose={() => setDemoOpen(false)}
    onComplete={setRecoveryResult}
  />
)}
    </div>
  )
}

/* ---------------------------------- Sidebar ---------------------------------- */

function Sidebar({ activeNav, setActiveNav }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-rally-border bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-rally-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rally-600 text-white">
          <Zap size={17} strokeWidth={2.4} />
        </div>
        <span className="text-[17px] font-bold tracking-tight text-rally-text">Rally</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-rally-50 text-rally-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-rally-text'
              }`}
            >
              <Icon size={17} strokeWidth={2.2} className={active ? 'text-rally-600' : 'text-slate-400'} />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-rally-border p-4">
        <div className="rounded-xl bg-rally-50 p-3.5">
          <p className="text-xs font-semibold text-rally-700">Recovery agent status</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Monitoring 42 failed payments across 3 gateways.
          </p>
        </div>
      </div>
    </aside>
  )
}

/* ---------------------------------- Header ---------------------------------- */

function Header({ onRunDemo }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-rally-border bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rally-600 text-white md:hidden">
          <Zap size={16} strokeWidth={2.4} />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold leading-tight text-rally-text">
            AI-Powered Payment Recovery
          </h1>
          <p className="text-xs text-slate-500">Autonomous recovery agent for subscription payments</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 sm:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
        <button
          onClick={onRunDemo}
          className="flex items-center gap-2 rounded-lg bg-rally-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rally-700"
        >
          <Zap size={15} strokeWidth={2.4} />
          Run Recovery Demo
        </button>
      </div>
    </header>
  )
}

/* ---------------------------------- Overview ---------------------------------- */

function Overview({ onRunDemo }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <PerformanceChart />
        </div>
        <div className="xl:col-span-2">
          <DecisionTimelineCard steps={decisionLog[0].steps} onRunDemo={onRunDemo} />
        </div>
      </div>

      <TransactionTable rows={transactions.slice(0, 6)} title="Recent Transactions" showViewAll />
    </div>
  )
}

function KpiCard({ kpi }) {
  const isUp = kpi.trend === 'up'
  const toneColor =
    kpi.tone === 'warn' ? 'text-amber-600' : kpi.tone === 'good' ? 'text-emerald-600' : 'text-slate-500'

  return (
    <div className="rounded-2xl border border-rally-border bg-white p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-bold tracking-tight text-rally-text">{kpi.value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${toneColor}`}>
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {kpi.delta}
        </span>
      </div>
    </div>
  )
}

/* ---------------------------------- Chart ---------------------------------- */

function PerformanceChart() {
  const width = 640
  const height = 220
  const padding = 28
  const maxVal = Math.max(...weeklyPerformance.map((d) => Math.max(d.recovered, d.failed))) * 1.15
  const barGroupWidth = (width - padding * 2) / weeklyPerformance.length
  const barWidth = barGroupWidth * 0.32

  const yToPx = (v) => height - padding - (v / maxVal) * (height - padding * 2)

  return (
    <div className="h-full rounded-2xl border border-rally-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-rally-text">Recovery Performance</h2>
          <p className="text-xs text-slate-500">Recovered vs. failed revenue, last 7 days</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rally-500" /> Recovered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-300" /> Failed
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Recovery performance chart">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={yToPx(maxVal * f)}
            y2={yToPx(maxVal * f)}
            stroke="#EEF1F7"
            strokeWidth="1"
          />
        ))}

        {weeklyPerformance.map((d, i) => {
          const groupX = padding + i * barGroupWidth
          const failedX = groupX + barGroupWidth / 2 - barWidth - 3
          const recoveredX = groupX + barGroupWidth / 2 + 3

          return (
            <g key={d.label}>
              <rect
                x={failedX}
                y={yToPx(d.failed)}
                width={barWidth}
                height={height - padding - yToPx(d.failed)}
                rx="3"
                fill="#E2E8F0"
              />
              <rect
                x={recoveredX}
                y={yToPx(d.recovered)}
                width={barWidth}
                height={height - padding - yToPx(d.recovered)}
                rx="3"
                fill="#2451EB"
              />
              <text
                x={groupX + barGroupWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#94A3B8"
              >
                {d.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------------------------------- Decision Timeline ---------------------------------- */

function DecisionTimelineCard({ steps, onRunDemo }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-rally-border bg-white p-5 shadow-card">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-rally-text">Decision Timeline</h2>
        <p className="text-xs text-slate-500">TX_TEST_001 · How Rally reached its decision</p>
      </div>

      <ol className="flex-1 space-y-0">
        {steps.map((step, i) => (
          <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {i !== steps.length - 1 && (
              <span className="absolute left-[7px] top-4 h-full w-px bg-rally-100" />
            )}
            <span className="relative mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rally-500 ring-4 ring-rally-50" />
            <div>
              <p className="text-[13px] font-semibold text-rally-text">{step.label}</p>
              <p className="text-xs text-slate-500">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <button
        onClick={onRunDemo}
        className="mt-2 w-full rounded-lg border border-rally-200 bg-rally-50 py-2 text-xs font-semibold text-rally-700 transition-colors hover:bg-rally-100"
      >
        Watch this play out live →
      </button>
    </div>
  )
}

/* ---------------------------------- Transaction Table ---------------------------------- */

function ProbabilityBar({ value }) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600">{value}%</span>
    </div>
  )
}

function TransactionTable({ rows, title = 'Transactions', showViewAll = false, onViewAll }) {
  return (
    <div className="rounded-2xl border border-rally-border bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-rally-border px-5 py-4">
        <h2 className="text-sm font-semibold text-rally-text">{title}</h2>
        {showViewAll && (
          <button onClick={onViewAll} className="text-xs font-semibold text-rally-600 hover:text-rally-700">
            View all →
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-rally-border text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Transaction ID</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Failure Reason</th>
              <th className="px-5 py-3 font-medium">Recovery Probability</th>
              <th className="px-5 py-3 font-medium">Recommended Action</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr key={tx.id} className="border-b border-rally-border last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-mono text-[13px] text-rally-text">{tx.id}</td>
                <td className="px-5 py-3.5 font-semibold text-rally-text">{tx.amount}</td>
                <td className="px-5 py-3.5 text-slate-500">{tx.reason}</td>
                <td className="px-5 py-3.5">
                  <ProbabilityBar value={tx.probability} />
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${ACTION_STYLES[tx.action]}`}>
                    {tx.action}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tx.status]}`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-rally-text">Transactions</h1>
        <p className="text-sm text-slate-500">All failed subscription payments and their recovery status.</p>
      </div>
      <TransactionTable rows={transactions} title="All Transactions" />
    </div>
  )
}

/* ---------------------------------- Recovery Activity ---------------------------------- */

const FEED_TONE = {
  good: 'bg-emerald-500',
  neutral: 'bg-rally-500',
  bad: 'bg-rose-500',
}

function RecoveryActivity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-rally-text">Recovery Activity</h1>
        <p className="text-sm text-slate-500">Live feed of recovery actions taken by the agent.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      <div className="rounded-2xl border border-rally-border bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-rally-text">Activity Feed</h2>
        <ul className="divide-y divide-rally-border">
          {activityFeed.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${FEED_TONE[item.tone]}`} />
              <div className="flex flex-1 items-center justify-between gap-4">
                <p className="text-sm text-rally-text">{item.text}</p>
                <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------- Decision Log ---------------------------------- */

function DecisionLogPage() {
  const [selected, setSelected] = useState(decisionLog[0].id)
  const active = decisionLog.find((d) => d.id === selected)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-rally-text">Decision Log</h1>
        <p className="text-sm text-slate-500">Full reasoning trail behind every recovery decision.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-rally-border bg-white p-3 shadow-card lg:col-span-1">
          {decisionLog.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors last:mb-0 ${
                selected === d.id ? 'bg-rally-50 text-rally-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="font-mono text-[13px]">{d.id}</span>
              <span className="text-xs font-semibold text-slate-400">
                {d.steps[d.steps.length - 1].label.includes('Recovered') ? 'Resolved' : 'Review'}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <DecisionTimelineCard steps={active.steps} onRunDemo={() => {}} />
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------- Settings ---------------------------------- */

function SettingsPage() {
  const [autoRetry, setAutoRetry] = useState(true)
  const [paymentLink, setPaymentLink] = useState(true)
  const [fraudBlock, setFraudBlock] = useState(true)
  const [threshold, setThreshold] = useState(60)

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-rally-text">Settings</h1>
        <p className="text-sm text-slate-500">Configure how the recovery agent behaves.</p>
      </div>

      <div className="rounded-2xl border border-rally-border bg-white p-5 shadow-card">
        <h2 className="mb-4 text-sm font-semibold text-rally-text">Recovery Actions</h2>
        <div className="space-y-4">
          <Toggle
            label="Automatic retries"
            description="Automatically retry payments diagnosed as recoverable."
            checked={autoRetry}
            onChange={setAutoRetry}
          />
          <Toggle
            label="Send payment links"
            description="Send a secure update link for expired or invalid cards."
            checked={paymentLink}
            onChange={setPaymentLink}
          />
          <Toggle
            label="Block suspected fraud"
            description="Stop recovery attempts when fraud risk is high."
            checked={fraudBlock}
            onChange={setFraudBlock}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-rally-border bg-white p-5 shadow-card">
        <h2 className="mb-1 text-sm font-semibold text-rally-text">Recovery Probability Threshold</h2>
        <p className="mb-4 text-xs text-slate-500">
          Only attempt recovery when the model's confidence is above this value.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-rally-600"
          />
          <span className="w-12 shrink-0 text-right text-sm font-semibold text-rally-text">{threshold}%</span>
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-rally-text">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-rally-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

/* ---------------------------------- Recovery Demo Modal ---------------------------------- */
function RecoveryDemoModal({ onClose, onComplete }) {
  const [stepIndex, setStepIndex] = useState(-1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function startRecovery() {
      try {
        setLoading(true)
        setError(null)

        // Start the visual flow
        setStepIndex(0)

        const response = await runRecovery({
          id: "TX_TEST_001",
          customer_id: "CUS_TEST_001",
          amount_number: 999,
          reason: "Insufficient Funds",
          failure_code: "INSUFFICIENT_FUNDS",
        })

        if (cancelled) return

        setResult(response)
        setStepIndex(demoSteps.length - 1)
        onComplete?.(response)
      } catch (err) {
        if (cancelled) return

        console.error("Recovery demo failed:", err)

        setError(
          err.response?.data?.error ||
          err.message ||
          "Unable to connect to the Rally backend."
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    startRecovery()

    return () => {
      cancelled = true
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-rally-text">
              Recovery Demo
            </h2>

            <p className="text-xs text-slate-500">
              Live Rally backend recovery flow
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <ol className="space-y-4">
          {demoSteps.map((step, i) => {
            const state =
              i < stepIndex
                ? "done"
                : i === stepIndex
                  ? "active"
                  : "pending"

            return (
              <li
                key={step.key}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 shrink-0">

                  {state === "done" && (
                    <CheckCircle2
                      size={19}
                      className="text-emerald-500"
                    />
                  )}

                  {state === "active" && (
                    <Loader2
                      size={19}
                      className="animate-spin text-rally-600"
                    />
                  )}

                  {state === "pending" && (
                    <Circle
                      size={19}
                      className="text-slate-200"
                    />
                  )}

                </span>

                <div>
                  <p
                    className={`text-[13px] font-bold tracking-tight ${
                      state === "pending"
                        ? "text-slate-300"
                        : "text-rally-text"
                    }`}
                  >
                    {step.label}
                  </p>

                  {state !== "pending" && (
                    <p className="text-xs text-slate-500">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>

        {loading && !error && (
          <div className="mt-5 rounded-xl border border-rally-200 bg-rally-50 p-4">
            <p className="text-sm font-semibold text-rally-700">
              Rally is processing TX_TEST_001...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Connecting to Node.js → ML → PostgreSQL
            </p>
          </div>
        )}

        {result && !error && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <TrendingUp
              size={20}
              className="text-emerald-600"
            />

            <div>
              <p className="text-sm font-bold text-emerald-700">
                ₹999 recovered
              </p>

              <p className="text-xs text-emerald-600">
                Rally successfully completed the recovery flow
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-700">
              Recovery failed
            </p>

            <p className="mt-1 text-xs text-rose-600">
              {error}
            </p>

            <p className="mt-2 text-[11px] text-slate-500">
              Make sure the Node backend is running on port 5000.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-rally-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rally-700"
        >
          {error ? "Close" : "Close"}
        </button>

      </div>
    </div>
  )
}