export default function AlertsFeed({ alerts }) {
  function timeAgo(ts) {
    const seconds = Math.floor((Date.now() - ts) / 1000)
    if (seconds < 60) return 'just now'
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="panel">
        <h2>Live alert feed</h2>
        <p className="muted">No alerts yet. Report an incident to start the feed.</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>Live alert feed</h2>
      <p className="muted small" style={{ marginBottom: 16 }}>
        Real-time incidents from your community. Updated as neighbours report.
      </p>

      <ul className="feed-list">
        {alerts.map((a) => (
          <li key={a.id} className="feed-item">
            <div className={`feed-severity ${a.severity}`} />
            <div className="feed-body">
              <div className="feed-header">
                <strong>{a.type}</strong>
                {a.isMine && <span className="badge">You</span>}
              </div>
              <p className="muted small">{a.note}</p>
              <div className="feed-meta">
                <span className={`pill ${a.severity}`}>{a.severity}</span>
                <span className="muted small">{timeAgo(a.timestamp)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
