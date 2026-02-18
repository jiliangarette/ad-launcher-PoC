# Skill: Check Stats

When the user asks to check stats, performance, insights, or how campaigns are doing:

1. If they mention a specific campaign ID:
```bash
npx ts-node src/index.ts insights campaign <id> --fields impressions,clicks,spend,ctr,cpc --period last_7d
```

2. If they want account-level overview:
```bash
npx ts-node src/index.ts insights account --fields impressions,clicks,spend,ctr --period last_7d
```

3. If they want to see all campaigns first:
```bash
npx ts-node src/index.ts campaign list
```

4. Present the data in a readable format — summarize key metrics.
