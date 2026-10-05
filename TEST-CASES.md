# Comprehensive Test Plan: Bijli Bill Explainer

Format: `[Test ID] | [Category] | [Priority] | Description -> Expected Output`

## A. Tariff Engine Unit Tests (Core Logic)
- **TE-01** | `Engine` | `P0` | Single-phase protected consumer: 150 units -> Match NEPRA exact rates; ensure no unprotected slab rates apply.
- **TE-02** | `Engine` | `P0` | Single-phase unprotected: 250 units -> Calculate with slab escalation (0-100, 101-200, 201-300 slabs).
- **TE-03** | `Engine` | `P0` | Single-phase heavy: 500 units, 750 units -> Verify correct highest slab jumps and time-of-use if applicable.
- **TE-04** | `Engine` | `P0` | 3-phase domestic: 200 peak + 300 off-peak units -> Separate tariff calculation for peak/off-peak.
- **TE-05** | `Engine` | `P0` | 3-phase commercial: Fixed charges + per-unit with peak/off-peak -> Verify fixed charge application.
- **TE-06** | `Engine` | `P0` | Solar net-metering: 400 import, 350 export -> Net billing calculation (50 units billed).
- **TE-07** | `Engine` | `P0` | Solar net-metering: Export > Import -> Verify credit handling/rollover tracking logic.
- **TE-08** | `Engine` | `P0` | FPA calculation -> Verify FPA amount matches (units × current per-unit FPA rate).
- **TE-09** | `Engine` | `P0` | Taxes & Surcharges -> Validate exact calculation of QTA, FC surcharge, Electricity Duty, GST (17%), and TV Fee (Rs. 35).
- **TE-10** | `Engine` | `P1` | Edge: 0 units -> Minimum charge applies.
- **TE-11** | `Engine` | `P1` | Edge: Exactly 200 units -> Ensure protected boundary holds (if applicable by latest rules).
- **TE-12** | `Engine` | `P1` | Edge: 201 units -> Ensure unprotected trigger applies entirely.
- **TE-13** | `Engine` | `P1` | Cross-DISCO -> Validate that same units across different DISCOs yield correct differing Electricity Duty rates.

## B. Gemini Vision OCR Tests
- **VIS-01** | `Vision` | `P0` | Upload clear LESCO bill -> Extracted units, consumer type, and ref number match bill.
- **VIS-02** | `Vision` | `P0` | Upload K-Electric bill -> Correctly parse different format.
- **VIS-03** | `Vision` | `P1` | Upload blurry/low-quality photo -> Graceful fallback to manual entry mode with friendly error.
- **VIS-04** | `Vision` | `P1` | Upload non-bill image (e.g., cat photo) -> Explicit rejection message ("This doesn't look like an electricity bill").
- **VIS-05** | `Vision` | `P1` | API rate limit hit -> Seamless fallback to manual mode.
- **VIS-06** | `Vision` | `P0` | Network offline -> Disable upload button or immediately trigger local-only manual mode.

## C. UI / UX Tests
- **UI-01** | `UX` | `P0` | Form validation -> Non-numeric units, negative values, absurdly high values (e.g., 50,000) show helpful errors.
- **UI-02** | `UX` | `P0` | Responsive layout -> Verify rendering on 320px, 375px, 768px, 1024px viewports.
- **UI-03** | `UX` | `P0` | RTL Urdu typography -> Text renders correctly RTL and Nastaliq font stack is actively loaded.
- **UI-04** | `UX` | `P1` | Dark mode -> Toggle works and contrasts meet AA standards.
- **UI-05** | `UX` | `P1` | Visualizations -> Pie chart renders with correct proportional wedges for bill breakdown.
- **UI-06** | `UX` | `P2` | Contextual advice -> "How to reduce" changes based on user's slab (e.g., generic vs. peak-hour focus).
- **UI-07** | `UX` | `P0` | Accessibility -> Fully keyboard navigable, screen reader readable.
- **UI-08** | `UX` | `P0` | Touch targets -> All interactive elements ≥ 44x44px.

## D. Privacy Tests
- **PRV-01** | `Privacy` | `P0` | Image handling -> Bill photo blob is destroyed/not persisted after OCR session ends.
- **PRV-02** | `Privacy` | `P0` | Local mode isolation -> No network requests made to any API in local-only mode.
- **PRV-03** | `Privacy` | `P0` | Notice visibility -> Privacy notice clearly visible and readable in Urdu before upload.

## E. Performance Tests
- **PERF-01** | `Perf` | `P0` | LCP -> Largest Contentful Paint < 2s on simulated 3G throttle.
- **PERF-02** | `Perf` | `P1` | Bundle size -> Total JS/CSS bundle < 200KB gzipped (excluding optional WebLLM).
- **PERF-03** | `Perf` | `P0` | Engine speed -> Tariff calculation execution completes in < 50ms.

## F. Cross-Browser Tests
- **XB-01** | `Compat` | `P0` | Chrome Android -> Fully functional.
- **XB-02** | `Compat` | `P0` | Samsung Internet -> Fully functional.
- **XB-03** | `Compat` | `P0` | Safari iOS -> Fully functional.
- **XB-04** | `Compat` | `P1` | Chrome Desktop -> Fully functional (responsive scaling).
