# Meta Ads Launcher — Complete Setup Guide

Step-by-step guide to set up programmatic Meta (Facebook/Instagram) ad creation from scratch. Covers Meta Developer setup, Business Manager config, token generation, and all the gotchas.

---

## Table of Contents
1. [Meta Developer Account & App](#1-meta-developer-account--app)
2. [Business Manager Setup](#2-business-manager-setup)
3. [Connect Page to Ad Account](#3-connect-page-to-ad-account)
4. [Generate Access Token](#4-generate-access-token)
5. [Add Payment Method](#5-add-payment-method)
6. [Project Setup](#6-project-setup)
7. [Environment Variables](#7-environment-variables)
8. [Test the Pipeline](#8-test-the-pipeline)
9. [API Gotchas & Required Fields](#9-api-gotchas--required-fields)
10. [Troubleshooting](#10-troubleshooting)
11. [Architecture Reference](#11-architecture-reference)

---

## 1. Meta Developer Account & App

### Create Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Log in with your Facebook account
3. Accept the developer terms if prompted

### Create an App
1. Click **My Apps** → **Create App**
2. Choose app type: **Business**
3. Name it (e.g., "Ads Launcher")
4. Select your Business Portfolio (or create one)
5. Click **Create App**

### Set App to Live Mode (CRITICAL)
> Apps in "Development" mode CANNOT create ad creatives. You'll get: `"Ads creative post was created by an app that is in development mode"`

1. Go to **My Apps** → click your app
2. In the left sidebar or top bar, find **App Mode**
3. Toggle from **"In development"** → **"Live"**
4. You may need to provide a Privacy Policy URL (can be any valid URL for testing)

### Note: If You Have Multiple Apps
If you have multiple apps with the same name, make sure you use the **Live** one when generating tokens. Check `My Apps` page to see which is Live vs In Development.

---

## 2. Business Manager Setup

### Access Business Settings
Go to [business.facebook.com/settings](https://business.facebook.com/settings)

### You Need These Assets
| Asset | Purpose | Where to Find |
|-------|---------|---------------|
| **Facebook Page** | Required for ad creatives (ads post "on behalf of" a page) | Accounts → Pages |
| **Ad Account** | Where campaigns/ads live, linked to billing | Accounts → Ad accounts |
| **Payment Method** | Required to create Ads (even PAUSED ones) | Billing & payments |

### Pages
- You need a Facebook Page that your token can access
- The page must be **owned by your Business Manager** or you must have **full control**
- Pages "Owned by" another BM have limited API access — you may not be able to use them for ad creatives via API even if you have full control in the UI

### Ad Accounts
- Format: `act_XXXXXXXXX`
- Must be **Active** (not Disabled)
- Must have a **payment method** attached
- Note the **currency** — budgets are in the account's currency (e.g., SGD, USD, PHP), and minimums vary

---

## 3. Connect Page to Ad Account

> **This step is REQUIRED.** The API will return `"No permission to access this profile"` if the page isn't connected to the ad account.

### From Business Settings:
1. Go to **Accounts → Pages**
2. Click on your page
3. Click **"Connected assets"** tab
4. Click **"Connect assets"**
5. Select **Ad accounts** → pick your ad account
6. Save

### If "Connect assets" only shows Instagram:
The page is owned by another Business Manager. You have two options:
- Ask the BM owner to connect the ad account to the page from their BM settings
- Use a page that your own BM owns

### Verify Connection:
- Go to **Accounts → Ad accounts** → click your ad account → **Connected assets**
- Your page should be listed there

---

## 4. Generate Access Token

### Go to Graph API Explorer
[developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/)

### Configure:
1. **Meta App** → Select your app (make sure it's the **Live** one!)
2. **User or Page** → "Get Token" (User Token)

### Required Permissions
Add ALL of these permissions before generating:

| Permission | Purpose |
|-----------|---------|
| `ads_management` | Create/update/delete campaigns, ad sets, creatives, ads |
| `ads_read` | Read campaign data and insights |
| `pages_manage_ads` | Create ad creatives on behalf of a page |
| `pages_read_engagement` | Read page data for ad creation |
| `business_management` | Access Business Manager assets |
| `pages_read_user_content` | Read page content (optional but helpful) |

### Generate & Authorize
1. Click **"Generate Access Token"**
2. Facebook will show an authorization dialog
3. **IMPORTANT:** When it asks "Choose what you allow" for pages, make sure your ad page (e.g., Coarse Coffee) is **checked/enabled**
4. Complete authorization
5. Copy the token from the Access Token field

### Token Lifetime
- Graph API Explorer tokens are **short-lived (~1 hour)**
- For longer sessions, exchange for a **long-lived token (60 days)** via the API
- The app will work with either; just regenerate when it expires

### Verify Token Works
In Graph API Explorer, with your token loaded:
```
GET /me?fields=id,name
```
Should return your name. Then:
```
GET /me/accounts?fields=id,name
```
Should list your pages (the page you want to use for ads MUST appear here).

---

## 5. Add Payment Method

> Even PAUSED ads require a payment method on the ad account. Without one: `"No payment method — Update payment method"`

### Steps:
1. Go to [business.facebook.com](https://business.facebook.com) → **Billing & payments**
2. Find your ad account in the list
3. If it shows **"No payment method"** → click **"View details"**
4. Click **"Add payment method"**
5. If you already added a card to the BM, select **"Business payment method"** to reuse it
6. Otherwise, add a new debit/credit card or PayPal
7. Complete the tax information form (GST Registration Number is optional)

### Payment Method Must Be Connected to the Ad Account
Adding a card to the BM is not enough — it must be linked to the specific ad account:
- In Billing → Payment methods, scroll down to find your ad account section
- Click **"Add payment method"** under that ad account
- Select the existing business payment method

---

## 6. Project Setup

### Prerequisites
- Node.js v18+
- npm

### Install
```bash
git clone <your-repo>
cd ads-launcher
npm install
cd client && npm install && cd ..
```

### Project Structure
```
ads-launcher/
├── src/                    # Core Meta API modules
│   ├── config.ts           # Load .env config
│   ├── meta-client.ts      # HTTP client (axios)
│   ├── campaigns.ts        # Campaign CRUD
│   ├── adsets.ts           # Ad Set CRUD
│   ├── creatives.ts        # Creative CRUD
│   ├── ads.ts              # Ad CRUD
│   ├── insights.ts         # Performance stats
│   └── types.ts            # TypeScript interfaces
├── server/                 # Express API server (:3001)
│   ├── index.ts            # Server entry point
│   └── routes/
│       ├── campaigns.ts    # Campaign endpoints
│       ├── insights.ts     # Insights endpoints
│       └── launch.ts       # POST /api/launch (full pipeline)
├── client/                 # Vite React UI (:5173)
│   └── src/
│       ├── api.ts          # Fetch wrappers
│       ├── App.tsx         # Main layout
│       └── components/
│           ├── LaunchForm.tsx    # One-click ad launcher form
│           ├── CampaignList.tsx  # Campaign table
│           ├── CreateCampaign.tsx
│           └── AccountStats.tsx
├── .env                    # Tokens & config (NEVER commit)
├── .env.example            # Template
├── CLAUDE.md               # Claude Code instructions
└── package.json
```

---

## 7. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
META_ACCESS_TOKEN=EAAxxxxx...     # From Graph API Explorer (see step 4)
META_AD_ACCOUNT_ID=act_XXXXXXXXX  # Your ad account ID (must start with act_)
META_API_VERSION=v21.0            # Graph API version
META_PAGE_ID=XXXXXXXXX            # Facebook Page ID for ad creatives
```

### Where to Find Each Value
| Variable | Where to Find |
|----------|--------------|
| `META_ACCESS_TOKEN` | Graph API Explorer → Access Token field |
| `META_AD_ACCOUNT_ID` | Business Settings → Ad accounts → ID column (format: `act_123456789`) |
| `META_PAGE_ID` | Business Settings → Pages → click page → ID shown under page name |
| `META_API_VERSION` | Use `v21.0` (current stable) |

---

## 8. Test the Pipeline

### Start the UI
```bash
npm run dev:ui
```
This starts both the API server (`:3001`) and Vite client (`:5173`).

### Launch an Ad
1. Open `http://localhost:5173`
2. Fill out the Launch Ad form (defaults are pre-filled):
   - **Image URL** — direct link to an image (CDN URL, not a Facebook photo page URL)
   - **Headline** — ad title
   - **Body text** — ad description
   - **Destination link** — where clicks go
   - **Country** — 2-letter ISO code (US, PH, SG, etc.)
   - **Age min/max** — targeting range (18-65)
   - **Daily budget** — in account currency (minimum varies, typically 2+)
3. Click **"Launch Ad (PAUSED)"**
4. All 4 IDs should appear (Campaign, Ad Set, Creative, Ad)

### What Gets Created (in sequence)
```
Campaign (OUTCOME_TRAFFIC, PAUSED)
  └── Ad Set (daily budget, targeting, LINK_CLICKS optimization)
       └── Ad Creative (page post with image, headline, body, link)
            └── Ad (ties creative to ad set, PAUSED)
```

### Verify in Ads Manager
1. Go to [adsmanager.facebook.com](https://adsmanager.facebook.com)
2. Select the correct ad account
3. You should see the new campaign → drill into it → ad set → ad
4. Everything should show as PAUSED / Off
5. Toggle to Active when ready to go live

---

## 9. API Gotchas & Required Fields

These are undocumented or poorly documented requirements for Meta Graph API v21.0 that will cause `"Invalid parameter"` errors if missing.

### Campaign Creation
| Field | Value | Why |
|-------|-------|-----|
| `special_ad_categories` | `["NONE"]` | MUST be `["NONE"]`, not empty `[]` |
| `is_adset_budget_sharing_enabled` | `false` | REQUIRED — set `false` for ad-set-level budgets (no CBO) |
| `bid_strategy` | Do NOT set | Requires campaign-level budget; omit for ad-set budgets |

### Ad Set Creation
| Field | Value | Why |
|-------|-------|-----|
| `destination_type` | `"WEBSITE"` | REQUIRED for OUTCOME_TRAFFIC campaigns |
| `bid_amount` | `"200"` (in cents) | REQUIRED — sets bid cap (e.g., 200 = $2.00 max per click) |
| `targeting.targeting_automation` | `{ advantage_audience: 0 }` | REQUIRED — must explicitly disable/enable Advantage audience |
| `billing_event` | `"IMPRESSIONS"` | Standard for link click optimization |
| `optimization_goal` | `"LINK_CLICKS"` | Standard for OUTCOME_TRAFFIC |
| `daily_budget` | In **cents** of account currency | e.g., 500 = $5.00; minimum varies by currency/country |

### Ad Creative Creation
| Field | Value | Why |
|-------|-------|-----|
| `object_story_spec.page_id` | Your page ID | Page MUST be accessible by token (`me/accounts` must include it) |
| `object_story_spec.link_data.picture` | Direct image URL | Must be a CDN/direct image URL, NOT a Facebook photo page URL |
| `object_story_spec.link_data.name` | Headline | The clickable title |
| `object_story_spec.link_data.message` | Body text | Post body text |
| `object_story_spec.link_data.link` | Destination URL | Where users go when they click |

### Ad Creation
- Requires a valid **payment method** on the ad account (even for PAUSED ads)
- May trigger **account authentication** — a security check from Meta requiring verification in Ads Manager

---

## 10. Troubleshooting

### "Invalid parameter"
- Generic Meta error. Check server console for the full error JSON including `error_subcode` and `blame_field_specs`
- Usually means a required field is missing (see gotchas above)

### "No permission to access this profile"
- The token can't access the page. Check: `GET /me/accounts` — your page must appear in the list
- If not: regenerate token in Graph API Explorer and make sure the page is authorized in the "Choose what you allow" dialog
- The page must also be connected to the ad account in Business Settings

### "Ads creative post was created by an app that is in development mode"
- Your Meta App is in Development mode. Switch to **Live** in developer portal
- Make sure you're generating the token from the **Live** app (check App ID matches)

### "Please authenticate your account"
- Meta security check triggered by unusual API activity or new payment method
- Go to Ads Manager → try to create an ad manually → the auth prompt will appear
- Click **"Start authentication"** and complete verification
- After authenticating, **generate a new token** — old tokens may still be blocked

### "No payment method"
- Ad account needs a card even for PAUSED ads
- Business Settings → Billing & payments → add card → connect it to the ad account

### "Budget is too low"
- The minimum daily budget varies by currency. Check account currency:
  - SGD: minimum ~SGD 1.28/day
  - USD: minimum ~$1.00/day
  - PHP: minimum ~PHP 40/day
- Set daily budget to at least 2x the minimum to be safe

### Token Expired
- Graph API Explorer tokens last ~1 hour
- Error: `"Error validating access token"` or code 190
- Solution: regenerate token in Graph API Explorer
- For longer sessions: exchange for a long-lived token (60 days)

---

## 11. Architecture Reference

### Ad Hierarchy (Meta requires ALL 4 levels)
```
Campaign          — objective, budget strategy, status
  └── Ad Set      — targeting, budget, schedule, optimization
       └── Creative — image, headline, body, link, page
            └── Ad  — ties creative to ad set, final status
```
A campaign alone does NOTHING. You need the full chain for an ad to appear.

### API Flow (POST /api/launch)
```
1. POST /act_{id}/campaigns     → campaignId
2. POST /act_{id}/adsets        → adSetId    (needs campaignId)
3. POST /act_{id}/adcreatives   → creativeId (needs pageId)
4. POST /act_{id}/ads           → adId       (needs adSetId + creativeId)
```
Each step depends on the previous — must be sequential.

### Meta Graph API Base URL
```
https://graph.facebook.com/v21.0/
```
All requests include `access_token` as a query parameter.

### Key URLs
| What | URL |
|------|-----|
| Graph API Explorer | https://developers.facebook.com/tools/explorer/ |
| Business Settings | https://business.facebook.com/settings |
| Ads Manager | https://adsmanager.facebook.com |
| App Dashboard | https://developers.facebook.com/apps/ |
| Billing & Payments | https://business.facebook.com/billing_hub/ |
| Account Quality | https://business.facebook.com/accountquality |

---

## Quick Start Checklist

- [ ] Meta Developer account created
- [ ] App created and set to **Live** mode
- [ ] Facebook Page exists and is owned by your BM
- [ ] Ad account is **Active** (not Disabled)
- [ ] Payment method added and connected to ad account
- [ ] Page connected to ad account (Business Settings → Pages → Connected assets)
- [ ] Access token generated with all 6 permissions
- [ ] Page appears in `GET /me/accounts` response
- [ ] `.env` filled with token, ad account ID, API version, page ID
- [ ] `npm install` in root and `client/`
- [ ] `npm run dev:ui` — both servers start
- [ ] Launch form creates all 4 objects successfully
