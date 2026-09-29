import { useState } from 'react'

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const clean = phone.replace(/\s+/g, '')
    if (clean.length < 10) {
      alert('Please enter a valid phone number (e.g. 0821234567)')
      return
    }
    onLogin(clean)
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">🛡️</div>
        <h1>SafeLite</h1>
        <p className="tagline">Your community safety network</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            type="tel"
            placeholder="082 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
          <button type="submit">Continue</button>
        </form>

        <div className="login-pricing">
          <div className="tier">
            <strong>Free</strong>
            <span className="muted small">Basic SOS &amp; alerts</span>
          </div>
          <div className="tier">
            <strong>R30/mo</strong>
            <span className="muted small">Premium — family tracking</span>
          </div>
          <div className="tier">
            <strong>R200/mo</strong>
            <span className="muted small">Business — priority alerts</span>
          </div>
        </div>

        <p className="disclaimer">
          By continuing you agree to share your location with your emergency
          contacts when you press SOS.
        </p>
      </div>
    </div>
  )
}
