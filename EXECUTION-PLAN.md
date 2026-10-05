# Execution Plan: Bijli Bill Explainer

This document outlines the phased execution for the Bijli Bill Explainer project.

**Reminder for all phases:** Run `graphify analyze` after significant architectural changes and `impeccable lint/format` before committing.

## Phase 0: Data & Research (2-3 days)
**Goal:** Establish the ground truth for tariff calculations.
- Collect latest NEPRA tariff schedules for all major DISCOs (LESCO, K-Electric, IESCO, MEPCO, GEPCO, FESCO, PESCO).
- Map out the exact slab structure for:
  - Single-phase domestic (Protected vs. Unprotected)
  - 3-phase domestic/commercial (Peak vs. Off-peak)
  - Solar net-metering (bi-directional meters, import/export rules)
- Collect 5-10 anonymized sample bills for validation testing.
- Build `tariffs.json` containing all base rates, slabs, fixed charges, taxes (GST, ED, TV Fee), and current FPA/QTA rates.
- *Command:* `graphify add data tariffs.json`

## Phase 1: Deterministic Tariff Engine (2-3 days)
**Goal:** Build the core logic for calculating bills accurately.
- Develop a pure TypeScript engine.
- Inputs: `units`, `connection_type`, `disco`, `peak_units`, `off_peak_units`, `solar_export`, `solar_import`.
- Outputs: Complete breakdown object (per-slab cost, FPA, QTA, FC, ED, GST, TV fee, total).
- Write comprehensive unit tests for every DISCO, connection type, and edge case (e.g., protected threshold crossing, net export credits).
- *Command:* `impeccable test engine/`
- *Command:* `graphify link engine tariffs`

## Phase 2: UI + Manual Entry Mode (2 days)
**Goal:** Create the mobile-first frontend.
- Scaffold Vite + React + Tailwind project.
- Build clean, single-page UI optimized for Android devices.
- Implement connection type selector and unit input forms.
- Build animated breakdown visualizations (pie chart, bar chart) for bill components.
- Implement language toggle (English / Roman Urdu / Urdu) with proper Nastaliq font loading.
- Add dynamic "How to reduce" advice panel based on consumption tier.
- *Command:* `graphify map components`

## Phase 3: AI Vision Mode (2-3 days)
**Goal:** Implement automatic bill parsing via photo upload.
- Build photo upload component with camera integration.
- Integrate Gemini 2.5 Flash free tier API for bill OCR.
- Design strict, structured extraction prompts to reliably pull units, consumer type, and reference number.
- Implement graceful fallback to manual entry upon API failure, rate limits, or poor image quality.
- Add clear privacy notice regarding image processing.
- *Command:* `impeccable audit privacy`

## Phase 4: Local/Offline Mode (2 days)
**Goal:** Ensure resilience and offline capability.
- Configure Service Worker and manifest for PWA installation.
- Ensure the offline deterministic engine (manual entry) works completely without internet access.
- *(Stretch Goal)* Evaluate and integrate WebLLM for on-device natural language explanations if it fits within performance budgets.
- *Command:* `graphify tag offline`

## Phase 5: Polish & Public Launch (1-2 days)
**Goal:** Finalize for public release.
- SEO optimization, Open Graph tags, and social sharing card creation.
- Final copy pass for Roman Urdu and Urdu translations.
- Run Lighthouse performance audit (target: < 2s LCP on 3G).
- Deploy to Vercel or GitHub Pages ($0 budget).
- Write comprehensive GitHub README.
- *Command:* `impeccable build production`
