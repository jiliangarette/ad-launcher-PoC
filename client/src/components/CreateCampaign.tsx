import { useState } from "react";
import { createTestCampaign } from "../api";

export function CreateCampaign({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreate() {
    setBusy(true);
    setMessage("");
    try {
      const result = await createTestCampaign();
      setMessage(`Created: ${result.name} (${result.id})`);
      onCreated();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="create-section">
      <button onClick={handleCreate} disabled={busy}>
        {busy ? "Creating..." : "New Test Campaign"}
      </button>
      {message && <span className="create-message">{message}</span>}
    </div>
  );
}
