# PriceCap

**THE SYSTEM DOESN'T WANT YOU TO KNOW**

Grocery chains are rolling out electronic shelf labels that enable real-time surge pricing. PriceCap is the consumer counter-move — instant price transparency, no account required, no planning needed. Built for shoppers who want to know if they're being ripped off before they put something in the basket.

A web app for UK shoppers that compares supermarket shelf prices against live retailer data — in-store, in seconds. Scan a barcode, scan the shelf price, get a verdict: **FAIR**, **ABOVE MARKET**, or **OVERPRICED**.

Built for the **VibeJam Spring '26 Hackathon: Escape the Permanent Underclass**

**[Try it live →](https://price-cap.vercel.app/)**

---

## What It Does

1. **Scan the barcode** — camera auto-detects the product barcode and looks it up via Open Food Facts
2. **Scan the shelf price** — camera captures the price label, OCR reads the number (manual entry fallback always available)
3. **Get the verdict** — backend fetches live UK retailer prices via SerpAPI Google Shopping, computes the average, and returns a verdict with cheaper alternatives

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python FastAPI |
| Barcode scanning | ZXing (browser-based) |
| OCR | pytesseract (server-side) |
| Product lookup | Open Food Facts API |
| Price data | SerpAPI Google Shopping UK |
| Frontend deploy | Vercel |
| Backend deploy | Railway |

---

## Technical Architecture

```
┌─────────────────────────────────┐         ┌──────────────────────────────────┐
│   React Frontend (Vercel CDN)   │  HTTP   │   FastAPI Backend (Railway)      │
│                                 │         │                                  │
│  - Single-page app              │────────→│  POST /product/{barcode}         │
│  - currentScreen state machine  │         │    → Open Food Facts             │
│  - ZXing barcode scanning       │         │                                  │
│  - getUserMedia image capture   │────────→│  POST /ocr                       │
│  - Matrix rain canvas animation │         │    → pytesseract OCR             │
│                                 │────────→│  POST /verdict                   │
│                                 │         │    → SerpAPI Google Shopping UK  │
│                                 │←────────│                                  │
└─────────────────────────────────┘         └──────────────────────────────────┘
```

The frontend is a fully static React build served via Vercel's global CDN — no server involved on the frontend side. All business logic, API keys, and external service calls live on the FastAPI backend hosted on Railway.

### Frontend

- **Navigation model:** no URLs, no router. A single `currentScreen` state variable in `App.jsx` controls which component renders. Screens advance linearly: `landing → step1 → step2 → loading → verdict → landing`. The user cannot skip steps.
- **Barcode scanning:** uses `@zxing/browser` with a custom `<video>` element and `playsInline` — required for iOS Safari compatibility. The ZXing reader watches the camera feed continuously and fires on the first detected barcode.
- **OCR capture:** `getUserMedia` opens the rear camera. After 4 seconds (or on manual tap), a frame is drawn to an off-screen `<canvas>` and exported as a JPEG blob via `toBlob()`. The blob is posted to `/ocr` as `multipart/form-data`.
- **State management:** all state (`barcode`, `productName`, `scannedPrice`, `verdictData`) lives in `App.jsx` and is passed down as props. Nothing is persisted — closing the browser tab clears everything.
- **Styling:** pure CSS variables (`index.css`) with no component library. Share Tech Mono (Google Fonts) throughout.

### Backend

- **Framework:** FastAPI with uvicorn. Three endpoints: `/product/{barcode}`, `/ocr`, `/post /verdict`.
- **Rate limiting:** `slowapi` middleware — 20 requests per minute per IP across all endpoints. Protects against runaway SerpAPI costs.
- **CORS:** configured to accept requests from the Vercel domain only (plus localhost for development). Controlled via a `FRONTEND_URL` environment variable on Railway.
- **Open Food Facts (`services/openfoodfacts.py`):** async `httpx` call to the Open Food Facts v2 API. No API key required. Extracts `product_name` from the response. Returns `None` if the barcode isn't in the database.
- **OCR (`services/ocr.py`):** receives image bytes, opens via `PIL` + `io.BytesIO` (no disk writes), runs `pytesseract.image_to_string()`, applies a regex to extract the first price pattern (`£?digits.digits`). Returns a float or `None`. Tesseract is installed as a system package on Railway via `nixpacks.toml`.
- **SerpAPI (`services/serpapi.py`):** queries Google Shopping UK (`engine=google_shopping`, `gl=gb`, `hl=en`, `location=United Kingdom`). Filters results to known major UK retailers (Tesco, Sainsbury's, ASDA, Ocado, Morrisons, Waitrose, etc.) via regex. Caps at 8 results sorted cheapest first.
- **Verdict logic:** `average = mean(retailer_prices)`, `diff_pct = (scanned - average) / average * 100`. Thresholds: ≤5% → FAIR, 5–25% → ABOVE_MARKET, >25% → OVERPRICED. Suggestion strings generated for the top 2 cheaper retailers.
- **Environment:** `SERPAPI_KEY` and `FRONTEND_URL` stored as Railway environment variables. Never committed to the repo.

### Key Technical Decisions

**Web app over native iOS** — no Mac means no Xcode, no App Store. React in mobile Safari covers all required APIs: `getUserMedia`, canvas, ZXing barcode scanning. Shareable via URL.

**OCR on the backend** — two options existed: Tesseract.js (browser) or pytesseract (server). Chose the backend deliberately: it creates a real multipart HTTP upload from React to FastAPI — exactly the kind of full-stack connection worth learning. Also more accurate than the browser version.

**ZXing over html5-qrcode** — html5-qrcode rendered a black screen on iOS Safari because it manages its own `<video>` element without `playsInline`. Switched to `@zxing/browser` with a custom video ref for full control.

**SerpAPI over individual retailer APIs** — aggregates prices from Tesco, Sainsbury's, ASDA, Waitrose, and others in a single call. Individual retailer APIs are either private, rate-limited, or require commercial agreements.

---

## Verdict Logic

| Verdict | Condition | Badge | Colour |
|---|---|---|---|
| FAIR | Scanned price ≤ average, or within 5% above | Shield | Neon green |
| ABOVE MARKET | 5–25% above average | Warning triangle | Orange |
| OVERPRICED | >25% above average | Alarm bell | Red |

ABOVE MARKET and OVERPRICED verdicts include up to 2 suggestion bubbles naming cheaper retailers and the saving amount.

---

## Docs

Full planning and specification artifacts in [`docs/`](./docs/):
- [`scope.md`](./docs/scope.md) — problem framing and feature decisions
- [`prd.md`](./docs/prd.md) — product requirements and user stories
- [`spec.md`](./docs/spec.md) — technical specification
- [`checklist.md`](./docs/checklist.md) — build checklist
