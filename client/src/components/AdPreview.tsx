interface AdPreviewProps {
  body: string;
  imageUrl: string;
  headline: string;
  linkDescription: string;
  link: string;
  ctaLabel: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "yoursite.com";
  }
}

export function AdPreview({ body, imageUrl, headline, linkDescription, link, ctaLabel }: AdPreviewProps) {
  const domain = getDomain(link);

  return (
    <div className="ad-preview">
      <div className="ad-preview-label">Ad Preview</div>
      <div className="ad-preview-card">
        {/* Header */}
        <div className="ad-preview-header">
          <div className="ad-preview-avatar" />
          <div className="ad-preview-meta">
            <span className="ad-preview-page">Your Page</span>
            <span className="ad-preview-sponsored">Sponsored</span>
          </div>
        </div>

        {/* Body text */}
        <div className="ad-preview-body">
          {body || "Your ad copy goes here..."}
        </div>

        {/* Image */}
        <div className="ad-preview-image">
          {imageUrl ? (
            <img src={imageUrl} alt="Ad creative" />
          ) : (
            <div className="ad-preview-image-placeholder">No image</div>
          )}
        </div>

        {/* Link bar */}
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
    </div>
  );
}
