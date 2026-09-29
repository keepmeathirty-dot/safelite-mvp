import { useState } from 'react'

const TYPES = [
  'Robbery',
  'Burglary',
  'Theft',
  'Suspicious activity',
  'Assault',
  'Vehicle theft',
  'Vandalism',
]

export default function ReportIncident({ onSubmit }) {
  const [type, setType] = useState('Suspicious activity')
  const [severity, setSeverity] = useState('medium')
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    const getCoords = () =>
      new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null)
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve([pos.coords.latitude, pos.coords.longitude]),
          () => resolve(null),
          { timeout: 5000 }
        )
      })

    getCoords().then((coords) => {
      onSubmit({
        type,
        severity,
        note: note || 'No details provided',
        locationText: location || 'Unknown location',
        coords,
      })
      setSubmitted(true)
      setNote('')
      setLocation('')
      setTimeout(() => setSubmitted(false), 3000)
    })
  }

  return (
    <div className="panel">
      <h2>Report an incident</h2>
      <p className="muted small" style={{ marginBottom: 16 }}>
        Your report helps keep the community informed. Stay anonymous — your
        name is never shared.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        <label>Incident type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <label>Severity</label>
        <div className="severity-row">
          {['low', 'medium', 'high'].map((s) => (
            <button
              type="button"
              key={s}
              className={`sev-btn ${s} ${severity === s ? 'active' : ''}`}
              onClick={() => setSeverity(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <label>Location (street, suburb, landmark)</label>
        <input
          type="text"
          placeholder="e.g. corner of 3rd Ave and Main Rd"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <label>Details (optional)</label>
        <textarea
          rows={3}
          placeholder="What did you see? Avoid naming individuals."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button type="submit" className="primary-btn">
          {submitted ? '✓ Report submitted' : 'Submit report'}
        </button>
      </form>

      <p className="muted small" style={{ marginTop: 16 }}>
        Your GPS location is attached automatically. Reports appear in the Live
        Alert Feed and on the Safety Map.
      </p>
    </div>
  )
}
