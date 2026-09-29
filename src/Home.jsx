import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fix Leaflet default marker icons (broken in Vite by default)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Default center: Johannesburg
const DEFAULT_CENTER = [-26.2041, 28.0473]

// Hardcoded community alerts (fake data for MVP demo)
const ALERTS = [
  { id: 1, lat: -26.2041, lng: 28.0473, type: 'Robbery', note: 'Street robbery reported near taxi rank', severity: 'high', time: '20 min ago' },
  { id: 2, lat: -26.1950, lng: 28.0550, type: 'Suspicious activity', note: 'Group loitering near ATM', severity: 'medium', time: '1 hr ago' },
  { id: 3, lat: -26.2150, lng: 28.0380, type: 'Burglary', note: 'House break-in on 3rd Ave', severity: 'high', time: '3 hrs ago' },
  { id: 4, lat: -26.2080, lng: 28.0620, type: 'Theft', note: 'Phone snatched at bus stop', severity: 'medium', time: '5 hrs ago' },
]

const CONTACTS = [
  { name: 'Mom', phone: '082 111 2222' },
  { name: 'Neighbourhood Watch', phone: '082 333 4444' },
  { name: 'SAPS Emergency', phone: '10111' },
]

export default function Home({ phone, onLogout }) {
  const [position, setPosition] = useState(null)
  const [sosState, setSosState] = useState('idle')
  const [activeTab, setActiveTab] = useState('home')

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

  return (
    <div className="home">
      <header className="topbar">
        <span className="brand">🛡️ SafeLite</span>
        <button className="logout" onClick={onLogout}>
          Log out
        </button>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'home' ? 'tab active' : 'tab'} onClick={() => setActiveTab('home')}>
          Home
        </button>
        <button className={activeTab === 'map' ? 'tab active' : 'tab'} onClick={() => setActiveTab('map')}>
          Map
        </button>
        <button className={activeTab === 'contacts' ? 'tab active' : 'tab'} onClick={() => setActiveTab('contacts')}>
          Contacts
        </button>
      </nav>

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
            <h3>Recent alerts near you</h3>
            <ul className="alert-list">
              {ALERTS.slice(0, 3).map((a) => (
                <li key={a.id}>
                  <span className={`dot ${a.severity}`} />
                  <div>
                    <strong>{a.type}</strong>
                    <p className="muted small">{a.note}</p>
                    <p className="muted small">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="panel map-panel">
          <MapContainer
            center={position || DEFAULT_CENTER}
            zoom={14}
            style={{ height: '420px', width: '100%', borderRadius: '12px' }}
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
            {ALERTS.map((a) => (
              <Circle
                key={a.id}
                center={[a.lat, a.lng]}
                radius={a.severity === 'high' ? 180 : 100}
                pathOptions={{
                  color: a.severity === 'high' ? '#dc2626' : '#f59e0b',
                  fillColor: a.severity === 'high' ? '#dc2626' : '#f59e0b',
                  fillOpacity: 0.35,
                }}
              >
                <Popup>
                  <strong>{a.type}</strong>
                  <br />
                  {a.note}
                  <br />
                  <em>{a.time}</em>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
          <div className="legend">
            <span><span className="dot high" /> High risk</span>
            <span><span className="dot medium" /> Medium risk</span>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="panel">
          <h2>Emergency contacts</h2>
          <ul className="contact-list">
            {CONTACTS.map((c) => (
              <li key={c.phone}>
                <div>
                  <strong>{c.name}</strong>
                  <p className="muted small">{c.phone}</p>
                </div>
                <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="call-btn">
                  Call
                </a>
              </li>
            ))}
          </ul>
          <p className="muted small">
            These contacts will be notified when you press SOS.
          </p>
        </div>
      )}
    </div>
  )
}
