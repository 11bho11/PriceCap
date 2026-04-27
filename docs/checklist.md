# Build Checklist

## Build Preferences

- **Build mode:** Step-by-step
- **Comprehension checks:** Yes — a quick question after each step to make sure the pieces make sense
- **Git:** Commit after each item with message: "Complete step N: [title]"
- **Verification:** Yes — after each item, run the app and confirm what you see before moving on
- **Check-in cadence:** Learning-driven — more discussion during the build, explain why things are wired together the way they are

---

## Checklist

- [x] **1. Full-stack project scaffold**
  Spec ref: `spec.md > File Structure` + `spec.md > Runtime & Deployment`
  What to build: Create the full folder structure (`pricecap/frontend/` and `pricecap/backend/`). Initialise the React/Vite frontend (`npm create vite@latest`). Initialise the FastAPI backend (`main.py`, `requirements.txt` with fastapi and uvicorn). Add a single test endpoint `GET /ping` that returns `{ "status": "ok" }`. Wire the frontend to call `/ping` on load and log the response to the browser console. Add `.gitignore` (node_modules, .env, __pycache__, venv).
  Acceptance: Running `npm run dev` starts the frontend. Running `uvicorn main:app --reload` starts the backend. Opening the browser and checking the console shows the `/ping` response logged — proof the two servers are connected over HTTP.
  Verify: Start both dev servers. Open the browser at localhost:5173 (or whatever Vite assigns). Open browser DevTools → Console tab. Confirm you see `{ status: "ok" }` logged.

