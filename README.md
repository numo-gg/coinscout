# CoinScout

CoinScout currently ships a three-slide pitch about focused buyer discovery for collectible coins. The public site exposes the pitch deck only.

## Run locally

```bash
npm install
npm run dev
npm run test
npm run build
```

## Public routes

- `/deck` — three-slide hackathon pitch
- `/`, `/pitch`, `/scout`, `/privacy`, and `/data-deletion` redirect to `/deck`

## Environment policy

Copy `.env.example` only for local development. Production credentials are Netlify Function secrets, never `VITE_*` variables. Local and deploy-preview mode use fixtures (`ATLAS_MODE=fixture`); only production may use `ATLAS_MODE=live`.

**Never commit secrets, OAuth tokens, customer data, Instagram media, or private pricing rules.** The DeepSeek credential previously shared in chat is treated as exposed and must not be used here.
