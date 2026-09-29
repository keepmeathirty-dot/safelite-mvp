import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import AlertsFeed from './AlertsFeed.jsx'
import ReportIncident from './ReportIncident.jsx'
import Premium from './Premium.jsx'

// Fix Leaflet default marker icons (broken in Vite by default)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = [-26.2041, 28.0473]

const SEED_ALERTS = [
  { id: 'seed-1', lat: -26.2041, lng: 28.0473, type: 'Robbery', note: 'Street robbery reported near taxi rank', severity: 'high', locationText: 'Bree Street taxi rank', timestamp: Date.now() - 20 * 60 * 1000 },
  { id: 'seed-2', lat: -26.1950, lng: 28.0550, type: 'Suspicious activity', note: 'Group loitering near ATM', severity: 'medium', locationText: 'Rosebank Mall ATM', timestamp: Date.now() - 60 * 60 * 1000 },
  { id: 'seed-3', lat: -26.2150, lng: 28.0380, type: 'Burglary', note: 'House break-in on 3rd Ave', severity: 'high', locationText: '3rd Avenue, Melville', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
  { id: 'seed-4', lat: -26.2080, lng: 28.0620, type: 'Theft', note: 'Phone snatched at bus stop', severity: 'medium', locationText: 'Oxford Road bus stop', timestamp: Date.now() - 5 * 60 * 60 * 1000 },
]

const CONTACTS = [
  { name: 'Mom', phone: '0821112222', role: 'Family' },
  { name: 'Dad', phone: '0825556666', role: 'Family' },
  { name: 'Neighbourhood Watch', phone: '0823334444', role: 'Community' },
  { name: 'Community Policing Forum', phone: '0827778888', role: 'Community' },
  { name: 'SAPS Emergency', phone: '10111', role: 'Emergency' },
]

const VOLUNTEERS = [
  { name: 'Thabo M.', distance: '400 m away', status: 'Available' },
  { name: 'Priya N.', distance: '1.1 km away', status: 'Available' },
  { name: 'Sipho D.', distance: '1.6 km away', status: 'On route' },
]

const LS_ALERTS = 'safelite_alerts'
const LS_PLAN = 'safelite_plan'

function loadAlerts() {
  try {
    const raw = localStorage.getItem(LS_ALERTS)
    if (!raw) return SEED_ALERTS
    const saved = JSON.parse(raw)
    return [...saved, ...SEED_ALERTS]
  } catch {
    return SEED_ALERTS
  }
}

export default function Home({ phone, onLogout }) {
  const [position, setPosition] = useState(null)
  const [sosState, setSosState] = useState('idle')
  const [activeTab, setActiveTab] = useState('home')
  const [alerts, setAlerts] = useState(loadAlerts)
  const [plan, setPlan] = useState(
    () => localStorage.getItem(LS_PLAN) || 'free'
  )
  const [newAlertPing, setNewAlertPing] = useState(false)

  // Persist user-reported alerts only (not the seeds)
  useEffect(() => {
    const mine = alerts.filter((a) => a.isMine)
    localStorage.setItem(LS_ALERTS, JSON.stringify(mine))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem(LS_PLAN, plan)
  }, [plan])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition(null),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  function handleSOS() {
    setSosState('sending')
    const send = (coords) => {
      const loc = coords
        ? `https://maps.google.com/?q=${coords[0]},${coords[1]}`
        : 'Location unavailable'
      console.log('🚨 SOS SENT')
      console.log('From:', phone)
      console.log('Location:', loc)
      console.log('Contacts notified:', CONTACTS.map((c) => c.name).join(', '))
      setTimeout(() => setSosState('sent'), 800)
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => send([pos.coords.latitude, pos.coords.longitude]),
        () => send(null),
        { enableHighAccuracy: true, timeout: 5000 }
      )
    } else {
      send(null)
    }
  }

  function handleNewReport(report) {
    const coords = report.coords || position || DEFAULT_CENTER
    const newAlert = {
      id: `user-${Date.now()}`,
      lat: coords[0] + (Math.random() - 0.5) * 0.004,
      lng: coords[1] + (Math.random() - 0.5) * 0.004,
      type: report.type,
      note: report.note,
      severity: report.severity,
      locationText: report.locationText,
      timestamp: Date.now(),
      isMine: true,
    }
    setAlerts((prev) => [newAlert, ...prev])
    setNewAlertPing(true)
    setTimeout(() => setNewAlertPing(false), 2500)
    setActiveTab('feed')
  }

  const unreadCount = alerts.filter(
    (a) => a.isMine && Date.now() - a.timestamp < 60 * 1000
  ).length

  return (
    <div className="home">
      <header className="topbar">
        <span className="brand">🛡️ SafeLite</span>
        <div className="topbar-right">
          {plan !== 'free' && <span className="plan-badge">{plan}</span>}
          <button className="logout" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <nav className="tabs">
        {[
          { id: 'home', label: 'Home' },
          { id: 'feed', label: 'Live Feed' },
          { id: 'map', label: 'Map' },
          { id: 'report', label: 'Report' },
          { id: 'contacts', label: 'Contacts' },
          { id: 'premium', label: 'Premium' },
        ].map((t) => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {t.id === 'feed' && unreadCount > 0 && (
              <span className="tab-dot" />
            )}
          </button>
        ))}
      </nav>

      {newAlertPing && (
        <div className="toast">📣 Your report is live on the feed</div>
      )}

      {activeTab === 'home' && (
        <div className="panel">
          <div className="sos-wrap">
            <button
              className={`sos ${sosState}`}
              onClick={handleSOS}
              disabled={sosState !== 'idle'}
            >
              {sosState === 'idle' && 'SOS'}
              {sosState === 'sending' && '...'}
              {sosState === 'sent' && '✓'}
            </button>
            <p className="sos-hint">
              {sosState === 'idle' && 'Tap to alert your emergency contacts'}
              {sosState === 'sending' && 'Sending your location...'}
              {sosState === 'sent' && 'Alert sent to your contacts'}
            </p>
          </div>

          <div className="status-card">
            <h3>Your location</h3>
            {position ? (
              <p className="mono">
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </p>
            ) : (
              <p className="muted">Enable location access for accurate SOS</p>
            )}
          </div>

          <div className="status-card">
            <div className="card-header">
              <h3>Volunteers nearby</h3>
              <span className="pill low">3 active</span>
            </div>
            <ul className="volunteer-list">
              {VOLUNTEERS.map((v) => (
                <li key={v.name}>
                  <div className="avatar">{v.name.charAt(0)}</div>
                  <div className="volunteer-body">
                    <strong>{v.name}</strong>
                    <p className="muted small">{v.distance}</p>
                  </div>
                  <span className={`pill ${v.status === 'Available' ? 'low' : 'medium'}`}>
                    {v.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="status-card">
            <div className="card-header">
              <h3>Recent alerts</h3>
              <button className="link-btn" onClick={() => setActiveTab('feed')}>
                View all →
              </button>
            </div>
            <ul className="alert-list">
              {alerts.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <span className={`dot ${a.severity}`} />
                  <div>
                    <strong>{a.type}</strong>
                    <p className="muted small">{a.locationText}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="business-cta">
            <div>
              <strong>Run a business in the area?</strong>
              <p className="muted small">Get priority alerts for R200/mo.</p>
            </div>
            <button className="cta-btn" onClick={() => setActiveTab('premium')}>
              Learn more
            </button>
          </div>
        </div>
      )}

      {activeTab === 'feed' && <AlertsFeed alerts={alerts} />}

      {activeTab === 'report' && <ReportIncident onSubmit={handleNewReport} />}

      {activeTab === 'map' && (
        <div className="panel map-panel">
          <MapContainer
            center={position || DEFAULT_CENTER}
            zoom={14}
            style={{ height: '440px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
            {position && (
              <Marker position={position}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            {alerts.map((a) => (
              <Circle
                key={a.id}
                center={[a.lat, a.lng]}
                radius={
                  a.severity === 'high' ? 180 : a.severity === 'medium' ? 120 : 80
                }
                pathOptions={{
                  color:
                    a.severity === 'high'
                      ? '#dc2626'
                      : a.severity === 'medium'
                      ? '#f59e0b'
                      : '#3b82f6',
                  fillColor:
                    a.severity === 'high'
                      ? '#dc2626'
                      : a.severity === 'medium'
                      ? '#f59e0b'
                      : '#3b82f6',
                  fillOpacity: a.isMine ? 0.55 : 0.35,
                }}
              >
                <Popup>
                  <strong>{a.type}</strong>
                  <br />
                  {a.note}
                  <br />
                  <em>{a.locationText}</em>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
          <div className="legend">
            <span><span className="dot high" /> High risk</span>
            <span><span className="dot medium" /> Medium risk</span>
            <span><span className="dot" style={{ background: '#3b82f6' }} /> Low risk</span>
          </div>
          <p className="muted small" style={{ marginTop: 12 }}>
            Heat map based on anonymised reports from the community. Updated in
            real time.
          </p>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="panel">
          <h2>Emergency contacts</h2>
          <p className="muted small" style={{ marginBottom: 16 }}>
            These contacts are notified when you press SOS.
          </p>
          <ul className="contact-list">
            {CONTACTS.map((c) => (
              <li key={c.phone}>
                <div>
                  <strong>{c.name}</strong>
                  <p className="muted small">{c.phone} · {c.role}</p>
                </div>
                <div className="contact-actions">
                  <a href={`tel:${c.phone}`} className="call-btn">Call</a>
                  <a
                    href={`https://wa.me/27${c.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-btn"
                  >
                    WhatsApp
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="muted small">
            WhatsApp opens the chat in the WhatsApp app or WhatsApp Web.
          </p>
        </div>
      )}

      {activeTab === 'premium' && (
        <Premium plan={plan} onSelectPlan={setPlan} />
      )}
    </div>
  )
}
