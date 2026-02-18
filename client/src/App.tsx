import { useEffect, useState } from "react";
import type { Campaign, AccountStats as Stats } from "./api";
import { fetchCampaigns, fetchAccountStats } from "./api";
import { AccountStats } from "./components/AccountStats";
import { CampaignList } from "./components/CampaignList";
import { CreateCampaign } from "./components/CreateCampaign";
import { LaunchForm } from "./components/LaunchForm";
import "./App.css";

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  async function loadAll() {
    setError("");
    try {
      const [c, s] = await Promise.all([fetchCampaigns(), fetchAccountStats()]);
      setCampaigns(c);
      setStats(s);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="container">
      <header>
        <h1>Ads Launcher</h1>
        <button onClick={loadAll}>Refresh</button>
      </header>

      {error && <p className="error">{error}</p>}

      <AccountStats stats={stats} />

      <LaunchForm onLaunched={loadAll} />

      <section>
        <div className="section-header">
          <h2>Campaigns</h2>
          <CreateCampaign onCreated={loadAll} />
        </div>
        <CampaignList campaigns={campaigns} onRefresh={loadAll} />
      </section>
    </div>
  );
}

export default App;
