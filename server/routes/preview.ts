import { Router } from "express";
import { MetaClient } from "../../src/meta-client";

interface PreviewDeps {
  client: MetaClient;
  pageId: string;
}

function extractError(err: any): string {
  const metaErr = err.response?.data?.error;
  if (metaErr) {
    return metaErr.error_user_msg || metaErr.message || err.message;
  }
  return err.message;
}

export function previewRoutes(deps: PreviewDeps): Router {
  const router = Router();

  // POST /api/preview — generate a real Facebook ad preview iframe
  router.post("/", async (req, res) => {
    const { headline, body, imageUrl, link, linkDescription, ctaType, adFormat } = req.body;

    if (!headline || !body || !link) {
      return res.status(400).json({ error: "headline, body, and link are required" });
    }

    const creative: Record<string, any> = {
      object_story_spec: {
        page_id: deps.pageId,
        link_data: {
          message: body,
          link,
          name: headline,
          ...(linkDescription ? { description: linkDescription } : {}),
          ...(imageUrl ? { picture: imageUrl } : {}),
          ...(ctaType ? { call_to_action: { type: ctaType, value: { link } } } : {}),
        },
      },
    };

    try {
      const result = await deps.client.get(
        `/${deps.client.adAccountId}/generatepreviews`,
        {
          creative: JSON.stringify(creative),
          ad_format: adFormat || "DESKTOP_FEED_STANDARD",
        }
      );

      const previews = result.data || [];
      if (previews.length === 0) {
        return res.status(404).json({ error: "No preview generated" });
      }

      res.json({ html: previews[0].body });
    } catch (err: any) {
      console.error("Preview error:", err.response?.data || err.message);
      res.status(500).json({ error: extractError(err) });
    }
  });

  return router;
}
