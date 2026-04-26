# PriceCap — Technical Spec

## Stack

| Layer | Technology | Docs |
|---|---|---|
| Frontend | React (web app) + Vite (build tool) | [react.dev](https://react.dev/) · [vitejs.dev](https://vitejs.dev/) |
| Styling | CSS variables + Share Tech Mono (Google Fonts) | [fonts.google.com/specimen/Share+Tech+Mono](https://fonts.google.com/specimen/Share+Tech+Mono) |
| Barcode scanning | html5-qrcode | [github.com/mebjas/html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| Backend | Python FastAPI | [fastapi.tiangolo.com](https://fastapi.tiangolo.com/) |
| OCR | pytesseract (Python, runs on backend) | [pypi.org/project/pytesseract](https://pypi.org/project/pytesseract/) |
| Product lookup | Open Food Facts API | [openfoodfacts.github.io/openfoodfacts-server/api](https://openfoodfacts.github.io/openfoodfacts-server/api/) |
| Price comparison | SerpAPI Google Shopping UK | [serpapi.com/google-shopping-api](https://serpapi.com/google-shopping-api) |
| Frontend deploy | Vercel (free tier) | [vercel.com/docs](https://vercel.com/docs) |
| Backend deploy | Railway | [docs.railway.app](https://docs.railway.app/) |

**Why this stack:** React gives Ben full-stack web experience with a real HTTP connection between frontend and backend. FastAPI is Python — Ben's home language — and hosts all API keys server-side so they're never exposed in the browser. The app runs in mobile Safari via a URL, no App Store or Mac required.

---

## Runtime & Deployment

- **Runs in:** mobile Safari (iPhone) and any desktop browser
- **Frontend:** deployed to Vercel — every push to GitHub auto-deploys
- **Backend:** deployed to Railway — always-on Python server
- **Local testing:** `npm run dev` (frontend) + `uvicorn main:app --reload` (backend), both on localhost
- **Environment requirements:**
  - Node.js 18+
  - Python 3.11+
  - API keys needed: `SERPAPI_KEY`, `GOOGLE_PLACES_KEY` (stored in `backend/.env`, never committed to GitHub)

---

## Architecture Overview

```
┌─────────────────────────────────┐         ┌──────────────────────────────────┐
│   React Frontend (Vercel)       │  HTTP   │   FastAPI Backend (Railway)      │
│                                 │         │                                  │
│  - All screens & UI             │────────→│  POST /product/{barcode}         │
│  - Barcode scanning             │         │    → Open Food Facts             │
│    (html5-qrcode)               │         │                                  │
│  - Camera image capture         │────────→│  POST /ocr                       │
│  - Matrix aesthetic             │         │    → pytesseract OCR             │
│  - currentScreen state          │────────→│  POST /verdict                   │
│    controls navigation          │         │    → SerpAPI Google Shopping UK  │
│                                 │←────────│                                  │
│                                 │         │  All API keys stored here        │
└─────────────────────────────────┘         └──────────────────────────────────┘
```

**Single-page app:** There are no URLs for individual screens. React holds a `currentScreen` variable in memory that controls what the user sees. The only way to advance is by completing each step — the user cannot skip or jump ahead.

```
currentScreen flow:
'landing' → 'step1' → 'step2' → 'loading' → 'verdict' → 'landing'
                ↑ SCAN AGAIN (also from 'product-not-found')
```

---

## Frontend

### App.jsx — Root Controller

`App.jsx` is the top-level component. It holds three pieces of in-memory state:

| Variable | Type | Set when |
|---|---|---|
| `currentScreen` | string | Any screen transition |
| `barcode` | string | Barcode successfully scanned (Step 1) |
| `productName` | string | Open Food Facts returns product name |
| `scannedPrice` | number | User confirms price (Step 2) |
| `verdictData` | object | FastAPI /verdict returns results |

When the user taps SCAN AGAIN or closes the browser, all state resets to null and `currentScreen` returns to `'landing'`. Nothing is persisted between sessions.

`App.jsx` renders the correct component based on `currentScreen`. All screen components receive state and setter functions as props (data passed down from parent to child).

Implements: `prd.md > App Entry & Onboarding`, navigation logic across all epics.

---

### LandingPage.jsx

**Background:** Matrix binary rain canvas animation (see `MatrixRain` below).

**Elements:**
- £ shield logo (SVG)
- Tagline: "THE SYSTEM DOESN'T WANT YOU TO KNOW" — Share Tech Mono, white
- Primary button: "SCAN BARCODE" — neon green (#00FF41), full-width → sets `currentScreen` to `'step1'`
- Secondary button: "HOW DOES IT WORK?" — outlined → opens `HowItWorksModal`

Implements: `prd.md > App Entry & Onboarding`

---

### HowItWorksModal.jsx

A bottom-sheet popup (slides up from bottom of screen) that overlays the landing screen.

**Content:** 3 swipeable cards. Each card has a step number and 1–2 sentence summary of that step:
- Card 1: Scan the barcode
- Card 2: Scan the shelf price
- Card 3: Get your verdict

Dismiss by swiping down or tapping outside the modal → returns to `LandingPage`.

Implements: `prd.md > App Entry & Onboarding — "HOW DOES IT WORK?" modal`

---

### BarcodeScan.jsx — Step 1

**Background:** Full-screen live camera feed. Green corner-bracket viewfinder overlay. Status pill at bottom: "Scanning automatically..."

**Header:** "STEP 1 OF 2 — SCAN BARCODE"

**Flow:**
1. Component mounts → browser requests camera permission
   - Permission denied → show `ErrorOverlay` (camera required) → OK → `'landing'`
   - Permission granted → `html5-qrcode` starts watching camera feed
2. Barcode detected automatically (no button tap) → barcode number extracted
3. Show loading state: Matrix background dimmed + spinner + "LOADING"
4. `POST /product/{barcode}` sent to FastAPI
   - Success → `{ name: "Product Name" }` → store in `productName`, show green tick + product name → auto-advance to `'step2'` after 1.5s
   - Product not found → show "Product Not Found" card + SCAN AGAIN button → SCAN AGAIN resets and stays on `'step1'`
   - No internet → `ErrorOverlay` → OK → `'landing'`

Implements: `prd.md > Barcode Scanning (Step 1 of 2)`

---

### PriceScan.jsx — Step 2

**Background:** Full-screen live camera feed. Green corner-bracket viewfinder. Status pill: "Scanning automatically..."

**Header:** "STEP 2 OF 2 — SCAN PRICE"

**Back arrow (←):** top-left → returns to `'step1'`

**Flow:**
1. Camera feed shown → user points at shelf price label
2. App auto-captures a frame after detecting a stable image (or user taps a capture button as fallback)
3. Captured image → `POST /ocr` to FastAPI (image sent as file attachment in the request)
4. Show loading state: Matrix background dimmed + spinner + "LOADING"
5. FastAPI runs pytesseract → returns `{ price: 2.49 }`
   - Success → show confirmation card: "£2.49" with ✓ button and ✗ button
     - ✓ → store `scannedPrice`, advance to `'loading'` then `'verdict'`
     - ✗ → open manual entry field
   - OCR fails (no price found) → show "Couldn't read price" + manual entry field opens automatically
6. **Manual entry:** input field with `inputmode="decimal"` (triggers number keyboard on iPhone). User types exact price (e.g. `2.49`). App displays as `£2.49`. Submit → advance to verdict.
7. "Enter price manually" button always visible below viewfinder as permanent fallback.

Implements: `prd.md > Price Scanning (Step 2 of 2)`

---

### VerdictScreen.jsx

**Background:** Matrix rain animation (same as landing screen).

Two tabs: **Verdict** and **Results**. Tab bar sits below the "VERDICT" title header.

At the bottom of the screen on both tabs: **SCAN AGAIN** button (neon green, full-width) → resets all state → `'landing'`.

Implements: `prd.md > Verdict & Results`

---

### VerdictTab.jsx

Rendered inside `VerdictScreen` when Verdict tab is active.

**Verdict badge — three states:**

| Verdict | Condition | Shape | Colour |
|---|---|---|---|
| FAIR | scanned price ≤ average, or within 5% above | Shield (matches £ logo) | Neon green (#00FF41) |
| ABOVE MARKET | 5–25% above average | Road warning triangle | Yellow/amber |
| OVERPRICED | >25% above average | Alarm bell | Red (#ff3333) |

Badge animation: pop-in on screen load (CSS `transform: scale` from 0 to 1, ~300ms, slight overshoot for bounce feel).

**Suggestion bubbles** (shown for ABOVE MARKET and OVERPRICED only):
- Up to 2 bubbles — show however many exist (1 or 2, never 0 if data exists)
- Style: iMessage-style left-aligned bubbles, lighter shade of dark gray against Matrix background, rounded corners
- Template: `"[Retailer] has this for £X less"`
- Source: populated from `verdictData.suggestions` returned by FastAPI

**FAIR state:** no suggestion bubbles — show message: "You're getting a good deal!"

**No SerpAPI data:** show "No price data found" card instead of badge and bubbles.

Implements: `prd.md > Verdict & Results — verdict tab`

---

### ResultsTab.jsx

Rendered inside `VerdictScreen` when Results tab is active.

**Retailer price table:**
- Each row: retailer name | price (e.g. `Tesco £1.99`)
- Data source: `verdictData.retailer_prices` array from FastAPI
- Scanned price shown as a highlighted row at top: `You paid £2.49`

**Price range meter:**
- Horizontal bar spanning full screen width
- Colour gradient: green (left, cheapest) → yellow (middle) → red (right, most expensive)
- Left label: lowest retailer price. Right label: highest retailer price.
- Scanned price marked as a vertical white line on the bar at the proportional position
- Small label above the line: `£[scanned price]`

Implements: `prd.md > Verdict & Results — results tab`

---

### ErrorOverlay.jsx

Reusable popup component used for two error types:

| Error | Message | Button |
|---|---|---|
| No internet | "No internet connection" | OK → `'landing'` |
| Camera permission denied | "Camera access is required to use PriceCap" | OK → `'landing'` |

Styled as a centered modal overlay on top of whichever screen triggered it.

Implements: `prd.md > Error States`

---

### MatrixRain (canvas animation)

A React component wrapping an HTML `<canvas>` element. Renders falling binary characters in neon green on near-black. Used as background on LandingPage and VerdictScreen. Not rendered on scan screens (camera feed replaces it).

---

### index.css — Global Theme

Single source of truth for all visual design tokens:

```css
:root {
  --bg-color: #0a0a0a;
  --accent-green: #00FF41;
  --font-main: 'Share Tech Mono', monospace;
  --color-fair: #00FF41;
  --color-above-market: #FFA500;
  --color-overpriced: #FF3333;
  --bubble-bg: #2a2a2a;
}
```

Font loaded via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
```

Changing any value here updates every component instantly.

---

## Backend

### main.py — FastAPI App

Entry point. Defines all three endpoints. Handles CORS (cross-origin requests) — this config is required so the React app on Vercel can talk to the FastAPI app on Railway without being blocked.

```python
from fastapi.middleware.cors import CORSMiddleware
# Allow requests from the Vercel frontend domain
```

**Rate limiting:** uses `slowapi` middleware — limits each IP address to 20 requests per minute. Prevents abuse and runaway API costs.

```
pip install slowapi
```

Docs: [slowapi on PyPI](https://pypi.org/project/slowapi/)

---

### Endpoints

#### POST /product/{barcode}

Called by: `BarcodeScan.jsx` after barcode detected.

```
Request:  POST /product/5000169105017
Response: { "name": "Heinz Baked Beans 415g" }
          { "error": "not_found" }  ← if barcode not in Open Food Facts
```

Delegates to: `services/openfoodfacts.py`

---

#### POST /ocr

Called by: `PriceScan.jsx` after image captured.

```
Request:  POST /ocr
          Body: multipart/form-data — image file attached
Response: { "price": 2.49 }
          { "error": "no_price_detected" }  ← if pytesseract finds no number
```

Delegates to: `services/ocr.py`. pytesseract reads the image, extracts any text matching a price pattern (digits + optional decimal point), returns the first match as a float.

---

#### POST /verdict

Called by: `PriceScan.jsx` after user confirms price.

```
Request:  POST /verdict
          Body: {
            "barcode": "5000169105017",
            "product_name": "Heinz Baked Beans 415g",
            "scanned_price": 2.49
          }

Response: {
  "verdict": "ABOVE_MARKET",
  "scanned_price": 2.49,
  "average_price": 2.10,
  "retailer_prices": [
    { "name": "Tesco", "price": 1.99 },
    { "name": "Sainsbury's", "price": 2.19 },
    { "name": "ASDA", "price": 1.89 }
  ],
  "suggestions": [
    "ASDA has this for £0.60 less",
    "Tesco has this for £0.50 less"
  ]
}
```

**Verdict logic (server-side):**
```
average = mean of all retailer_prices
diff_pct = (scanned_price - average) / average * 100

if diff_pct <= 5:   verdict = "FAIR"
if diff_pct 5–25:  verdict = "ABOVE_MARKET"
if diff_pct > 25:  verdict = "OVERPRICED"
```

**Suggestion logic:** filter retailers where `price < scanned_price`, sort by cheapest, take top 2, format as template strings.

Delegates to: `services/serpapi.py`

---

### services/openfoodfacts.py

Calls Open Food Facts API. Free, no API key required.

```
GET https://world.openfoodfacts.net/api/v2/product/{barcode}
```

Extracts `product.product_name` from response. Returns `None` if not found.

Docs: [openfoodfacts.github.io/openfoodfacts-server/api](https://openfoodfacts.github.io/openfoodfacts-server/api/)

---

### services/serpapi.py

Calls SerpAPI Google Shopping UK endpoint.

```
GET https://serpapi.com/search
Params:
  engine=google_shopping
  q={product_name}
  gl=uk
  google_domain=google.co.uk
  api_key={SERPAPI_KEY}
```

Parses response to extract retailer names and prices. Returns list of `{ name, price }` objects.

Docs: [serpapi.com/google-shopping-api](https://serpapi.com/google-shopping-api)

**Cost note:** SerpAPI charges per search. Set a monthly spending cap in the SerpAPI dashboard before going live. Rate limiting in `main.py` provides a second layer of protection.

---

### services/ocr.py

Uses pytesseract (Python wrapper for Tesseract OCR engine).

```python
import pytesseract
from PIL import Image

def extract_price(image_bytes):
    img = Image.open(image_bytes)
    text = pytesseract.image_to_string(img)
    # regex to find first price pattern: optional £, digits, optional .digits
    # returns float or None
```

Tesseract must be installed on the Railway server (added to Railway build config). Docs: [pypi.org/project/pytesseract](https://pypi.org/project/pytesseract/)

---

### backend/.env

Stores all API keys. **Never committed to GitHub.** Add `.env` to `.gitignore`.

```
SERPAPI_KEY=your_key_here
```

Loaded in FastAPI via `python-dotenv`:
```python
from dotenv import load_dotenv
load_dotenv()
```

---

## App State Model

All state lives in React memory (in `App.jsx`). Nothing is written to disk or browser storage. Lost when the browser tab closes.

| State variable | Type | Lifecycle |
|---|---|---|
| `currentScreen` | string | Entire session |
| `barcode` | string | Set at Step 1, cleared on SCAN AGAIN |
| `productName` | string | Set at Step 1, cleared on SCAN AGAIN |
| `scannedPrice` | number | Set at Step 2, cleared on SCAN AGAIN |
| `verdictData` | object | Set after /verdict call, cleared on SCAN AGAIN |

---

## File Structure

```
pricecap/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx      # Landing screen — Matrix bg, logo, CTAs
│   │   │   ├── HowItWorksModal.jsx  # Bottom-sheet popup — 3 step cards
│   │   │   ├── MatrixRain.jsx       # Canvas animation — reused on landing + verdict
│   │   │   ├── BarcodeScan.jsx      # Step 1 — camera + html5-qrcode + product lookup
│   │   │   ├── PriceScan.jsx        # Step 2 — camera capture + OCR + manual entry
│   │   │   ├── VerdictScreen.jsx    # Verdict screen shell — tabs + SCAN AGAIN button
│   │   │   ├── VerdictTab.jsx       # Verdict tab — badge + suggestion bubbles
│   │   │   ├── ResultsTab.jsx       # Results tab — retailer table + price meter
│   │   │   └── ErrorOverlay.jsx     # Reusable popup — no internet / camera denied
│   │   ├── App.jsx                  # Root — holds all state, controls currentScreen
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global theme — CSS variables, font, base styles
│   ├── index.html                   # Google Fonts link lives here
│   └── package.json                 # Frontend dependencies
│
├── backend/
│   ├── main.py                      # FastAPI app — endpoints, CORS, rate limiting
│   ├── services/
│   │   ├── openfoodfacts.py         # Open Food Facts barcode lookup
│   │   ├── serpapi.py               # SerpAPI Google Shopping UK price comparison
│   │   └── ocr.py                   # pytesseract shelf price OCR
│   ├── requirements.txt             # Python dependencies (fastapi, pytesseract, etc.)
│   └── .env                         # API keys — never commit this file
│
├── docs/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md                      # This document
└── process-notes.md
```

---

## Key Technical Decisions

**1. Web app instead of native iOS**
Decided to build a React web app rather than a React Native iOS app. Reason: Ben doesn't have a Mac, and native iOS requires Xcode on macOS. Web app runs in mobile Safari via a URL — shareable, no App Store, no $99/year. Tradeoff accepted: slightly less "native" feel in the camera flow, but all required features (barcode scan, image capture, OCR) work in mobile Safari.

**2. OCR on the FastAPI backend, not in the browser**
Two options were available: Tesseract.js (runs in browser) or pytesseract (runs on server). Chose the backend approach. Reason: sends a real image from React to FastAPI over HTTP — this is exactly the kind of full-stack HTTP connection Ben wants to learn. Also more accurate than the browser version. Tradeoff: requires a round-trip to the server (adds ~1–2 seconds).

**3. Google Places dropped**
Originally planned to include "Y mins away" in suggestion bubbles using Google Places API. Dropped because: SerpAPI already returns retailer names with prices; adding location data requires GPS permission and API costs with no free tier. Suggestion template simplified to `"[Retailer] has this for £X less"`. Cleaner UX, no extra permission prompt.

---

## Dependencies & External Services

| Service | Purpose | Cost | Docs |
|---|---|---|---|
| Open Food Facts | Barcode → product name | Free, no key | [docs](https://openfoodfacts.github.io/openfoodfacts-server/api/) |
| SerpAPI | Google Shopping UK prices | Paid — set monthly cap | [docs](https://serpapi.com/google-shopping-api) · [pricing](https://serpapi.com/pricing) |
| pytesseract | OCR on backend | Free (open source) | [docs](https://pypi.org/project/pytesseract/) |
| html5-qrcode | Barcode scanning in browser | Free (open source) | [docs](https://github.com/mebjas/html5-qrcode) |
| Share Tech Mono | App font | Free (Google Fonts) | [font](https://fonts.google.com/specimen/Share+Tech+Mono) |
| Vercel | Frontend hosting | Free tier | [docs](https://vercel.com/docs) |
| Railway | Backend hosting | Free tier (limited) | [docs](https://docs.railway.app/) |
| slowapi | FastAPI rate limiting | Free (open source) | [docs](https://pypi.org/project/slowapi/) |

---

## Open Issues

**1. CORS configuration is critical and easy to get wrong.**
The React frontend (on Vercel) and FastAPI backend (on Railway) are on different domains. FastAPI must explicitly allow requests from the Vercel domain or all API calls will fail silently in the browser. This must be the first thing verified when deploying. See: [FastAPI CORS docs](https://fastapi.tiangolo.com/tutorial/cors/).

**2. pytesseract accuracy on real shelf price labels.**
Tesseract OCR performs well on clean, high-contrast images but may struggle with small text, unusual supermarket label fonts, or poor lighting. The manual entry fallback (always visible on Step 2) is the safety net. If OCR accuracy proves too low during testing, consider switching to Google Cloud Vision API via the backend for higher accuracy.

**3. SerpAPI UK retailer coverage varies by product.**
Some products — especially own-brand or regional items — may return few or no UK retailer results. The "No price data found" error state on the Verdict screen handles this gracefully, but it's worth testing with a range of real UK product barcodes early in the build.
