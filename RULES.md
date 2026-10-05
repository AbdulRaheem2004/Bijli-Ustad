# Bijli Bill Explainer - Project Rules

These rules govern the development, design, and deployment of the **Bijli Bill Explainer** app. This project targets Pakistani households to demystify complex electricity bills.

## 1. Quality & Codebase Management
- **GASP Writing & AI Slop:** Zero tolerance for generic AI fluff. All copy must be sharp, purposeful, and direct. UI text must feel human-crafted, not machine-generated.
- **Impeccable Skill:** Execute UI with "GPT-taste." Avoid the generic "utility app Bootstrap" look. The design must be modern, clean, and highly polished.
- **Graphify:** Use graphify for maintaining codebase context and mapping relationships between components, tariff configurations, and test suites. Run graphify commands frequently during development.

## 2. Public App Requirements
- **SEO & Open Graph:** Fully optimized for search engines. Must include a compelling Open Graph preview card (e.g., showing a clear bill breakdown) for social sharing on WhatsApp, Facebook, and X.
- **Favicon:** Proper, recognizable favicon required.
- **Performance:** Fast load times are critical. Target LCP < 2s.
- **Mobile-First:** 90% of the target audience uses Android phones. Design exclusively for mobile first, then scale up gracefully.

## 3. Pakistani Household Audience UX
- **Language:** Extremely simple language. Avoid technical jargon where possible.
- **Roman Urdu & Urdu:** First-class support for both Roman Urdu and proper Urdu labels/explanations.
- **Nastaliq Font Stack:** Urdu/RTL text rendering MUST use a proper Nastaliq font stack (e.g., Jameel Noori Nastaleeq, Google Noto Nastaliq Urdu) for readability and cultural familiarity.
- **Tech Literacy:** Assume the user has never used a calculator app. Interactions must be painfully obvious.
- **Ergonomics:** Big tap targets (thumb-friendly, min 44x44px).
- **Dark Mode:** Required. Saves battery on AMOLED phones which are prevalent in Pakistan.
- **Connectivity:** Must work seamlessly on slow 3G networks.

## 4. Data Integrity
- **NEPRA Alignment:** NEPRA tariff schedules must be cited in the source or UI where appropriate.
- **Updatability:** FPA (Fuel Price Adjustment) and QTA (Quarterly Tariff Adjustment) values fluctuate. These MUST be stored in a single, easily updatable config JSON file (`tariffs.json`).
- **Verifiability:** Bill calculation logic must be strictly verifiable against official DISCO duplicate bills.

## 5. Privacy-First
- **No Server Storage:** Bill photos are NEVER stored server-side. Pure client-side privacy.
- **Opt-in Cloud API:** The Gemini API call (Vision OCR) is optional. The user must be able to choose a local-only (manual entry) mode.
- **Transparency:** Clear privacy notice in simple Urdu explaining that data never leaves their device (or only goes securely to Google for OCR and is immediately discarded).

## 6. Accessibility & Compliance
- **WCAG 2.1 AA:** Strict adherence to accessibility guidelines.
- **Budget:** $0 budget strictly enforced. Use Vercel/GitHub Pages for hosting, Gemini Free API Vision for OCR, and purely free/open-source tools.
- **No User Accounts:** No login, no backend database. Open access.
