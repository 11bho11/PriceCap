# PriceCap — Product Requirements

## Problem Statement

UK grocery chains are rolling out electronic shelf labels that enable real-time surge pricing, leaving low-income shoppers unable to tell if they're being ripped off in the moment. A shopper standing in a supermarket aisle has no quick way to verify whether the shelf price is fair compared to what other retailers charge for the same product. PriceCap gives them an instant, in-aisle verdict — before anything goes in the basket.

---

## User Stories

### Epic: App Entry & Onboarding

- As a first-time visitor, I want to understand what PriceCap does before I start scanning, so that I feel confident using it.
  - [ ] Landing screen displays the PriceCap logo, tagline ("THE SYSTEM DOESN'T WANT YOU TO KNOW"), £ shield logo, and Matrix-style binary rain background
  - [ ] Two buttons visible: "SCAN BARCODE" (primary, neon green, full-width) and "HOW DOES IT WORK?" (secondary, outlined, below primary)
  - [ ] Tapping "HOW DOES IT WORK?" opens a bottom-sheet modal with swipeable cards
  - [ ] The modal contains 3 cards; each card has a step number and 1–2 sentences describing that step
  - [ ] Cards describe the three-step flow: scan barcode → scan shelf price → get verdict
  - [ ] The modal can be dismissed, returning the user to the landing screen

- As a returning user, I want to jump straight into scanning, so that I don't waste time on screens I've already seen.
  - [ ] "SCAN BARCODE" is the dominant primary CTA on the landing screen and is immediately tappable

---

### Epic: Barcode Scanning (Step 1 of 2)

- As a shopper in a supermarket aisle, I want to scan a product barcode with my phone camera, so that the app can identify the product I'm holding.
  - [ ] Tapping "SCAN BARCODE" triggers the iOS camera permission prompt if not yet granted
  - [ ] If permission is granted, the Step 1 scan screen appears with header "STEP 1 OF 2 — SCAN BARCODE"
  - [ ] Screen shows a green corner-bracket viewfinder in the centre and a "Scanning automatically..." status pill at the bottom
  - [ ] Camera reads the barcode automatically — no shutter button required
  - [ ] On successful scan: a gray loading screen with a spinning circle appears while the Open Food Facts API call runs
  - [ ] On API success: a thick green tick appears with the text "Product scanned" and the product name displayed below it
  - [ ] Screen auto-advances to Step 2 after the confirmation — no user tap required
  - [ ] If the product barcode is not found in Open Food Facts: a "Product Not Found" card is shown, then the user is returned to Step 1 to scan again
  - [ ] If camera permission is denied: a popup appears explaining camera access is required, with an OK button that returns to the landing screen

---

### Epic: Price Scanning (Step 2 of 2)

- As a shopper, I want the app to read the shelf price label with my camera, so that I don't have to type it manually.
  - [ ] Step 2 scan screen appears with header "STEP 2 OF 2 — SCAN PRICE"
  - [ ] A back arrow (←) is visible at the top left; tapping it returns the user to Step 1
  - [ ] Green corner-bracket viewfinder and "Scanning automatically..." status pill are visible, matching Step 1
  - [ ] An "Enter price manually" button is always visible below the viewfinder
  - [ ] OCR runs automatically using the Apple Vision framework
  - [ ] On successful OCR detection: a confirmation card appears showing the detected price (e.g. "£2.49") with a ✓ button and an X button
  - [ ] Tapping ✓ advances to the Verdict screen
  - [ ] Tapping X opens a manual price entry field
  - [ ] If OCR runs but cannot detect any number (blurry image, unreadable label, etc.): a "Couldn't read price" message appears and manual price entry is prompted
  - [ ] Tapping "Enter price manually" at any time opens a text entry field where the user types the price directly

---

### Epic: Verdict & Results

- As a shopper, I want to receive a clear, immediate verdict on whether the scanned price is fair, so that I can decide before putting the item in my basket.
  - [ ] Verdict screen has a "VERDICT" title at the top
  - [ ] A large badge displays one of three states based on the scanned price vs. the average of SerpAPI Google Shopping UK results:
    - **FAIR** (neon green): scanned price is at or below the average, or within 5% above
    - **ABOVE MARKET** (orange): scanned price is 5–25% above average
    - **OVERPRICED** (red): scanned price is more than 25% above average
  - [ ] If verdict is FAIR: the suggestion area shows the message "You're getting a good deal!"
  - [ ] If verdict is ABOVE MARKET or OVERPRICED: up to 2 suggestion bubbles appear, styled as iMessage-style incoming message bubbles
  - [ ] Each suggestion bubble uses the template: "[Retailer] has this for £X less"
  - [ ] A "SCAN AGAIN" button at the bottom of the screen returns the user to the landing screen
  - [ ] If SerpAPI returns no UK retailer prices for the product: a "No price data found" card is shown instead of a verdict badge

