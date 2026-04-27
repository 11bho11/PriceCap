# Process Notes

## /onboard

- **Technical experience:** Intermediate. Python background. Has used AI coding agents before.
- **Learning goals:** Full stack development, web sockets, web connections, webhooks — wants to build with these, not just read about them.
- **Creative sensibility:** Skipped — no signals captured.
- **Prior SDD experience:** Has design sketches for the app — light informal planning habit. New to formal spec-driven development.
- **Energy/style:** Direct, wants to move fast. Skipped optional sections. Engaged and goal-oriented.

## /scope

- **Idea evolution:** Arrived with a clear concept — barcode scan + shelf price scan + verdict. Core vision didn't change; conversation sharpened the data pipeline (SerpAPI over individual retailer APIs), confirmed barcode over camera vision for product ID, and locked OCR for shelf price.
- **Key decisions:** UK market confirmed (£ in logo). React Native + FastAPI backend. SerpAPI Google Shopping for price data. Apple Vision framework for OCR. Google Places + SerpAPI for nearby stores.
- **Pushback received:** Asked "what gets cut for a 3-4 hour build" — learner pushed back, said this is a learning project not time-constrained. Reframed to "what's explicitly not in scope." Learner then gave clear cuts: pre-planning (absolute no), receipt scanning (absolute no), social/accounts/historical (post-MVP).
- **References that resonated:** Surge pricing / digital price tags story from Bankrate — immediately identified as good submission narrative. Design mockups were already developed (landing page + scan page), confirmed barcode approach and two-step flow.
- **Deepening rounds:** 1 round. Surfaced: OCR feasibility (confirmed viable via Apple Vision), tech stack (React Native chosen), nearby stores UX (message bubble shape, lighter tone), suggestion bubble generation (clarified no LLM needed — templated strings).
- **Active shaping:** Learner drove direction strongly. Pushed back on time constraint framing. Raised API cost concern independently. Resolved barcode-vs-vision debate via existing mockup. Questioned LLM dependency for suggestions and correctly identified it as unnecessary for MVP.

## /prd

- **vs scope doc:** Added significant detail across every screen. New additions: "How Does It Work?" modal (3-card carousel), full Step 2 flow (OCR confirmation card with ✓/X, always-available manual entry, back arrow to Step 1), two-tab Verdict screen (Verdict + Results), Results tab with retailer table and price range meter, and comprehensive error state coverage.
- **Verdict naming change:** Learner corrected FAIR/OVERPRICED/INFLATED to FAIR/ABOVE MARKET/OVERPRICED — and swapped colors (red = OVERPRICED, orange = ABOVE MARKET). Drove this themselves.
- **Threshold clarification:** Learner set ABOVE MARKET at +5% and OVERPRICED at +25%, then added that at-or-below average is also FAIR (green) — caught this edge case themselves.
- **"What if" moments that surprised them:** No single "oh I hadn't thought of that" moment — learner was generally anticipatory. The camera permission popup/page question prompted a simplification (learner initially described a new screen, then revised to a simple popup for both camera denial and no internet). OCR complete-failure edge case was new territory.
- **Pushback / strong opinions:** Kept design details tight to existing mockups. Simplified the error state from a dedicated screen to a popup. Added the Results tab independently — this was learner-initiated, not prompted.
- **Deepening rounds:** 1 round chosen. Surfaced: camera permission denial UX (→ popup, not new screen), OCR complete failure path (→ "couldn't read price" + manual entry), back navigation from Step 2 to Step 1 (→ back arrow), no internet state (→ popup, same pattern as camera denial).
- **Active shaping:** Learner drove strongly. Corrected verdict color/name scheme. Added Results tab unprompted. Revised error UX to be simpler than initial suggestion. Confirmed FAIR below-average case as a self-correction after thresholds were set.

## /spec

**Stack decisions:** React web app (not React Native) — no Mac, no App Store needed. FastAPI backend on Railway. Share Tech Mono font. OCR via pytesseract on backend (not browser). Google Places dropped — SerpAPI retailer names sufficient for suggestion bubbles.

**Learner confidence:** Strong on the product vision, UX decisions, and visual identity. Uncertain about technical vocabulary (modal, epic, component, state, CORS) — explained each term as it came up. Engaged and quick once concepts were grounded in plain language.

**Deepening rounds:** 2 rounds. Round 1 surfaced: badge shapes (shield/triangle/alarm bell), screen backgrounds (camera feed on scan screens, Matrix rain elsewhere), verdict loading state, manual price entry keyboard. Round 2 surfaced: SCAN AGAIN placement (verdict + product not found only), price range meter colours (green→yellow→red), suggestion bubble styling, font choice (Share Tech Mono selected), "How Does It Work" card copy deferred to build time.

