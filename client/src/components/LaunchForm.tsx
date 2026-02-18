import { useState } from "react";
import { launchAd } from "../api";
import type { LaunchAdResult } from "../api";
import { AdPreview } from "./AdPreview";

interface Props {
  onLaunched: () => void;
}

const STEPS = ["Campaign", "Ad Set", "Targeting", "Creative", "Review"] as const;

// ── Campaign options ──

const OBJECTIVE_OPTIONS = [
  { value: "OUTCOME_TRAFFIC", label: "Traffic", desc: "Send people to a website" },
  { value: "OUTCOME_LEADS", label: "Leads", desc: "Collect leads for your business" },
  { value: "OUTCOME_AWARENESS", label: "Awareness", desc: "Reach people likely to remember" },
  { value: "OUTCOME_ENGAGEMENT", label: "Engagement", desc: "Get more messages, video views, or post interactions" },
  { value: "OUTCOME_SALES", label: "Sales", desc: "Find people likely to purchase" },
  { value: "OUTCOME_APP_PROMOTION", label: "App Promotion", desc: "Get more app installs or events" },
];

const SPECIAL_AD_CATEGORIES = [
  { value: "NONE", label: "None" },
  { value: "HOUSING", label: "Housing" },
  { value: "EMPLOYMENT", label: "Employment" },
  { value: "CREDIT", label: "Credit" },
  { value: "ISSUES_ELECTIONS_POLITICS", label: "Social Issues, Elections or Politics" },
];

const BID_STRATEGY_OPTIONS = [
  { value: "LOWEST_COST_WITHOUT_CAP", label: "Lowest cost", desc: "Get the most results for your budget" },
  { value: "LOWEST_COST_WITH_BID_CAP", label: "Bid cap", desc: "Set max bid across auctions" },
  { value: "COST_CAP", label: "Cost cap", desc: "Set max average cost per result" },
];

// ── Ad Set options ──

const BUDGET_OPTIONS = [
  { value: 5, label: "$5 / day" },
  { value: 10, label: "$10 / day" },
  { value: 20, label: "$20 / day" },
  { value: 50, label: "$50 / day" },
  { value: 100, label: "$100 / day" },
];

const OPTIMIZATION_GOAL_OPTIONS = [
  { value: "LINK_CLICKS", label: "Link clicks", desc: "Maximize clicks to your link" },
  { value: "LANDING_PAGE_VIEWS", label: "Landing page views", desc: "People who load your page" },
  { value: "IMPRESSIONS", label: "Impressions", desc: "Show your ad as many times as possible" },
  { value: "REACH", label: "Reach", desc: "Show to the max number of people" },
  { value: "LEAD_GENERATION", label: "Lead generation", desc: "Collect leads via forms" },
  { value: "OFFSITE_CONVERSIONS", label: "Conversions", desc: "Optimize for website conversions" },
  { value: "POST_ENGAGEMENT", label: "Post engagement", desc: "Get likes, comments, shares" },
  { value: "THRUPLAY", label: "ThruPlay", desc: "People who watch video to completion" },
];

const BILLING_EVENT_OPTIONS = [
  { value: "IMPRESSIONS", label: "Impressions (CPM)", desc: "Pay per 1,000 impressions" },
  { value: "LINK_CLICKS", label: "Link clicks (CPC)", desc: "Pay per click" },
  { value: "THRUPLAY", label: "ThruPlay", desc: "Pay per completed video view" },
];

const DESTINATION_TYPE_OPTIONS = [
  { value: "WEBSITE", label: "Website" },
  { value: "MESSENGER", label: "Messenger" },
  { value: "WHATSAPP", label: "WhatsApp" },
];

// ── Targeting options ──

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
  { code: "KR", label: "South Korea" },
  { code: "FR", label: "France" },
  { code: "BR", label: "Brazil" },
  { code: "AE", label: "UAE" },
];

const AGE_MIN_OPTIONS = [18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65];
const AGE_MAX_OPTIONS = [25, 30, 35, 40, 45, 50, 55, 60, 65];

// ── Creative options ──

const CTA_OPTIONS = [
  { value: "LEARN_MORE", label: "Learn More" },
  { value: "SHOP_NOW", label: "Shop Now" },
  { value: "SIGN_UP", label: "Sign Up" },
  { value: "BOOK_TRAVEL", label: "Book Travel" },
  { value: "CONTACT_US", label: "Contact Us" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "GET_QUOTE", label: "Get Quote" },
  { value: "SUBSCRIBE", label: "Subscribe" },
  { value: "GET_OFFER", label: "Get Offer" },
  { value: "WATCH_MORE", label: "Watch More" },
  { value: "APPLY_NOW", label: "Apply Now" },
  { value: "ORDER_NOW", label: "Order Now" },
  { value: "SEND_MESSAGE", label: "Send Message" },
];

