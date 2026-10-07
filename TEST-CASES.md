# Comprehensive Test Plan: Bijli Bill Explainer & Estimator

Format: `[Test ID] | [Category] | [Priority] | Description -> Expected Output`

## A. Tariff & Estimator Engine Tests (Core Deterministic Logic)
- **TE-01** | `Engine` | `P0` | Single-phase protected: 150 units -> Calculate exact protected slab rates; assert no unprotected rates apply.
- **TE-02** | `Engine` | `P0` | Single-phase unprotected: 205 units -> Crossing 200 threshold triggers unprotected calculation across all slabs with cliff penalty warning.
- **TE-03** | `Engine` | `P0` | Lifeline boundary: 50 units -> Match lifeline tariff (Rs. 3.95/unit base).
- **TE-04** | `Engine` | `P0` | 3-Phase TOU: 180 peak + 320 off-peak units -> Separate tariff applied to peak vs off-peak units with fixed kW charges.
- **TE-05** | `Engine` | `P0` | Solar Net-Metering: 400 import, 550 export -> Zero net grid unit charge, 150 units rolled over as credit.
- **TE-06** | `Engine` | `P0` | Tax and surcharge stack -> Verify exact calculation of FC Surcharge (Rs. 3.23/unit), FPA, QTA, Electricity Duty (1.5%), GST (18%), and TV fee (Rs. 35).
- **TE-07** | `Engine` | `P1` | Advance Income Tax -> Bills exceeding Rs. 25,000 calculate Section 235 advance income tax for non-filers.
- **TE-08** | `Engine` | `P1` | Cross-DISCO verification -> Verify distinct rates and provincial duties between LESCO, K-Electric, and IESCO.

## B. Credible Source & SRO Manifest Tests
- **SRO-01** | `Manifest` | `P0` | Manifest completeness -> Every rate in `tariffs.json` has a corresponding entry in `tariffs-source-manifest.json` with SRO number, Gazette date, and source link.
- **SRO-02** | `Manifest` | `P1` | Feed sync & fallback -> If remote CDN feed is unreachable, app gracefully falls back to local offline cache without throwing.

## C. Local RAG Knowledge Retrieval & Chat Tests
- **RAG-01** | `RAG` | `P0` | Query "What is FPA?" -> Retrieves Section 31(7) NEPRA fuel price adjustment clause with statutory basis.
- **RAG-02** | `RAG` | `P0` | Query "Why did my bill jump above 200 units?" -> Retrieves Power Division Protected vs Unprotected 6-month rule.
- **RAG-03** | `RAG` | `P0` | Query "Detection bill rules" in Roman Urdu ("kya meter slow hone pe detection bill dal sakte hain?") -> Retrieves NEPRA CSM Chapter 5 detection bill procedure.
- **RAG-04** | `RAG` | `P1` | Contextual bill injection -> Chatbot answers incorporating the user's active units and estimated bill.

## D. Duplicate Bill Fetcher & Parsing Tests
- **FET-01** | `Fetcher` | `P0` | 14-digit PITC reference number format validation -> Rejects invalid lengths and non-numeric characters.
- **FET-02** | `Fetcher` | `P0` | Duplicate bill parser -> Successfully extracts consumer name, reference number, units, and billing month.
- **FET-03** | `Parser` | `P1` | Local digital PDF ingestion -> Client-side parser extracts billing fields with zero network requests.

## E. UI / UX & Impeccable Standards Tests
- **UI-01** | `UI` | `P0` | Dual input synchronization -> Changing direct numeric input updates slider; moving slider updates numeric input.
- **UI-02** | `UI` | `P0` | Tabular numbers -> All currency and unit values render with tabular numerals (`tabular-nums`) to prevent layout shift.
- **UI-03** | `UI` | `P0` | Responsive layout -> Seamless rendering on both mobile (320px-375px) and desktop (1024px+).
- **UI-04** | `UI` | `P0` | Nastaliq typography -> Urdu text correctly applies Noto Nastaliq Urdu font stack with RTL direction.
- **UI-05** | `UI` | `P1` | Dark mode toggle -> Meets WCAG 2.1 AA contrast requirements ($\ge 4.5:1$).
