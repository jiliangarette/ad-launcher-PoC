import { useState } from "react";
import type { Campaign } from "../api";
import { pauseCampaign, activateCampaign } from "../api";
import { StatusBadge } from "./StatusBadge";

export function CampaignList({
  campaigns,
  onRefresh,
}: {
  campaigns: Campaign[];
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(c: Campaign) {
    setBusy(c.id);
    try {
      if (c.status === "ACTIVE") {
        await pauseCampaign(c.id);
      } else {
        await activateCampaign(c.id);
      }
      onRefresh();
    } finally {
      setBusy(null);
    }
  }

  if (campaigns.length === 0) {
    return <p className="muted">No campaigns found.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Delivery</th>
          <th>Objective</th>
          <th>Impr.</th>
          <th>Clicks</th>
          <th>Spend</th>
          <th>ID</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((c) => (
          <tr key={c.id}>
            <td>{c.name}</td>
            <td><StatusBadge status={c.status} /></td>
            <td>{c.effective_status ? <StatusBadge status={c.effective_status} /> : "—"}</td>
            <td>{c.objective}</td>
            <td>{c.impressions ?? "—"}</td>
            <td>{c.clicks ?? "—"}</td>
            <td>{c.spend ? `$${c.spend}` : "—"}</td>
            <td className="mono">{c.id}</td>
            <td>
              <button
                className="btn-sm"
                disabled={busy === c.id}
                onClick={() => toggle(c)}
              >
                {busy === c.id
                  ? "..."
                  : c.status === "ACTIVE"
                  ? "Pause"
                  : "Activate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