// ── Defaults ──

const DEFAULTS = {
  // Campaign
  campaignName: "Ad Launch",
  objective: "OUTCOME_TRAFFIC",
  specialAdCategories: "NONE",
  bidStrategy: "LOWEST_COST_WITHOUT_CAP",
  // Ad Set
  dailyBudget: 5,
  optimizationGoal: "LINK_CLICKS",
  billingEvent: "IMPRESSIONS",
  destinationType: "WEBSITE",
  bidAmount: 200,
  startDate: "",
  endDate: "",
  // Targeting
  country: "PH",
  ageMin: 25,
  ageMax: 55,
  gender: "all",
  // Creative
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
  const [objective, setObjective] = useState(DEFAULTS.objective);
  const [specialAdCategories, setSpecialAdCategories] = useState(DEFAULTS.specialAdCategories);
  const [bidStrategy, setBidStrategy] = useState(DEFAULTS.bidStrategy);

  // Step 2: Ad Set
  const [dailyBudget, setDailyBudget] = useState(DEFAULTS.dailyBudget);
  const [optimizationGoal, setOptimizationGoal] = useState(DEFAULTS.optimizationGoal);
  const [billingEvent, setBillingEvent] = useState(DEFAULTS.billingEvent);
  const [destinationType, setDestinationType] = useState(DEFAULTS.destinationType);
  const [bidAmount, setBidAmount] = useState(DEFAULTS.bidAmount);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);

  // Step 3: Targeting
  const [country, setCountry] = useState(DEFAULTS.country);
  const [ageMin, setAgeMin] = useState(DEFAULTS.ageMin);
  const [ageMax, setAgeMax] = useState(DEFAULTS.ageMax);
  const [gender, setGender] = useState(DEFAULTS.gender);

  // Step 4: Creative
  const [imageUrl, setImageUrl] = useState(DEFAULTS.imageUrl);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [linkDescription, setLinkDescription] = useState(DEFAULTS.linkDescription);
  const [body, setBody] = useState(DEFAULTS.body);
  const [link, setLink] = useState(DEFAULTS.link);
  const [ctaType, setCtaType] = useState(DEFAULTS.ctaType);

  // UI state
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
        campaignName: campaignName || undefined,
        objective,
        specialAdCategories,
        bidStrategy,
        dailyBudget,
        optimizationGoal,
        billingEvent,
        destinationType,
        bidAmount,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        country,
        ageMin,
        ageMax,
        gender,
        headline,
        body,
        imageUrl,
        link,
        ctaType,
        linkDescription: linkDescription || undefined,
      });
      setResult(res);
      onLaunched();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Labels for review
  const objectiveLabel = OBJECTIVE_OPTIONS.find(o => o.value === objective)?.label || objective;
  const categoryLabel = SPECIAL_AD_CATEGORIES.find(c => c.value === specialAdCategories)?.label || specialAdCategories;
  const bidStrategyLabel = BID_STRATEGY_OPTIONS.find(b => b.value === bidStrategy)?.label || bidStrategy;
  const optGoalLabel = OPTIMIZATION_GOAL_OPTIONS.find(o => o.value === optimizationGoal)?.label || optimizationGoal;
  const billingLabel = BILLING_EVENT_OPTIONS.find(b => b.value === billingEvent)?.label || billingEvent;
  const destLabel = DESTINATION_TYPE_OPTIONS.find(d => d.value === destinationType)?.label || destinationType;
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

        {/* ── Step 1: Campaign ── */}
        {step === 0 && (
          <div className="step-content">
            <h3 className="step-title">Campaign</h3>
            <p className="step-desc">Choose your objective and campaign settings.</p>

            <label>
              <span>Campaign name</span>
              <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="e.g. Summer Sale 2026" />
            </label>

            <label>
              <span>Objective</span>
              <select value={objective} onChange={e => setObjective(e.target.value)}>
                {OBJECTIVE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Special ad categories</span>
              <select value={specialAdCategories} onChange={e => setSpecialAdCategories(e.target.value)}>
                {SPECIAL_AD_CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Bid strategy</span>
              <select value={bidStrategy} onChange={e => setBidStrategy(e.target.value)}>
                {BID_STRATEGY_OPTIONS.map(b => (
                  <option key={b.value} value={b.value}>{b.label} — {b.desc}</option>
                ))}
              </select>
            </label>

            <div className="step-nav">
              <div />
              <button type="button" onClick={next}>Next: Ad Set</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Ad Set ── */}
        {step === 1 && (
          <div className="step-content">
            <h3 className="step-title">Ad Set</h3>
            <p className="step-desc">Budget, optimization, delivery, and schedule.</p>

            <div className="launch-row">
              <label>
                <span>Daily budget</span>
                <select value={dailyBudget} onChange={e => setDailyBudget(Number(e.target.value))}>
                  {BUDGET_OPTIONS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Bid amount (cents)</span>
                <input type="number" value={bidAmount} onChange={e => setBidAmount(Number(e.target.value))} min={1} placeholder="200" />
              </label>
            </div>

            <label>
              <span>Optimization goal</span>
              <select value={optimizationGoal} onChange={e => setOptimizationGoal(e.target.value)}>
                {OPTIMIZATION_GOAL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                ))}
              </select>
            </label>

            <div className="launch-row">
              <label>
                <span>Billing event</span>
                <select value={billingEvent} onChange={e => setBillingEvent(e.target.value)}>
                  {BILLING_EVENT_OPTIONS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Destination type</span>
                <select value={destinationType} onChange={e => setDestinationType(e.target.value)}>
                  {DESTINATION_TYPE_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="launch-row">
              <label>
                <span>Start date (optional)</span>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </label>
              <label>
                <span>End date (optional)</span>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </label>
            </div>

            <div className="step-nav">
              <button type="button" className="btn-back" onClick={back}>Back</button>
              <button type="button" onClick={next}>Next: Targeting</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Targeting ── */}
        {step === 2 && (
          <div className="step-content">
            <h3 className="step-title">Targeting</h3>
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
                  {AGE_MIN_OPTIONS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Age max</span>
                <select value={ageMax} onChange={e => setAgeMax(Number(e.target.value))}>
                  {AGE_MAX_OPTIONS.map(a => (
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

        {/* ── Step 4: Creative ── */}
        {step === 3 && (
          <div className="step-content">
            <h3 className="step-title">Ad Creative</h3>
            <p className="step-desc">Design what your audience will see.</p>

            <div className="creative-layout">
              <div className="creative-fields">
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
              </div>

              <AdPreview
                body={body}
                imageUrl={imageUrl}
                headline={headline}
                linkDescription={linkDescription}
                link={link}
                ctaLabel={ctaLabel}
              />
            </div>

            <div className="step-nav">
              <button type="button" className="btn-back" onClick={back}>Back</button>
              <button type="button" onClick={next}>Next: Review</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Launch ── */}
        {step === 4 && (
          <div className="step-content">
            <h3 className="step-title">Review & Launch</h3>
            <p className="step-desc">Confirm everything, then launch. All objects will be created as PAUSED.</p>

            <div className="review-grid">
              <div className="review-group">
                <h4>Campaign</h4>
                <table className="review-table">
                  <tbody>
                    <tr><td className="review-label">Name</td><td>{campaignName || "Ad Launch"}</td></tr>
                    <tr><td className="review-label">Objective</td><td>{objectiveLabel}</td></tr>
                    <tr><td className="review-label">Category</td><td>{categoryLabel}</td></tr>
                    <tr><td className="review-label">Bid strategy</td><td>{bidStrategyLabel}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="review-group">
                <h4>Ad Set</h4>
                <table className="review-table">
                  <tbody>
                    <tr><td className="review-label">Budget</td><td>${dailyBudget} / day</td></tr>
                    <tr><td className="review-label">Bid amount</td><td>{bidAmount} cents</td></tr>
                    <tr><td className="review-label">Optimization</td><td>{optGoalLabel}</td></tr>
                    <tr><td className="review-label">Billing</td><td>{billingLabel}</td></tr>
                    <tr><td className="review-label">Destination</td><td>{destLabel}</td></tr>
                    {startDate && <tr><td className="review-label">Start</td><td>{startDate}</td></tr>}
                    {endDate && <tr><td className="review-label">End</td><td>{endDate}</td></tr>}
                  </tbody>
                </table>
              </div>

              <div className="review-group">
                <h4>Targeting</h4>
                <table className="review-table">
                  <tbody>
                    <tr><td className="review-label">Country</td><td>{countryLabel}</td></tr>
                    <tr><td className="review-label">Age</td><td>{ageMin} – {ageMax}</td></tr>
                    <tr><td className="review-label">Gender</td><td>{genderLabel}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="review-group">
                <h4>Creative</h4>
                <table className="review-table">
                  <tbody>
                    <tr><td className="review-label">Headline</td><td>{headline}</td></tr>
                    <tr><td className="review-label">Description</td><td>{linkDescription || "—"}</td></tr>
                    <tr><td className="review-label">Body</td><td>{body}</td></tr>
                    <tr><td className="review-label">Link</td><td className="mono">{link}</td></tr>
                    <tr><td className="review-label">CTA</td><td>{ctaLabel}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <AdPreview
              body={body}
              imageUrl={imageUrl}
              headline={headline}
              linkDescription={linkDescription}
              link={link}
              ctaLabel={ctaLabel}
            />

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
