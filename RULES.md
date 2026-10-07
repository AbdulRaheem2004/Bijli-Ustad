# Bijli Bill Explainer & Estimator - Project Rules

These rules govern the development, design, and deployment of the **Bijli Bill Explainer & Estimator** web application. This project targets Pakistani households and businesses to demystify complex electricity bills through credible data and grounded local RAG.

## 1. Quality & Codebase Management
- **GASP Writing & Anti-Slop:** Zero tolerance for generic AI fluff. All copy must be sharp, purposeful, and direct. UI text must feel human-crafted, culturally authentic, and mathematically transparent.
- **Impeccable Craft Floor:** Execute UI with out-of-distribution craft:
  - Contrast: Body text $\ge 4.5:1$, large text $\ge 3:1$.
  - Typography: Balanced measure, tabular numerals (`font-variant-numeric: tabular-nums`) for currency and unit figures, custom styled scrollbars and focus rings.
  - Inputs: Direct numeric inputs provided alongside sliders for fast, precise entry.
  - Ban generic purple/indigo AI templates, oversized empty padding, and gradient text.
- **Ponytail Minimalism:** Zero bloat. The core tariff engine must be pure deterministic JavaScript (<25KB) with zero runtime dependencies. Prefer native Canvas for bill breakdown charts over bulky charting libraries. No server, no database, no authentication.
- **Graphify:** Maintain codebase context, component maps, and tariff schema relationships via `graphify`.

## 2. Public App Requirements
- **Web-First:** Build as a responsive modern web application, optimized for both desktop and mobile viewports.
- **SEO & Social Sharing:** Custom Open Graph preview card for WhatsApp and social platforms.
- **Performance:** Lightweight bundle, fast load times (LCP < 2s).
- **Favicon & PWA:** Custom favicon and service worker for offline resilience.

## 3. Pakistani Household Audience UX
- **Language Support:** First-class support for English, Roman Urdu, and Nastaliq Urdu (`Noto Nastaliq Urdu` font stack).
- **Tech Literacy & Clarity:** Interactions must be straightforward. Every tariff term (FPA, QTA, FC Surcharge, Protected Slab) has a plain-language explanation.
- **Thumb-Friendly:** Touch targets $\ge 44 \times 44\text{px}$.
- **Dark & Light Mode:** Clear, high-contrast theming suitable for outdoor glare and AMOLED screens.

## 4. Credible Data Ground Truth (Zero Guesswork)
- **Official NEPRA SROs:** Every single base rate, slab threshold, and surcharge must be linked to an official Statutory Regulatory Order (SRO) published in the Gazette of Pakistan or NEPRA tariff determination.
- **Tariff Manifest:** Maintain `tariffs-source-manifest.json` linking every rate to its legal citation and date.
- **Live Update Feed:** Check versioned `tariffs-feed.json` on app load, falling back gracefully to local offline cache.
- **Transparency:** The UI must feature an "Inspect Ground Truth" badge on rates.

## 5. Privacy & Zero-Database Architecture
- **Strict Client-Side Privacy:** No user accounts, no login, and no backend database. Bill reference numbers, units, and images are never persisted on a server.
- **Local RAG & Computation:** Bill estimation, tariff math, and regulatory retrieval occur entirely inside the user's browser runtime.

## 6. Official Duplicate Bill Fetching & Exports
- **Official Portals:** Fetch duplicate bills from official PITC DISCO portals and K-Electric using the 14-digit Reference Number or Consumer ID.
- **Print & PDF:** Offer clean, formatted print/save as PDF views without page clutter.
