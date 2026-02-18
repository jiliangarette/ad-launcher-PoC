import { useState } from "react";
import { launchAd } from "../api";
import type { LaunchAdResult } from "../api";

interface Props {
  onLaunched: () => void;
}

const STEPS = ["Campaign", "Targeting", "Creative", "Review & Launch"] as const;

const COUNTRY_OPTIONS = [
  { code: "PH", label: "Philippines" },
  { code: "US", label: "United States" },
  { code: "SG", label: "Singapore" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "MY", label: "Malaysia" },
  { code: "ID", label: "Indonesia" },
  { code: "TH", label: "Thailand" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "JP", label: "Japan" },
];

const CTA_OPTIONS = [
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "BOOK_TRAVEL", label: "Book Travel" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "GET_QUOTE", label: "Get Quote" },
];

const BUDGET_OPTIONS = [
  { value: 5, label: "$5 / day" },
  { value: 10, label: "$10 / day" },
  { value: 20, label: "$20 / day" },
  { value: 50, label: "$50 / day" },
  { value: 100, label: "$100 / day" },
];

const DEFAULTS = {
  campaignName: "Ad Launch",
  dailyBudget: 5,
  country: "PH",
  ageMin: 25,
  ageMax: 55,
  gender: "all",
  imageUrl: "https://scontent.fceb9-1.fna.fbcdn.net/v/t39.30808-6/480813785_925388676429655_3976266347360154937_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=13d280&_nc_ohc=riAG-ejI9GAQ7kNvwEcTmed&_nc_oc=Adk2xyDxENCiTmYr9GILMW7O7ghRlVDldf4vY7k1x8MnrETdeBGxVIzl266IFigX48Q&_nc_zt=23&_nc_ht=scontent.fceb9-1.fna&_nc_gid=4_zkw-JT3bws3uhPQ7sM-g&oh=00_AfuQw0CMGlMA_OVKu5O7ynWuZG5hfyBHqPorTWtFXxkDgQ&oe=699B1787",
  headline: "Best Coffee Bean in Town",
  linkDescription: "Premium single-origin beans roasted fresh daily",
  body: "Try our new blend today",
  link: "https://jilian.dev/",
  ctaType: "LEARN_MORE",
};