**Active shaping:** Ben drove key decisions. Challenged the iOS-only assumption and independently proposed the web app pivot. Pushed back on Google Places complexity (cost + GPS permission). Correctly identified SCAN AGAIN placement as a UX issue mid-conversation. Chose Share Tech Mono after seeing options. OCR backend approach chosen specifically to create a real HTTP learning example.

**Build reminders:**
- Explain API cost guardrails before wiring up SerpAPI — spending caps, rate limiting (slowapi), caching
- Ben wants to learn about caching — explain the concept when building FastAPI backend
- CORS must be configured first thing when deploying — easy to miss, will break all API calls silently

## /checklist

**Sequencing decisions:** Scaffold first (nothing works without both servers running and connected). Global theme + App.jsx navigation shell second (unblocks all component work). Landing screen third (simplest screen, no API calls — good warm-up). FastAPI backbone fourth (CORS + stubs + .env infrastructure before any backend feature). Riskiest pieces (html5-qrcode camera, pytesseract OCR) scheduled early (items 6 and 7) so there's time to pivot if they don't behave. SerpAPI + verdict logic in the middle after scanning is confirmed working. Verdict screens after backend is solid. Deploy second-to-last; Devpost final.

**Methodology preferences:** Step-by-step mode. Comprehension checks: yes. Verification: yes (per-item). Git: commit after each step. Check-in cadence: learning-driven (more discussion — Ben wants to understand the full-stack pieces as they come together).

**Items:** 13 items total (12 build + 1 Devpost submission). Estimated total build time: ~4–5 hours at 20-30 minutes per item.

**Learner confidence:** Accepted the proposed sequence without pushback — said he didn't know where to start and found the sequencing logic useful. No strong opinions on item order. Chose step-by-step because he wants to follow along and learn; learning-driven cadence chosen for maximum understanding of React and full-stack HTTP concepts (new territory for him).

**Submission planning:** Minimal engagement — said "doesn't matter, I just want to build." No GitHub repo yet — will be created and pushed as part of the submission step. Devpost item kept simple: screenshots, short description, repo link.

**Deepening rounds:** 0 rounds chosen — Ben wanted to move to the checklist without additional refinement passes.

**Active shaping:** Minimal. Ben accepted the proposed sequence and items without modification. Did not question item order or suggest groupings. Engagement was cooperative but not directive — he was learning the sequencing logic rather than driving it.

## /build

### Step 2: Global theme + App.jsx navigation shell

- **What was built:** `index.html` updated with Share Tech Mono Google Fonts link and "PriceCap" title. `index.css` replaced entirely — Vite defaults removed, PriceCap CSS variables added (`--bg-color`, `--accent-green`, `--font-main`, `--color-fair`, `--color-above-market`, `--color-overpriced`, `--bubble-bg`) plus base resets. `App.jsx` rewritten with all five state variables (`currentScreen`, `barcode`, `productName`, `scannedPrice`, `verdictData`) and a `currentScreen` switch rendering stub divs for all five screens.
- **Verification:** Dark background confirmed. Manually changing `useState('landing')` to `useState('step1')` switched the stub, then changed back — navigation switch confirmed working.
- **Comprehension check:** "App.jsx is the parent" — correct. Ben understood that state lives at the top so it can flow down to children.
- **Issues:** None.
- **Learner engagement:** Clean run, no questions during the build.

### Step 3: LandingPage + MatrixRain + HowItWorksModal