- As a shopper, I want to see a full breakdown of prices across retailers, so that I understand where my store sits in the market.
  - [ ] The Verdict screen has two tabs: "Verdict" and "Results"
  - [ ] The Results tab shows a table listing each retailer and its price from the SerpAPI results
  - [ ] A price range meter is displayed below the table, spanning from the lowest to the highest retailer price
  - [ ] The user's scanned price is marked and visually highlighted on the meter

---

### Epic: Error States

- As a shopper, I want the app to handle failures gracefully so that I'm never left stranded on a broken screen.
  - [ ] No internet connection (detected when API calls fire): a popup appears with a warning message and an OK button that returns to the landing screen
  - [ ] Camera permission denied: a popup appears explaining camera access is required, with an OK button returning to the landing screen
  - [ ] Product barcode not found in Open Food Facts: "Product Not Found" card shown, user returned to Step 1
  - [ ] OCR cannot detect any price: "Couldn't read price" message shown, manual entry prompted
  - [ ] SerpAPI returns no UK price data: "No price data found" card shown on the Verdict screen

---

## What We're Building

1. **Landing screen** — PriceCap logo, tagline, £ shield logo, Matrix rain background, "SCAN BARCODE" primary CTA, "HOW DOES IT WORK?" secondary button
2. **How Does It Work modal** — bottom-sheet with 3 swipeable step cards (step number + 1–2 sentences each)
3. **Step 1: Barcode scan screen** — camera viewfinder with green corner brackets, auto-scan, gray loading state with spinner, green tick + product name confirmation, auto-advance to Step 2
4. **Step 2: Price scan screen** — camera viewfinder, auto-OCR via Apple Vision, price confirmation card (✓ / X), manual entry fallback always available, back arrow to Step 1
5. **Verdict screen — Verdict tab** — FAIR / ABOVE MARKET / OVERPRICED badge, iMessage-style suggestion bubbles (up to 2), FAIR positive message, SCAN AGAIN button
6. **Verdict screen — Results tab** — retailer price table from SerpAPI, price range meter with scanned price marked
7. **Error handling** — popup modals for no internet and camera permission denial (OK → landing); product not found card; OCR failure prompt; no SerpAPI data card
8. **FastAPI backend** — Open Food Facts product lookup, SerpAPI Google Shopping UK price comparison, Google Places + SerpAPI nearby store lookup; all API keys protected server-side

---

## What We'd Add With More Time

- **Social sharing** — share your verdict as a card; community price transparency feed
- **Historical price tracking** — see how a product's price has changed week-to-week
- **Shrinkflation alerts** — flag when unit price is worse than the shelf price implies
- **Unit price comparison** — compare per-100g / per-unit prices across retailers in the Results tab
- **Own-brand alternatives** — suggest supermarket own-brand options in the suggestion bubbles
- **LLM-generated suggestion copy** — richer, more natural suggestion text instead of fixed templates
- **User accounts** — saved scan history, favourite products, price drop alerts

---

## Non-Goals

- **Pre-shopping planning / basket comparison** — the market already has Stretch, Flipp, and Basket. PriceCap is in-the-moment only. Absolute no.
- **Receipt scanning** — a different use case, a different app.
- **Social features / leaderboards** — strong post-MVP vision but not part of the core scan-and-verdict loop.
- **User accounts / profiles** — MVP is fully anonymous; no login, no cross-session persistence.
- **Map widget on verdict screen** — suggestion bubbles are text-only; no embedded map UI.

---

## Open Questions

- **"How Does It Work" card copy** — the exact 1–2 sentence text for each of the 3 onboarding cards. Can be drafted at build time.
- **Suggestion data availability** — SerpAPI + Google Places may not always return a nearby store with a lower price. What's the fallback if fewer than 2 suggestions exist — show one, or show none? *Needs answering before /spec.*
- **Manual price entry validation** — should the field accept "249" and auto-format to "£2.49"? Can wait until build.
- **SerpAPI result count** — how many UK retailer results does SerpAPI typically return? The Results tab table and price meter depend on this. Can wait until build.
- **Verdict threshold calibration** — the 5% / 25% thresholds are starting points and may need tuning against real SerpAPI data. Can revisit after first build.
