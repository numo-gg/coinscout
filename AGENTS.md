# CoinScout collaboration boundaries

- **Core** owns `src/app`, `src/pages`, `src/shared`, root configuration, and Netlify deployment configuration.
- **Scout** owns `src/features/scout` and `netlify/functions`. Keep pricing and state transitions pure; no model is a financial authority.
- **Pitch** owns `src/features/pitch` only. `/pitch` stays static and must not depend on Scout state or APIs.
- **Quality** owns tests, documentation, privacy/data-deletion pages, and secret checks.

Do not reuse Numo code, secrets, Meta apps, deployment configuration, tokens, or customer data. Do not edit another owner’s files without coordinating with Core. Never put a real secret in Git, client code, test fixtures, logs, screenshots, or preview builds.
