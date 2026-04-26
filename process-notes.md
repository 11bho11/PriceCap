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

### Step 1: Full-stack project scaffold

- **What was built:** Vite/React frontend scaffolded in `frontend/`. FastAPI backend created in `backend/` with `main.py` (CORS + `/ping` endpoint), `requirements.txt`, and `.env` placeholder. `.gitignore` added (covers node_modules, .env, __pycache__, venv, .claude). Frontend `App.jsx` wired to call `GET /ping` on mount via `useEffect` and log response to console. Git repo initialized and first commit made.
- **Verification:** Both dev servers started without errors. Browser console showed `/ping response: {status: 'ok'}` — confirmed frontend→backend HTTP connection working.
- **Learner questions:** Asked what PowerShell is (clarified: same computer, text-based control). Asked whether two terminals = two separate computers (clarified: no, two programs running simultaneously on the same machine). Asked when git commit would happen (clarified: after each verified step). Asked about git credentials (clarified: not needed until Step 12 when pushing to GitHub).
- **Active engagement:** Good questions about the tooling before running anything — Ben wanted to understand what he was running before he ran it.

