# Ads Launcher - Project Spec / PRD

## Project Overview
- **Goal:** Launch Meta (Facebook) ads programmatically using Claude Code + Meta Graph API
- **Source:** Instagram reel showing the workflow (developers.facebook.com → app → token → Claude Code)
- **User context:** Has existing Meta ad account with active campaigns (managed via Meta website, not 3rd party)
- **Verdict:** YES, it works. PoC doable in 1 day.

---

## Phase 1: Proof of Concept (1 Day)

### What it does
- Connect to user's existing ad account via Meta Graph API
- Create a single test campaign (paused or $1/day budget)
- Pause / unpause campaigns
- Add a simple ad creative (image + text)
- Log API responses to verify it works

### Architecture (PoC)
```
Claude Code → generates API scripts
     ↓
Local Script (Node/.NET/Python)
     ↓
Meta Graph API (v19.0+)
     ↓
User's existing Ad Account
```

### Steps
1. Create Meta Developer account at developers.facebook.com
2. Create an app in the developer portal
3. Go to Tools → Graph API Explorer → copy access token
4. Use Claude Code to write scripts that hit the Meta Graph API
5. Create a paused test campaign via API
6. Verify campaign appears in Meta Ads Manager

### Permissions Needed (for own account - NO App Review required)
- `ads_management` — create, update, delete campaigns/ad sets
- `ads_read` — read campaign performance/stats
- `business_management` — access Business Manager assets

### Important Notes
- Short-lived tokens (1 hour) from Graph API Explorer — fine for testing
- Using own ad account = no Meta App Review needed
- Start with PAUSED campaigns or tiny budget ($1/day)
- Existing campaigns are NOT affected (new campaigns use separate IDs)

---

## Phase 2: Production-Ready (Days → Weeks)

### Additional Requirements
- **Meta App Review** — Meta must approve app for production scopes (only if other users will use it)
- **Business Verification** — Meta verifies your company legally
- **OAuth 2.0 flow** — users log in and authorize app
- **Long-lived access tokens** — handle refresh automatically
- **Secure token storage** — encrypted in database, never exposed in code
- **Error handling & retry logic** — for API failures or rate limits
- **Rate limit management** — don't hit Meta API limits
- **Spend limit safeguards** — prevent overspending

### Full Feature Set
- Create / update / pause / delete campaigns
- Upload creatives (images/videos)
- Set targeting, placements, budgets, objectives
- Track performance metrics via API (clicks, impressions, CTR, ROAS)
- Analytics dashboard
- Multi-account support
- Campaign scheduling
- Creative templates (AI-generated ad copy & images)
- Notifications for campaign performance or errors
- Audit logging — track who did what
- GDPR / privacy compliance

### Production Architecture
```
[User Interface / Dashboard]
        ↓
   [Claude AI] → suggests campaigns / optimizations
        ↓
  [Backend Server] → handles OAuth, token refresh, API requests
        ↓
 [Meta Graph API] → executes ads in Ad Account
        ↓
    [Database] → stores campaigns, creatives, tokens, logs
```

---

## API Reference

### Create Campaign Example
```
POST /act_<ad_account_id>/campaigns
{
  "name": "AI Campaign",
  "objective": "CONVERSIONS",
  "status": "PAUSED",
  "access_token": "<token>"
}
```

### Ad Structure (required hierarchy)
```
Campaign → Ad Set → Ad Creative → Ad
```
Each level needs: budget, targeting, pixel tracking, placements, optimization goals.

---

## Security Warnings
- NEVER paste production tokens into public repos or unsecured tools
- Token can: spend money, create ads, access business assets
- If leaked = someone can burn your ad budget
- Use environment variables for token storage
- Start with test/paused campaigns only

---

## Key Decisions
- Phase 1 first: prove it works with a test ad
- Use existing ad account (no new account needed)
- Claude Code generates the scripts, local machine executes them
- AI = assistant, backend = executor, Graph API = the bridge

---

## Foundation Built (2026-02-18)

### Tech Stack Chosen
- Node.js + TypeScript
- axios (HTTP), commander (CLI), dotenv (config)
- Meta Graph API v21.0

### Project Files Created
- `CLAUDE.md` — project instructions for Claude Code
- `package.json` — dependencies installed
- `tsconfig.json` — TypeScript config
- `.gitignore` — ignores node_modules, .env, dist
- `.env.example` — template for required env vars

### Core Modules (src/)
- `config.ts` — loads & validates env vars
- `meta-client.ts` — base HTTP client for Meta Graph API (get/post/delete with error handling)
- `campaigns.ts` — create, list, pause, activate, delete campaigns
- `adsets.ts` — create, list, pause, activate ad sets
- `ads.ts` — create, list, pause, activate ads
- `creatives.ts` — create & list ad creatives
- `insights.ts` — pull performance stats (campaign, ad set, account level)
- `types.ts` — TypeScript interfaces for all Meta API objects
- `index.ts` — CLI entry point with commander (all commands wired up)

### Claude Skills (.claude/skills/)
- `launch-campaign.md` — guided campaign creation
- `check-stats.md` — pull and present insights
- `manage-ads.md` — pause/activate/delete/list operations

### Status: Build compiles clean, ready for .env config + testing

### What User Needs To Provide
1. META_ACCESS_TOKEN (from Graph API Explorer)
2. META_AD_ACCOUNT_ID (format: act_XXXXXXXXX)
3. Copy .env.example → .env and fill in values

---

## Connection Verified (2026-02-18)
- Ad Account: act_218511096341411 (Jx Ad Account Back Up 2)
- Page: 100484998676572 (Themoneybees)
- Token: Long-lived, expires March 31, 2026
- 11 existing campaigns found (mix of ACTIVE/PAUSED, all OUTCOME_LEADS)
- Account stats (last 30d): 315K impressions, 3.4K clicks, $2,663 spend, 1.10% CTR
- CLI fully functional: campaign list, insights, all commands working

---

## Full Ad Launcher (2026-02-18)

### What's New
- **One-click ad launch**: Form creates Campaign → Ad Set → Creative → Ad in one shot
- All objects start PAUSED for safety — review in Ads Manager before activating
- Page: Coarse Coffee (118316606461101) on JX Advisory Back up Acc (act_215033903458934)
- Objective: OUTCOME_TRAFFIC (link click ads with destination URL)

### Files Added/Modified
- `server/routes/launch.ts` — POST /api/launch endpoint (sequential 4-step creation)
- `client/src/components/LaunchForm.tsx` — launcher form UI
- `client/src/api.ts` — launchAd() client function
- `src/config.ts` + `src/types.ts` — pageId added to config
- `server/index.ts` — wired up AdSetManager, CreativeManager, AdManager, launch route

### How to Use
1. `npm run dev:ui` — starts API server (:3001) + Vite client (:5173)
2. Fill out Launch Ad form: image URL, headline, body, link, targeting, budget
3. Click "Launch Ad (PAUSED)" — all 4 IDs returned on success
4. Open Meta Ads Manager → verify campaign hierarchy → activate when ready