export function LaunchForm({ onLaunched }: Props) {
  const [step, setStep] = useState(0);

  // Step 1: Campaign
  const [campaignName, setCampaignName] = useState(DEFAULTS.campaignName);
  const [dailyBudget, setDailyBudget] = useState(DEFAULTS.dailyBudget);

  // Step 2: Targeting
  const [country, setCountry] = useState(DEFAULTS.country);
  const [ageMin, setAgeMin] = useState(DEFAULTS.ageMin);
  const [ageMax, setAgeMax] = useState(DEFAULTS.ageMax);
  const [gender, setGender] = useState(DEFAULTS.gender);

  // Step 3: Creative
  const [imageUrl, setImageUrl] = useState(DEFAULTS.imageUrl);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [linkDescription, setLinkDescription] = useState(DEFAULTS.linkDescription);
  const [body, setBody] = useState(DEFAULTS.body);
  const [link, setLink] = useState(DEFAULTS.link);
  const [ctaType, setCtaType] = useState(DEFAULTS.ctaType);

  // State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaunchAdResult | null>(null);
  const [error, setError] = useState("");

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)); }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  async function handleLaunch() {
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

  const countryLabel = COUNTRY_OPTIONS.find(c => c.code === country)?.label || country;
  const ctaLabel = CTA_OPTIONS.find(c => c.value === ctaType)?.label || ctaType;
  const genderLabel = gender === "all" ? "All" : gender === "male" ? "Male" : "Female";

  return (
    <section className="launch-section">
      <h2>Launch Ad</h2>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`stepper-step ${i === step ? "stepper-active" : ""} ${i < step ? "stepper-done" : ""}`}
            onClick={() => { if (i < step) setStep(i); }}
          >
            <div className="stepper-dot">{i < step ? "\u2713" : i + 1}</div>
            <span className="stepper-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="launch-form">
        {/* Step 1: Campaign */}
        {step === 0 && (
          <div className="step-content">
            <h3 className="step-title">Campaign Setup</h3>
            <p className="step-desc">Name your campaign and set a daily budget.</p>
            <label>
              <span>Campaign name</span>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="e.g. Summer Sale 2026"
              />
            </label>
            <label>
              <span>Daily budget</span>
              <select value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))}>
                {BUDGET_OPTIONS.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </label>
            <div className="step-nav">
              <div />
              <button type="button" onClick={next}>Next: Targeting</button>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {step === 1 && (
          <div className="step-content">
            <h3 className="step-title">Audience Targeting</h3>
            <p className="step-desc">Define who sees your ad.</p>
            <label>
              <span>Country</span>
              <select value={country} onChange={e => setCountry(e.target.value)}>
                {COUNTRY_OPTIONS.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </label>
            <div className="launch-row">
              <label>
                <span>Age min</span>
                <select value={ageMin} onChange={e => setAgeMin(Number(e.target.value))}>
                  {[18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Age max</span>
                <select value={ageMax} onChange={e => setAgeMax(Number(e.target.value))}>
                  {[25, 30, 35, 40, 45, 50, 55, 60, 65].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>Gender</span>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="gender" value="all" checked={gender === "all"} onChange={e => setGender(e.target.value)} /> All
                </label>
                <label className="radio-label">
                  <input type="radio" name="gender" value="male" checked={gender === "male"} onChange={e => setGender(e.target.value)} /> Male
                </label>
                <label className="radio-label">
                  <input type="radio" name="gender" value="female" checked={gender === "female"} onChange={e => setGender(e.target.value)} /> Female
                </label>
              </div>
            </label>
            <div className="step-nav">
              <button type="button" className="btn-back" onClick={back}>Back</button>
              <button type="button" onClick={next}>Next: Creative</button>
            </div>
          </div>
        )}

        {/* Step 3: Creative */}
        {step === 2 && (
          <div className="step-content">
            <h3 className="step-title">Ad Creative</h3>
            <p className="step-desc">Design what your audience will see.</p>
            <label>
              <span>Image URL</span>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." />
            </label>
            <label>
              <span>Headline</span>
              <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Best Coffee Bean in Town" />
            </label>
            <label>
              <span>Link description</span>
              <input type="text" value={linkDescription} onChange={e => setLinkDescription(e.target.value)} placeholder="Subtitle text under the headline" />
            </label>
            <label>
              <span>Body text</span>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} placeholder="Main ad copy..." />
            </label>
            <div className="launch-row">
              <label style={{ flex: 2 }}>
                <span>Destination link</span>
                <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://yoursite.com" />
              </label>
              <label>
                <span>CTA button</span>
                <select value={ctaType} onChange={e => setCtaType(e.target.value)}>
                  {CTA_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="step-nav">
              <button type="button" className="btn-back" onClick={back}>Back</button>
              <button type="button" onClick={next}>Next: Review</button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 3 && (
          <div className="step-content">
            <h3 className="step-title">Review & Launch</h3>
            <p className="step-desc">Everything look good? Hit launch to create all objects as PAUSED.</p>
            <table className="review-table">
              <tbody>
                <tr><td className="review-label">Campaign</td><td>{campaignName || "Ad Launch"}</td></tr>
                <tr><td className="review-label">Budget</td><td>${dailyBudget} / day</td></tr>
                <tr><td className="review-label">Country</td><td>{countryLabel}</td></tr>
                <tr><td className="review-label">Age</td><td>{ageMin} – {ageMax}</td></tr>
                <tr><td className="review-label">Gender</td><td>{genderLabel}</td></tr>
                <tr><td className="review-label">Headline</td><td>{headline}</td></tr>
                <tr><td className="review-label">Description</td><td>{linkDescription || "—"}</td></tr>
                <tr><td className="review-label">Body</td><td>{body}</td></tr>
                <tr><td className="review-label">Link</td><td className="mono">{link}</td></tr>
                <tr><td className="review-label">CTA</td><td>{ctaLabel}</td></tr>
              </tbody>
            </table>

            {error && <p className="error">{error}</p>}

            {result ? (
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
            ) : (
              <div className="step-nav">
                <button type="button" className="btn-back" onClick={back}>Back</button>
                <button type="button" onClick={handleLaunch} disabled={loading}>
                  {loading ? "Launching..." : "Launch Ad (PAUSED)"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
