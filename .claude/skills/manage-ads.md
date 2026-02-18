# Skill: Manage Ads

When the user asks to pause, activate, delete, or list campaigns/ads:

## List everything
```bash
npx ts-node src/index.ts campaign list
npx ts-node src/index.ts adset list
npx ts-node src/index.ts ad list
```

## Pause
```bash
npx ts-node src/index.ts campaign pause <id>
npx ts-node src/index.ts adset pause <id>
npx ts-node src/index.ts ad pause <id>
```

## Activate
```bash
npx ts-node src/index.ts campaign activate <id>
npx ts-node src/index.ts adset activate <id>
npx ts-node src/index.ts ad activate <id>
```

## Delete (campaigns only)
```bash
npx ts-node src/index.ts campaign delete <id>
```

Always confirm with the user before activating (going live) or deleting.
