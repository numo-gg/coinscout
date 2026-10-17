# CoinScout / Atlas Scout

Atlas Scout is a seller-controlled demo for turning a coin listing into cited, reviewable buyer prospects. AI may analyze approved listing text, research public sources, and draft copy; it never decides a price, sends a message, takes payment, reserves inventory, or creates a shipping label.

## Run locally

```bash
npm install
npm run dev
npm run test
npm run build
```

## Public routes

- `/` — launch page
- `/scout` — interactive Atlas Scout demo
- `/pitch` — static hackathon pitch
- `/privacy` — privacy notice
- `/data-deletion` — data-deletion instructions

## Environment policy

Copy `.env.example` only for local development. Production credentials are Netlify Function secrets, never `VITE_*` variables. Local and deploy-preview mode use fixtures (`ATLAS_MODE=fixture`); only production may use `ATLAS_MODE=live`.

**Never commit secrets, OAuth tokens, customer data, Instagram media, or private pricing rules.** The DeepSeek credential previously shared in chat is treated as exposed and must not be used here.
