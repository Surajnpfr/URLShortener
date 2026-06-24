export default function AnalyticsChart({ clicksByDay = [] }) {
  if (!clicksByDay.length) {
    return (
      <div className="empty-state empty-state--inline">
        <p>No click activity in this period yet.</p>
      </div>
    );
  }

  const maxClicks = Math.max(...clicksByDay.map((day) => day.clicks || 0), 1);

  return (
    <div className="analytics-chart">
      {clicksByDay.map((day) => (
        <div key={day.date} className="analytics-chart-bar-wrap" title={`${day.date}: ${day.clicks} clicks`}>
          <div
            className="analytics-chart-bar"
            style={{ height: `${Math.max(((day.clicks || 0) / maxClicks) * 100, 4)}%` }}
          />
          <span className="analytics-chart-label">{day.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