- [x] **2. Global theme + App.jsx navigation shell**
  Spec ref: `spec.md > Frontend > index.css — Global Theme` + `spec.md > Frontend > App.jsx — Root Controller`
  What to build: Write `index.css` with all CSS variables (`--bg-color`, `--accent-green`, `--font-main`, `--color-fair`, `--color-above-market`, `--color-overpriced`, `--bubble-bg`). Add the Google Fonts `<link>` for Share Tech Mono in `index.html`. Write `App.jsx` with all five state variables (`currentScreen`, `barcode`, `productName`, `scannedPrice`, `verdictData`) and a `currentScreen` switch that renders placeholder `<div>` stubs for each screen: `landing`, `step1`, `step2`, `loading`, `verdict`. Each stub should display the screen name in white Share Tech Mono text on the dark background so you can confirm navigation works.
  Acceptance: The app loads with a dark background and Share Tech Mono font visible. Manually changing `currentScreen`'s initial value in the code switches which stub div is shown. All five state variables exist in App.jsx.
  Verify: Run `npm run dev`. Confirm dark background (#0a0a0a) and Share Tech Mono font load. Temporarily change `useState('landing')` to `useState('step1')` — confirm the step1 stub renders. Change it back.

- [x] **3. LandingPage + MatrixRain + HowItWorksModal**
  Spec ref: `spec.md > Frontend > LandingPage.jsx` + `spec.md > Frontend > MatrixRain` + `spec.md > Frontend > HowItWorksModal.jsx`
  What to build: Build `MatrixRain.jsx` — a `<canvas>` component rendering falling binary characters in neon green (#00FF41) on near-black. Build `LandingPage.jsx` — Matrix rain background, £ shield SVG logo, tagline "THE SYSTEM DOESN'T WANT YOU TO KNOW" in Share Tech Mono white, "SCAN BARCODE" primary button (neon green, full-width) that sets `currentScreen` to `'step1'`, and "HOW DOES IT WORK?" outlined secondary button that opens `HowItWorksModal`. Build `HowItWorksModal.jsx` — bottom-sheet that slides up from the bottom of the screen, containing 3 cards (Step 1: scan barcode, Step 2: scan shelf price, Step 3: get verdict). Dismiss by tapping outside or swiping down.
  Acceptance: Landing screen shows Matrix rain animation, £ shield logo, tagline, and both buttons. Tapping "HOW DOES IT WORK?" slides up the modal with 3 cards. Tapping outside or swiping down dismisses it. Tapping "SCAN BARCODE" switches the screen to the step1 stub.
  Verify: Run `npm run dev`. Confirm Matrix rain animates. Tap "HOW DOES IT WORK?" — modal slides up. Dismiss it. Tap "SCAN BARCODE" — screen switches (step1 stub visible).

- [x] **4. FastAPI backbone: CORS, endpoint stubs, rate limiting, .env**
  Spec ref: `spec.md > Backend > main.py — FastAPI App` + `spec.md > Backend > backend/.env`
  What to build: Update `main.py` with: CORS middleware configured to allow requests from `http://localhost:5173` (and later the Vercel domain). Stub out all three endpoints — `POST /product/{barcode}`, `POST /ocr`, `POST /verdict` — each returning a hardcoded placeholder response for now. Add `slowapi` rate limiting (20 requests per minute per IP). Add `python-dotenv` and load `.env`. Create `backend/.env` with a placeholder `SERPAPI_KEY=your_key_here`. Update `requirements.txt` with all dependencies (fastapi, uvicorn, slowapi, python-dotenv, pytesseract, pillow, httpx).
  Acceptance: FastAPI server starts with no errors. All three endpoints respond with placeholder JSON when called. CORS is configured. Rate limiting middleware is active. `.env` is loaded and `.gitignore` covers it.
  Verify: Run `uvicorn main:app --reload`. Open `http://localhost:8000/docs` — confirm all three endpoints appear in the FastAPI auto-generated docs. Test each stub endpoint from the docs UI and confirm placeholder responses return.

- [x] **5. Open Food Facts service + `/product/{barcode}` endpoint**
  Spec ref: `spec.md > Backend > services/openfoodfacts.py` + `spec.md > Backend > Endpoints > POST /product/{barcode}`
  What to build: Create `services/openfoodfacts.py`. It calls `GET https://world.openfoodfacts.net/api/v2/product/{barcode}`, extracts `product.product_name` from the response, and returns the name or `None` if not found. Update the `/product/{barcode}` endpoint in `main.py` to call this service and return `{ "name": "..." }` on success or `{ "error": "not_found" }` if the product isn't in the database.
  Acceptance: Calling `POST /product/5000169105017` (Heinz Baked Beans barcode) returns `{ "name": "Heinz Baked Beans 415g" }` or similar. Calling with a fake barcode (e.g. `0000000000000`) returns `{ "error": "not_found" }`.
  Verify: With the FastAPI server running, open `http://localhost:8000/docs`. Call `/product/5000169105017` — confirm a product name comes back. Call `/product/0000000000000` — confirm `not_found` error returns.

- [x] **6. BarcodeScan.jsx — camera, html5-qrcode, loading + success + error states**
  Spec ref: `spec.md > Frontend > BarcodeScan.jsx — Step 1`
  What to build: Build `BarcodeScan.jsx`. On mount, request camera permission and start `html5-qrcode` watching the camera feed. Show a full-screen camera feed with green corner-bracket viewfinder overlay and "Scanning automatically..." status pill. On barcode detected: dim the camera feed, show spinner + "LOADING" text, call `POST /product/{barcode}`. On API success: show green tick + product name, auto-advance to `'step2'` after 1.5 seconds. On product not found: show "Product Not Found" card with SCAN AGAIN button (stays on step1). On camera permission denied: show `ErrorOverlay` (build a placeholder version for now). On no internet: show `ErrorOverlay`. Wire `BarcodeScan` into `App.jsx` so it renders when `currentScreen === 'step1'`.
  Acceptance: Tapping SCAN BARCODE from the landing screen opens the camera. Pointing at a real product barcode auto-detects it, shows the loading state, then shows the product name. Auto-advances to step2 stub. A product not found shows the error card.
  Verify: Run both dev servers. Open the app on your phone (or browser). Tap SCAN BARCODE. Point camera at a product — confirm auto-scan, loading spinner, product name, then step2 stub appears. Test with an obscure product to trigger the "not found" state.

- [x] **7. pytesseract OCR service + `/ocr` endpoint**
  Spec ref: `spec.md > Backend > services/ocr.py` + `spec.md > Backend > Endpoints > POST /ocr`
  What to build: Install Tesseract OCR on your machine (required for pytesseract to work locally — follow the pytesseract docs for Windows install). Create `services/ocr.py`: accepts image bytes, runs `pytesseract.image_to_string()`, uses a regex to find the first price pattern (optional £, digits, optional decimal + digits), returns the price as a float or `None` if nothing found. Update the `/ocr` endpoint in `main.py` to accept a multipart file upload, pass the image to `ocr.py`, and return `{ "price": 2.49 }` or `{ "error": "no_price_detected" }`.
  Acceptance: Posting a photo of a price label to `/ocr` returns `{ "price": X.XX }`. Posting a blank image or a photo with no numbers returns `{ "error": "no_price_detected" }`.
  Verify: In FastAPI docs at `localhost:8000/docs`, use the `/ocr` endpoint. Upload a photo of a price label (a price sticker or a photo of your phone screen showing a price). Confirm the price comes back as a number. Upload a blank image — confirm the error response.

- [x] **8. PriceScan.jsx — camera capture, OCR flow, confirmation card, manual entry**
  Spec ref: `spec.md > Frontend > PriceScan.jsx — Step 2`
  What to build: Build `PriceScan.jsx`. Show full-screen camera feed with green corner-bracket viewfinder. Header: "STEP 2 OF 2 — SCAN PRICE". Back arrow (←) at top left returns to `'step1'`. "Enter price manually" button always visible below viewfinder. Auto-capture a frame and send to `POST /ocr`. Show loading state (dimmed Matrix background + spinner + "LOADING") while OCR runs. On success: show confirmation card with detected price (e.g. "£2.49"), ✓ button (store `scannedPrice`, advance to `'loading'` then `'verdict'`), ✗ button (open manual entry field). On OCR failure: show "Couldn't read price" message and open manual entry field automatically. Manual entry: `<input inputmode="decimal">` that accepts a number and formats it as £X.XX on submit, then advances to verdict. Wire `PriceScan` into `App.jsx`.
  Acceptance: Step 2 screen opens after Step 1 completes. Camera shows with viewfinder. OCR runs and shows price confirmation card. Tapping ✓ advances. Tapping ✗ opens manual entry. Manual entry works and advances. Back arrow returns to Step 1.
  Verify: Run the full flow from landing → Step 1 → Step 2. Point camera at a price label — confirm OCR confirmation card appears. Tap ✗ — confirm manual entry field opens. Type a price and submit — confirm screen advances (verdict stub shows).

- [x] **9. SerpAPI service + `/verdict` endpoint + verdict logic**
  Spec ref: `spec.md > Backend > services/serpapi.py` + `spec.md > Backend > Endpoints > POST /verdict`
  What to build: Create `services/serpapi.py`: calls SerpAPI Google Shopping UK with `engine=google_shopping`, `gl=uk`, `google_domain=google.co.uk`, parses retailer names and prices from the response, returns a list of `{ name, price }` objects. Update `/verdict` endpoint: accepts `{ barcode, product_name, scanned_price }`, calls serpapi.py, computes `average` of all retailer prices, computes `diff_pct`, applies verdict logic (≤5% → FAIR, 5–25% → ABOVE_MARKET, >25% → OVERPRICED), builds suggestion list (retailers cheaper than scanned price, top 2, formatted as "[Retailer] has this for £X less"), returns the full verdict response object. Handle no-data case (SerpAPI returns no UK results) — return `{ "error": "no_price_data" }`. Set up your real `SERPAPI_KEY` in `backend/.env`.
  Acceptance: Calling `/verdict` with a real product name and price returns a full verdict object with verdict string, retailer prices array, average price, and suggestions. Passing a price below average returns FAIR. Passing a price 30% above average returns OVERPRICED.
  Verify: In FastAPI docs, call `/verdict` with `{ "barcode": "5000169105017", "product_name": "Heinz Baked Beans 415g", "scanned_price": 3.99 }`. Confirm a verdict, retailer list, and suggestions come back. Try `scanned_price: 0.50` — confirm FAIR verdict.

- [x] **10. VerdictScreen + VerdictTab — badge, suggestion bubbles, SCAN AGAIN**
  Spec ref: `spec.md > Frontend > VerdictScreen.jsx` + `spec.md > Frontend > VerdictTab.jsx`
  What to build: Build `VerdictScreen.jsx` — Matrix rain background, "VERDICT" title header, two-tab bar (Verdict / Results), SCAN AGAIN button at bottom (neon green, full-width) that resets all state and returns to `'landing'`. Build `VerdictTab.jsx` — reads `verdictData` from props. Renders one of three badge states: FAIR (shield shape, neon green, "You're getting a good deal!" message), ABOVE MARKET (warning triangle, orange), OVERPRICED (alarm bell, red). Badge animates in with a CSS pop (scale 0→1, ~300ms, slight bounce overshoot). ABOVE MARKET and OVERPRICED show up to 2 iMessage-style suggestion bubbles from `verdictData.suggestions`. No SerpAPI data → "No price data found" card. Wire `VerdictScreen` into `App.jsx` for `currentScreen === 'verdict'`.
  Acceptance: After confirming a price in Step 2, the Verdict screen appears with Matrix rain background. The correct badge (FAIR/ABOVE MARKET/OVERPRICED) displays with the pop animation. Suggestion bubbles appear for non-FAIR verdicts. SCAN AGAIN resets everything and returns to landing.
  Verify: Run the full flow end-to-end: landing → barcode scan → price scan → verdict. Confirm correct badge, animation, and suggestions. Tap SCAN AGAIN — confirm you're back on the landing screen with all state cleared.

- [x] **11. ResultsTab + ErrorOverlay**
  Spec ref: `spec.md > Frontend > ResultsTab.jsx` + `spec.md > Frontend > ErrorOverlay.jsx`
  What to build: Build `ResultsTab.jsx` — retailer price table (each row: retailer name + price, "You paid £X.XX" as highlighted top row), price range meter (horizontal gradient bar green→yellow→red, left label = lowest price, right label = highest price, white vertical line at the scanned price's proportional position with a small label above it). Wire into `VerdictScreen`'s Results tab. Build `ErrorOverlay.jsx` — reusable centered modal overlay with two states: "No internet connection" (OK → landing) and "Camera access is required to use PriceCap" (OK → landing). Replace the placeholder ErrorOverlay in BarcodeScan.jsx and PriceScan.jsx with the real component.
  Acceptance: Tapping the Results tab on the Verdict screen shows the retailer table and price meter with the scanned price marked. The price meter marker is in the correct proportional position. Both error overlays appear on the correct trigger conditions and dismiss to the landing screen.
  Verify: Complete a full scan flow — on the Verdict screen, tap Results tab. Confirm retailer table and price meter render correctly with the scanned price marked. Test error states: deny camera permission → confirm camera error overlay appears. (Simulate no internet by turning off wifi — confirm no internet overlay appears when a scan fires.)

- [x] **12. Deploy to Vercel (frontend) + Railway (backend)**
  Spec ref: `spec.md > Runtime & Deployment`
  What to build: Create a GitHub repo and push the full project. Deploy the frontend to Vercel — connect GitHub repo, set root directory to `frontend/`, deploy. Deploy the backend to Railway — connect GitHub repo, set root to `backend/`, add `SERPAPI_KEY` as an environment variable in Railway's settings, configure Tesseract install in the Railway build. Update CORS in `main.py` to allow the live Vercel domain (not just localhost). Update the frontend API base URL to point at the Railway backend URL instead of localhost. Push and confirm both deployments go live. Test the full scan flow on real mobile Safari using the Vercel URL.
  Acceptance: The app loads at the Vercel URL in mobile Safari. A full scan flow (barcode → price → verdict) completes successfully end-to-end using the live backend. CORS is not blocking any requests.
  Verify: Open the Vercel URL on your iPhone. Run a complete scan: scan a real product barcode, scan or manually enter a shelf price, confirm a verdict appears. Open browser DevTools (via Safari on Mac) and check the console — no CORS errors or failed requests.

- [ ] **13. Submit your project to Devpost**
  Spec ref: `prd.md > What We're Building` (the core submission story)
  What to build: Create a GitHub repo if not already done and push all code. Take screenshots of the working app: landing screen, Step 1 scan screen, Step 2 scan screen, and the verdict screen (ideally all three verdict states). Log in to Devpost and start a submission. Project name: PriceCap. Tagline: "THE SYSTEM DOESN'T WANT YOU TO KNOW". Write the project description using the surge pricing / electronic shelf labels narrative from `docs/scope.md` — explain what you built, why it matters, and how it works. Add built-with tags: React, Vite, Python, FastAPI, pytesseract, html5-qrcode, Open Food Facts API, SerpAPI. Upload screenshots. Upload the `docs/` folder artifacts (scope, PRD, spec, checklist) as supporting materials. Link the GitHub repo. Optionally link the live Vercel URL so judges can try it. Review and submit.
  Acceptance: Submission is live on Devpost with project name, tagline, description, built-with tags, screenshots, repo link, and all required fields complete.
  Verify: Open your Devpost submission page. Confirm the green "Submitted" badge appears. Read the project description — would someone who knows nothing about PriceCap understand what it does and why it matters from your description alone?
