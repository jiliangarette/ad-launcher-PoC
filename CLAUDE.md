# Ads Launcher

## Project Overview
CLI tool to launch and manage Meta (Facebook) ads programmatically via the Meta Graph API. Built with Node.js + TypeScript.

## Tech Stack
- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **HTTP Client:** axios
- **CLI Framework:** commander
- **Config:** dotenv (.env file)
- **API:** Meta Graph API v21.0

## Project Structure
```
ads-launcher/
├── src/
│   ├── index.ts            # CLI entry point
│   ├── config.ts           # Load env vars & config
│   ├── meta-client.ts      # Base Meta Graph API client
│   ├── campaigns.ts        # Campaign CRUD operations
│   ├── adsets.ts           # Ad Set CRUD operations
│   ├── ads.ts              # Ad CRUD operations
│   ├── creatives.ts        # Creative upload & management
│   ├── insights.ts         # Performance stats & reporting
│   └── types.ts            # TypeScript interfaces for Meta API objects
├── .claude/
│   └── skills/             # Custom Claude Code skills for ad operations
├── .env                    # Access token & ad account ID (NEVER commit)
├── .env.example            # Template for .env
├── .gitignore
├── package.json
├── tsconfig.json
├── CLAUDE.md               # This file
└── NOTES.md                # Project spec / PRD
```

## Commands
```bash
npm run build          # Compile TypeScript
npm start              # Run CLI
npm run dev            # Run with ts-node (dev mode)
```

## CLI Usage
```bash
# Campaigns
npx ts-node src/index.ts campaign create --name "Test" --objective OUTCOME_TRAFFIC --budget 100 --status PAUSED
npx ts-node src/index.ts campaign list
npx ts-node src/index.ts campaign pause <campaign_id>
npx ts-node src/index.ts campaign activate <campaign_id>

# Ad Sets
npx ts-node src/index.ts adset create --campaign <id> --name "Test AdSet" --budget 100 --targeting '{"geo":"US"}'

# Ads
npx ts-node src/index.ts ad create --adset <id> --creative <id> --name "Test Ad"

# Insights
npx ts-node src/index.ts insights --campaign <id> --fields impressions,clicks,spend
```

## Environment Variables
```
META_ACCESS_TOKEN=       # From Graph API Explorer (developers.facebook.com)
META_AD_ACCOUNT_ID=      # Format: act_XXXXXXXXX
META_API_VERSION=v21.0   # Graph API version
```

## Key Conventions
- All campaigns created via PoC default to PAUSED status for safety
- Budget values are in cents (e.g., 100 = $1.00)
- Never hardcode tokens — always use .env
- Never commit .env file
- Log all API responses for debugging
- Handle rate limits with exponential backoff

## Meta Graph API Reference
- Base URL: `https://graph.facebook.com/{version}/`
- Auth: access_token query param or Authorization header
- Campaign objectives: OUTCOME_AWARENESS, OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, OUTCOME_LEADS, OUTCOME_APP_PROMOTION, OUTCOME_SALES
- Ad structure hierarchy: Campaign → Ad Set → Ad Creative → Ad

## Security
- Access tokens from Graph API Explorer are short-lived (~1 hour)
- For longer sessions, exchange for a long-lived token (60 days)
- NEVER paste tokens in code, commits, or public places
- Use .env + dotenv only
