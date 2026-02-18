import { useEffect, useState } from "react";
import type { Campaign, AccountStats as Stats } from "./api";
import { fetchCampaigns, fetchAccountStats } from "./api";
import { AccountStats } from "./components/AccountStats";
import { CampaignList } from "./components/CampaignList";
import { CreateCampaign } from "./components/CreateCampaign";
import { LaunchForm } from "./components/LaunchForm";
import "./App.css";

type Tab = "launcher" | "campaigns";

function App() {
  const [tab, setTab] = useState<Tab>("launcher");
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
      </header>

      {/* Tab bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${tab === "launcher" ? "tab-active" : ""}`}
          onClick={() => setTab("launcher")}
        >
          Ad Launcher
        </button>
        <button
          className={`tab-btn ${tab === "campaigns" ? "tab-active" : ""}`}
          onClick={() => setTab("campaigns")}
        >
          Campaigns
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Tab content with fade */}
      <div className="tab-content">
        {tab === "launcher" && (
          <div className="tab-panel">
            <LaunchForm onLaunched={() => { loadAll(); setTab("campaigns"); }} />
          </div>
        )}

        {tab === "campaigns" && (
          <div className="tab-panel">
            <AccountStats stats={stats} />
            <section>
              <div className="section-header">
                <h2>Campaigns</h2>
                <div className="section-actions">
                  <CreateCampaign onCreated={loadAll} />
                  <button className="btn-outline" onClick={loadAll}>Refresh</button>
                </div>
              </div>
              <CampaignList campaigns={campaigns} onRefresh={loadAll} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
