# CoinScout / Atlas Scout

Atlas Scout turns a seller-selected Instagram coin listing into cited, reviewable public research leads. The live product flow is: connect an authorized Instagram account, select one post, set a local-only price range, then search public sources. Research receives only the seller-selected caption; it never receives pricing rules, sends messages, takes payment, reserves inventory, or creates shipping labels.

## Run locally

```bash
npm install
npm run dev
npm run test
npm run build
```

## Public routes

- `/` — launch page
- `/scout` — interactive Atlas Scout listing-to-research flow
- `/pitch` — three-slide hackathon pitch
- `/deck` — compatibility redirect to `/pitch`
- `/privacy` — privacy notice
- `/data-deletion` — data-deletion instructions

## Environment policy

Copy `.env.example` only for local development. Production credentials are Netlify Function secrets, never `VITE_*` variables. Local and deploy-preview mode use fixtures (`ATLAS_MODE=fixture`); only production may use `ATLAS_MODE=live`.

**Never commit secrets, OAuth tokens, customer data, Instagram media, or private pricing rules.** The DeepSeek credential previously shared in chat is treated as exposed and must not be used here.