- **What was built:** `MatrixRain.jsx` (canvas animation, requestAnimationFrame, 0/1 binary rain in #00FF41 with fade trail). `LandingPage.jsx` (Matrix rain background, £ shield SVG, tagline, SCAN BARCODE button wired to `onScanBarcode` prop, outlined HOW DOES IT WORK? button). `HowItWorksModal.jsx` (bottom-sheet, CSS slideUp animation, 3 step cards with green left-border, tap-outside + swipe-down dismiss). `App.jsx` updated to render `<LandingPage>` for the landing case.
- **Verification:** Confirmed working — Matrix rain animating, logo and tagline visible, modal slides up and dismisses, SCAN BARCODE navigates to step1 stub.
- **Comprehension check:** "In LandingPage.jsx, the SCAN BARCODE button calls onScanBarcode — where does that function actually come from?" → answered correctly: App.jsx passes it as a prop.
- **Design question raised:** Ben asked when to suggest design changes — told him small tweaks now, bigger changes at /iterate.
- **Issues:** None.

### Step 4: FastAPI backbone — CORS, endpoint stubs, rate limiting, .env

- **What was built:** `main.py` updated with `python-dotenv` (`load_dotenv()` at startup), `slowapi` rate limiter (20 req/min per IP, keyed by remote address, 429 error handler registered). Three stub endpoints added: `POST /product/{barcode}` (returns placeholder product name), `POST /ocr` (accepts file upload via `python-multipart`, returns placeholder price), `POST /verdict` (accepts `VerdictRequest` Pydantic body, returns placeholder FAIR verdict echoing back scanned_price). `python-multipart` added to `requirements.txt` — required by FastAPI for file upload handling. `.env` placeholder was already in place from Step 1.
- **Issues:** FastAPI raised a `RuntimeError` at import time because `python-multipart` was missing — installed and added to `requirements.txt`. Import check passed cleanly after install.
- **Learner engagement:** No questions raised during this step.

### Step 5: Open Food Facts service + /product/{barcode} endpoint

- **What was built:** `backend/services/` directory created. `services/openfoodfacts.py` written — async `httpx` call to Open Food Facts v2 API, extracts `product_name`, returns `None` if not found. `main.py` updated to import and call the service; endpoint now returns `{"name": "..."}` or `{"error": "not_found"}`.
- **Issue encountered:** Spec had the wrong domain (`world.openfoodfacts.net` returns 404 for most barcodes). Fixed to `world.openfoodfacts.org`. The specific barcode in the spec (`5000169105017`) is also not in the Open Food Facts database — used Nutella (`3017620422003`) for verification instead.
- **Learner observation (verification):** Nutella barcode returned product name correctly. Fake barcode returned `not_found` correctly.
- **Learner concern raised:** Open Food Facts coverage is patchy — some common products not found. Acknowledged as a real limitation of the crowdsourced database; noted that the "Product Not Found" fallback in Step 6 handles it, and that branded goods likely to have SerpAPI results also tend to be in Open Food Facts.
- **Comprehension check:** "What's the main reason for splitting the API logic into a service file?" → answered correctly: separation of concerns.

### Step 6: BarcodeScan.jsx — camera, html5-qrcode, loading + success + error states

- **What was built:** `BarcodeScan.jsx` using `@zxing/browser` (swapped from html5-qrcode after iOS black screen issue). Own `<video>` element with `playsInline` + `autoPlay` passed to the ZXing reader — full control over camera rendering. State machine: scanning → loading → success/not-found/error. Loading and success states float as frosted-glass cards over the live camera feed (camera stream kept running until API call resolves). `App.jsx` updated with `step1Key` state to force remount on SCAN AGAIN.
- **Issues encountered:** html5-qrcode rendered a black screen on iOS Safari — root cause was the library managing its own video element without `playsInline`. Switched to `@zxing/browser` with our own video ref. Second issue: loading/success overlays appeared over a black background because the camera was stopped on barcode detect. Fixed by keeping the stream alive until the API call completes.
- **Design change:** Ben requested loading and success states float over the camera feed rather than replacing it with a black screen. Implemented as semi-transparent frosted-glass cards (backdrop-filter blur) over the live video.
- **Comprehension check:** "Why do we stop the camera only after the API call finishes?" → answered correctly: stopping the stream early makes the video go black, keeping it running lets the camera show through the overlay.
- **Learner engagement:** Spotted the UX issue with the abrupt black background independently — good design instinct.

### Step 7: pytesseract OCR service + /ocr endpoint

- **What was built:** `services/ocr.py` — accepts image bytes, opens via `io.BytesIO` + PIL, runs `pytesseract.image_to_string()`, applies regex to extract first price pattern, returns float or None. `main.py` `/ocr` endpoint updated to read uploaded file bytes, call `extract_price`, and return `{"price": X}` or `{"error": "no_price_detected"}`. Tesseract v5.4.0 installed via winget (`UB-Mannheim.TesseractOCR`); path hard-coded in `ocr.py` to handle Windows PATH quirk.
- **Verification:** Photo of price label → correct price returned. Blank image → `no_price_detected` error returned.
- **Comprehension check:** "What does io.BytesIO(image_bytes) do?" → answered: "Saves the image to disk so PIL can open it" (incorrect). Corrected: BytesIO wraps bytes in a fake in-memory file-like object; PIL never touches the filesystem.
- **Issues:** None in code. Tesseract binary not on PATH by default on Windows — handled by setting `pytesseract.tesseract_cmd` explicitly.
- **Learner engagement:** No questions raised during build.

### Step 8: PriceScan.jsx — camera capture, OCR flow, confirmation card, manual entry

- **What was built:** `PriceScan.jsx` — full-screen camera feed via `getUserMedia`, viewfinder overlay, auto-capture after 4 seconds or on "SCAN NOW" tap. Frame captured via off-screen canvas `.toBlob()`, posted to `/ocr` as `multipart/form-data`. Four UI phases: scanning → loading → confirm (with ✓/✗) → manual entry. "Couldn't read price" failure state also drops into manual entry. "Enter price manually" always visible in scanning phase. Back arrow stops camera and returns to step1. `App.jsx` updated to render `PriceScan` for `step2` case; `onAdvance(price)` sets `scannedPrice` and moves to `loading` stub.
- **Verification:** Full flow landing → Step 1 → Step 2 confirmed working. Camera showed with viewfinder. OCR ran and produced confirmation card or failure state. Back arrow returned to Step 1. Manual entry advanced to loading stub.
- **Comprehension check:** "Why does useRef work better than useState for the capture guard?" → answered correctly: "useRef persists across renders without triggering one."
- **Issues:** None.
- **Learner engagement:** No questions raised during build.

### Step 9: SerpAPI service + /verdict endpoint + verdict logic

- **What was built:** `services/serpapi.py` — async httpx call to SerpAPI Google Shopping with `gl=gb`, `hl=en`. Filters results to known major UK retailers via a compiled regex pattern. Caps at 8 results sorted cheapest first. Each result includes `name`, `price` (from `extracted_price`), and `url` (from `product_link`). `/verdict` endpoint in `main.py` updated with full logic: average price, diff_pct, FAIR/ABOVE_MARKET/OVERPRICED bucketing, suggestion strings for cheaper retailers.
- **Issues encountered:** Initial params (`gl=uk`, `google_domain=google.co.uk`) returned "Google hasn't returned any results" — fixed by switching to `gl=gb`, `hl=en`, dropping `google_domain`. Field name was `product_link` not `link` (discovered via debug print). `extracted_price` (pre-parsed float) was used instead of regex on price string after seeing the response keys.
- **Learner-initiated changes:** Ben spotted that unfiltered results included unknown retailers and requested a major-retailers-only filter. Also requested URLs to be included for frontend linking. Both added during the step.
- **Comprehension check:** "Why parse the price string with regex instead of using extracted_price?" — answered that `extracted_price` being null/missing would make the result invalid. Corrected: `extracted_price` is the right field to use (SerpAPI already parsed it); regex was unnecessary. Code updated to use `extracted_price` immediately.
- **Learner engagement:** Active and directive — spotted two real product improvements (retailer filtering, URL inclusion) unprompted. Good instincts.

### Step 10: VerdictScreen + VerdictTab — badge, suggestion bubbles, SCAN AGAIN

- **What was built:** `VerdictScreen.jsx` — Matrix rain background, VERDICT header, two-tab bar (Verdict / Results), scrollable content area, SCAN AGAIN button. `VerdictTab.jsx` — three badge states (shield/triangle/bell), pop-in animation with cubic-bezier bounce, YOU PAID / UK AVERAGE stat block, iMessage-style suggestion bubbles. `VerdictLoader` component added inline to `App.jsx` — fires POST /verdict on mount, shows Matrix rain + spinner while waiting, transitions to verdict on success. Results tab left as a stub for step 11.
- **Verification:** Full end-to-end flow confirmed working. Correct badge, animation, and suggestions displayed. SCAN AGAIN reset all state and returned to landing.
- **Design changes requested:** Price comparison display (was tiny grey text) replaced with a prominent two-column stat block (YOU PAID in badge colour, UK AVERAGE in white, both at 22px). Suggestion strings made cheeky — OVERPRICED uses "Yikes." / "Ouch —" openers, ABOVE MARKET uses "Ha!" / retailer + savings framing. FAIR verdict given a positive iMessage bubble: "Nicely played. That's already one of the better prices out there."
- **Issues:** None.
- **Learner engagement:** Active on design — requested more visible price comparison and cheeky suggestion tone. Chose specific wording for the FAIR positive bubble.

### Step 1: Full-stack project scaffold

- **What was built:** Vite/React frontend scaffolded in `frontend/`. FastAPI backend created in `backend/` with `main.py` (CORS + `/ping` endpoint), `requirements.txt`, and `.env` placeholder. `.gitignore` added (covers node_modules, .env, __pycache__, venv, .claude). Frontend `App.jsx` wired to call `GET /ping` on mount via `useEffect` and log response to console. Git repo initialized and first commit made.
- **Verification:** Both dev servers started without errors. Browser console showed `/ping response: {status: 'ok'}` — confirmed frontend→backend HTTP connection working.
- **Learner questions:** Asked what PowerShell is (clarified: same computer, text-based control). Asked whether two terminals = two separate computers (clarified: no, two programs running simultaneously on the same machine). Asked when git commit would happen (clarified: after each verified step). Asked about git credentials (clarified: not needed until Step 12 when pushing to GitHub).
- **Active engagement:** Good questions about the tooling before running anything — Ben wanted to understand what he was running before he ran it.

