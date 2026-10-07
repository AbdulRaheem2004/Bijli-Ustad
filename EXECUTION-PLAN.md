# Execution Plan: Bijli Bill Explainer & Estimator (Web App)

This document outlines the phased execution for the Bijli Bill Explainer & Estimator project with Local RAG, Credible SRO Ground Truth, Duplicate Bill Portal, and Impeccable Web Design.

## Phase 0: Ground-Truth Data & Tariff Engine
- Build `tariffs.json` containing official rates for all major DISCOs (LESCO, K-Electric, IESCO, MEPCO, GEPCO, FESCO, PESCO, HESCO, QESCO, SEPCO).
- Build `tariffs-source-manifest.json` citing exact NEPRA S.R.O. numbers, Gazette notification dates, and Power Division rulings for:
  - Lifeline ($\le 50$ units)
  - Protected slabs (1-100, 101-200) & 6-month historical rule
  - Unprotected slabs (1-100, 101-200, 201-300, 301-700, 700+)
  - Time-of-Use (Peak vs. Off-Peak)
  - Surcharges (FC Surcharge Rs. 3.23/kWh, FPA, QTA, GST 18%, ED, TV Fee)
  - Solar Net-Metering export/import settlement
- Build pure TypeScript deterministic calculation engine (`calculator.ts`) and what-if simulation engine (`estimator.ts`).
- Write automated unit tests verifying calculations against real duplicate bills.

## Phase 1: Local RAG Knowledge Corpus & Hybrid Retriever
- Create curated regulatory knowledge chunks from official documents:
  - `nepra-csm-disputes.md`: Bill rectification & dispute procedure under NEPRA CSM.
  - `nepra-detection-bills.md`: Legal standards on detection bills and consumer rights.
  - `protected-vs-unprotected-rules.md`: Protected status eligibility and recovery.
  - `fuel-price-adjustments.md`: Section 31(7) FPA calculation mechanics.
  - `solar-net-metering-rules.md`: NEPRA 2015 Net-Metering Regulations.
  - `appliance-energy-guide.md`: Real-world appliance consumption & saving strategies.
- Implement in-memory hybrid retriever (`retriever.ts`) with BM25 lexical + semantic scoring supporting Pakistani English and Roman Urdu.
- Implement conversational customer assistant (`customerChat.ts`) with contextual bill injection.

## Phase 2: Duplicate Bill Fetcher & Multi-Modal Ingestion
- Build `billFetcher.ts` supporting PITC portal (10 DISCOs via 14-digit Reference Number) and K-Electric.
- Build clean, printable `BillPrintView` for viewing and downloading duplicate bills.
- Build client-side PDF/Image ingestion service with zero server uploads.

## Phase 3: Impeccable Web App UI
- Scaffold modern web app with Vite, React, TypeScript, and Tailwind CSS.
- Implement Impeccable design system:
  - Clean Pakistani utility aesthetic (no generic purple/indigo AI slop).
  - High-contrast typography with tabular numerals (`tabular-nums`).
  - Fluid sliders paired with direct numeric input boxes.
  - Real-time slab waterfall and policy threshold warnings.
  - Multi-language toggle (English, Roman Urdu, Nastaliq Urdu).
  - Interactive "Bijli Sahulat" RAG chat drawer.
  - "Inspect Ground Truth" modal showing NEPRA SRO citations.

## Phase 4: Automated Testing & Verification
- Test tariff engine against official duplicate bills.
- Test RAG retrieval accuracy across consumer queries.
- Verify 100% offline functionality and client-side privacy.
