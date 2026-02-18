import { useState } from "react";
import { launchAd } from "../api";
import type { LaunchAdResult } from "../api";

interface Props {
  onLaunched: () => void;
}

const CTA_OPTIONS = [
  "LEARN_MORE",
  "SHOP_NOW",
  "SIGN_UP",
  "BOOK_TRAVEL",
  "CONTACT_US",
  "DOWNLOAD",
  "GET_QUOTE",
];

const DEFAULTS = {
  imageUrl: "https://scontent.fceb9-1.fna.fbcdn.net/v/t39.30808-6/480813785_925388676429655_3976266347360154937_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=riAG-ejI9GAQ7kNvwEcTmed&_nc_oc=Adk2xyDxENCiTmYr9GILMW7O7ghRlVDldf4vY7k1x8MnrETdeBGxVIzl266IFigX48Q&_nc_zt=23&_nc_ht=scontent.fceb9-1.fna&_nc_gid=4_zkw-JT3bws3uhPQ7sM-g&oh=00_AfuQw0CMGlMA_OVKu5O7ynWuZG5hfyBHqPorTWtFXxkDgQ&oe=699B1787",
  headline: "Best Coffee Bean in Town",
  body: "Try our new blend today",
  link: "https://jilian.dev/",
  country: "PH",
  ageMin: 25,
  ageMax: 55,
  dailyBudget: 5,
  campaignName: "Ad Launch",
  ctaType: "LEARN_MORE",
  linkDescription: "",
  gender: "all",
};

export function LaunchForm({ onLaunched }: Props) {
  const [campaignName, setCampaignName] = useState(DEFAULTS.campaignName);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [body, setBody] = useState(DEFAULTS.body);
  const [linkDescription, setLinkDescription] = useState(DEFAULTS.linkDescription);
  const [imageUrl, setImageUrl] = useState(DEFAULTS.imageUrl);
  const [link, setLink] = useState(DEFAULTS.link);
  const [ctaType, setCtaType] = useState(DEFAULTS.ctaType);
  const [country, setCountry] = useState(DEFAULTS.country);
  const [ageMin, setAgeMin] = useState(DEFAULTS.ageMin);
  const [ageMax, setAgeMax] = useState(DEFAULTS.ageMax);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [dailyBudget, setDailyBudget] = useState(DEFAULTS.dailyBudget);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaunchAdResult | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await launchAd({
        headline, body, imageUrl, link,
        country, ageMin, ageMax, dailyBudget,
        campaignName: campaignName || undefined,
        ctaType,
        linkDescription: linkDescription || undefined,
        gender,
      });
      setResult(res);
      onLaunched();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="launch-section">
      <h2>Launch Ad</h2>
      <form className="launch-form" onSubmit={handleSubmit}>
        <label>
          <span>Campaign name</span>
          <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Ad Launch" />
        </label>
        <label>
          <span>Image URL</span>
          <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
        </label>
        <label>
          <span>Headline</span>
          <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} required />
        </label>
        <label>
          <span>Link description</span>
          <input type="text" value={linkDescription} onChange={e => setLinkDescription(e.target.value)} placeholder="Subtitle text under the headline" />
        </label>
        <label>
          <span>Body text</span>
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={3} />
        </label>
        <div className="launch-row">
          <label>
            <span>Destination link</span>
            <input type="url" value={link} onChange={e => setLink(e.target.value)} required />
          </label>
          <label>
            <span>CTA type</span>
            <select value={ctaType} onChange={e => setCtaType(e.target.value)}>
              {CTA_OPTIONS.map(cta => (
                <option key={cta} value={cta}>{cta.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="launch-row">
          <label>
            <span>Country</span>
            <input type="text" value={country} onChange={e => setCountry(e.target.value)} maxLength={2} />
          </label>
          <label>
            <span>Age min</span>
            <input type="number" value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} min={18} max={65} />
          </label>
          <label>
            <span>Age max</span>
            <input type="number" value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} min={18} max={65} />
          </label>
          <label>
            <span>Gender</span>
            <div className="radio-group">
              <label className="radio-label"><input type="radio" name="gender" value="all" checked={gender === "all"} onChange={e => setGender(e.target.value)} /> All</label>
              <label className="radio-label"><input type="radio" name="gender" value="male" checked={gender === "male"} onChange={e => setGender(e.target.value)} /> Male</label>
              <label className="radio-label"><input type="radio" name="gender" value="female" checked={gender === "female"} onChange={e => setGender(e.target.value)} /> Female</label>
            </div>
          </label>
          <label>
            <span>Daily budget</span>
            <input type="number" value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))} min={2} step={1} />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Launching…" : "Launch Ad (PAUSED)"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="launch-result">
          <p><strong>Ad launched successfully!</strong> All objects created as PAUSED.</p>
          <table>
            <tbody>
              <tr><td>Campaign</td><td className="mono">{result.campaignId}</td></tr>
              <tr><td>Ad Set</td><td className="mono">{result.adSetId}</td></tr>
              <tr><td>Creative</td><td className="mono">{result.creativeId}</td></tr>
              <tr><td>Ad</td><td className="mono">{result.adId}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
