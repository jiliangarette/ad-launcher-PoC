import { useState } from "react";
import { fetchAdPreview } from "../api";

interface AdPreviewProps {
  body: string;
  imageUrl: string;
  headline: string;
  linkDescription: string;
  link: string;
  ctaLabel: string;
  ctaType: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "yoursite.com";
  }
}

const AD_FORMAT_OPTIONS = [
  { value: "DESKTOP_FEED_STANDARD", label: "Desktop Feed" },
  { value: "MOBILE_FEED_STANDARD", label: "Mobile Feed" },
  { value: "INSTAGRAM_STANDARD", label: "Instagram Feed" },
  { value: "INSTAGRAM_STORY", label: "Instagram Story" },
  { value: "RIGHT_COLUMN_STANDARD", label: "Right Column" },
];

export function AdPreview({ body, imageUrl, headline, linkDescription, link, ctaLabel, ctaType }: AdPreviewProps) {
  const domain = getDomain(link);
  const [fbHtml, setFbHtml] = useState<string | null>(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [fbError, setFbError] = useState("");
  const [adFormat, setAdFormat] = useState("DESKTOP_FEED_STANDARD");
  const [showFb, setShowFb] = useState(false);

  async function loadFbPreview(format?: string) {
    if (!headline || !body || !link) return;
    setFbLoading(true);
    setFbError("");
    setFbHtml(null);
    setShowFb(true);
    try {
      const html = await fetchAdPreview({
        headline,
        body,
        link,
        imageUrl: imageUrl || undefined,
        linkDescription: linkDescription || undefined,
        ctaType: ctaType || undefined,
        adFormat: format || adFormat,
      });
      setFbHtml(html);
    } catch (err: any) {
      setFbError(err.message);
    } finally {
      setFbLoading(false);
    }
  }

  function handleFormatChange(format: string) {
    setAdFormat(format);
    if (showFb) loadFbPreview(format);
  }

  return (
    <div className="ad-preview">
      <div className="ad-preview-label">Preview</div>

      {/* Mock preview */}
      {!showFb && (
        <div className="ad-preview-card">
          <div className="ad-preview-header">
            <div className="ad-preview-avatar" />
            <div className="ad-preview-meta">
              <span className="ad-preview-page">Your Page</span>
              <span className="ad-preview-sponsored">Sponsored</span>
            </div>
          </div>

          <div className="ad-preview-body">
            {body || "Your ad copy goes here..."}
          </div>

          <div className="ad-preview-image">
            {imageUrl ? (
              <img src={imageUrl} alt="Ad creative" />
            ) : (
              <div className="ad-preview-image-placeholder">No image</div>
            )}
          </div>

          <div className="ad-preview-link-bar">
            <div className="ad-preview-link-text">
              <span className="ad-preview-domain">{domain}</span>
              <span className="ad-preview-headline">{headline || "Headline"}</span>
              {linkDescription && (
                <span className="ad-preview-description">{linkDescription}</span>
              )}
            </div>
            <button type="button" className="ad-preview-cta" tabIndex={-1}>
              {ctaLabel}
            </button>
          </div>
        </div>
      )}

      {/* Real Facebook preview */}
      {showFb && (
        <div className="fb-preview-container">
          {fbLoading && <div className="fb-preview-loading">Loading Facebook preview...</div>}
          {fbError && <div className="fb-preview-error">{fbError}</div>}
          {fbHtml && (
            <div
              className="fb-preview-frame"
              dangerouslySetInnerHTML={{ __html: fbHtml }}
            />
          )}
        </div>
      )}

      {/* Controls */}
      <div className="ad-preview-controls">
        {showFb && (
          <select
            className="ad-preview-format-select"
            value={adFormat}
            onChange={e => handleFormatChange(e.target.value)}
          >
            {AD_FORMAT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          className={showFb ? "btn-sm" : "btn-sm ad-preview-fb-btn"}
          onClick={() => {
            if (showFb) { setShowFb(false); setFbHtml(null); setFbError(""); }
            else loadFbPreview();
          }}
        >
          {showFb ? "Show Mock" : "Preview on Facebook"}
        </button>
        {showFb && !fbLoading && (
          <button type="button" className="btn-sm" onClick={() => loadFbPreview()}>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}
