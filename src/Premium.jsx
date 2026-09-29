import { useState } from 'react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R0',
    cadence: 'forever',
    tagline: 'For individuals who want basic safety',
    features: [
      'SOS panic button with GPS',
      'Community alert feed',
      'Safety map',
      'Up to 3 emergency contacts',
    ],
    cta: 'Current plan',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R30',
    cadence: 'per month',
    tagline: 'For families who want full peace of mind',
    features: [
      'Everything in Free',
      'Family member live tracking',
      'Unlimited emergency contacts',
      'Priority alerts in your area',
      'Incident history & reports',
    ],
    cta: 'Upgrade to Premium',
    highlight: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 'R200',
    cadence: 'per month',
    tagline: 'For shops, complexes and small businesses',
    features: [
      'Everything in Premium',
      'Priority alert routing',
      'Staff safety dashboard',
      'Area risk reports',
      'Advertise to nearby users',
    ],
    cta: 'Contact sales',
  },
]

export default function Premium({ plan, onSelectPlan }) {
  const [pending, setPending] = useState(null)

  function handleSelect(id) {
    if (id === 'free') return
    setPending(id)
    setTimeout(() => {
      onSelectPlan(id)
      setPending(null)
    }, 900)
  }

  return (
    <div className="panel">
      <h2>Plans & pricing</h2>
      <p className="muted small" style={{ marginBottom: 20 }}>
        SafeLite is free for individuals. Premium unlocks family tracking and
        priority alerts.
      </p>

      <div className="plans">
        {PLANS.map((p) => {
          const isActive = plan === p.id
          return (
            <div
              key={p.id}
              className={`plan-card ${p.highlight ? 'highlight' : ''}`}
            >
              {p.highlight && <div className="ribbon">Most popular</div>}
              <h3>{p.name}</h3>
              <div className="price">
                <span className="amount">{p.price}</span>
                <span className="cadence">{p.cadence}</span>
              </div>
              <p className="muted small">{p.tagline}</p>
              <ul className="feature-list">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <button
                className={`plan-btn ${isActive ? 'active' : ''}`}
                disabled={isActive || pending === p.id}
                onClick={() => handleSelect(p.id)}
              >
                {isActive
                  ? 'Current plan'
                  : pending === p.id
                  ? 'Processing...'
                  : p.cta}
              </button>
            </div>
          )
        })}
      </div>

      <p className="muted small" style={{ marginTop: 20 }}>
        This is a demo. No payment is taken. In the live product, payments
        would run through PayFast or Yoco.
      </p>
    </div>
  )
}
