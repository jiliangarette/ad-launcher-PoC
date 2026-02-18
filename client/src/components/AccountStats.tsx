import type { AccountStats as Stats } from "../api";

export function AccountStats({ stats }: { stats: Stats | null }) {
  if (!stats) return <p className="muted">Loading account stats...</p>;

  return (
    <div className="stats-bar">
      <div className="stat-box">
        <span className="stat-label">Impressions</span>
        <span className="stat-value">{Number(stats.impressions || 0).toLocaleString()}</span>
      </div>
      <div className="stat-box">
        <span className="stat-label">Clicks</span>
        <span className="stat-value">{Number(stats.clicks || 0).toLocaleString()}</span>
      </div>
      <div className="stat-box">
        <span className="stat-label">Spend</span>
        <span className="stat-value">${Number(stats.spend || 0).toFixed(2)}</span>
      </div>
    </div>
  );
}
