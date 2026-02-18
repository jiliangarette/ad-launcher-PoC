export function StatusBadge({ status }: { status: string }) {
  let badgeClass = "badge-paused";

  switch (status) {
    case "ACTIVE":
      badgeClass = "badge-active";
      break;
    case "PENDING_REVIEW":
    case "IN_PROCESS":
      badgeClass = "badge-pending";
      break;
    case "WITH_ISSUES":
    case "DISAPPROVED":
      badgeClass = "badge-error";
      break;
    case "PAUSED":
    case "CAMPAIGN_PAUSED":
    case "ADSET_PAUSED":
    default:
      badgeClass = "badge-paused";
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {status}
    </span>
  );
}
