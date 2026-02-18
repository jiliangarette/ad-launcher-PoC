# Skill: Launch Campaign

When the user asks to launch, create, or start a campaign, do the following:

1. Ask for campaign details if not provided:
   - Campaign name
   - Objective (default: OUTCOME_TRAFFIC)
   - Daily budget in dollars (convert to cents for the API)
   - Target countries (default: US)
   - Age range (default: 18-65)

2. Run the CLI command:
```bash
npx ts-node src/index.ts campaign create --name "<name>" --objective <objective> --status PAUSED
```

3. If the user also wants an ad set, create one:
```bash
npx ts-node src/index.ts adset create --name "<name> - AdSet" --campaign <campaign_id> --budget <cents> --countries <codes> --age-min <min> --age-max <max>
```

4. Always default to PAUSED status. Only set ACTIVE if the user explicitly says "go live" or "activate".

5. Show the campaign ID and confirm it was created.
