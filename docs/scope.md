# PriceCap

## Idea
A gamified iOS app where UK shoppers scan a product barcode and shelf price in-store, then instantly receive a bold verdict — Fair, Overpriced, or Inflated — with a contextual suggestion bubble pointing them to a better deal nearby.

## Who It's For
Low-income UK shoppers standing in a supermarket aisle, in the moment, who want to know if they're being ripped off before they put something in the basket. They don't want a planning tool — they want an instant answer, right now, with attitude.

## Inspiration & References
- [Are digital price tags driving grocery price hikes? | Bankrate](https://www.bankrate.com/personal-finance/digital-price-tags-efficiency-or-price-gouging/) — the "why now" narrative: grocery chains rolling out electronic shelf labels that enable real-time surge pricing. PriceCap is the consumer counter-move.
- [Grocery Dealz](https://apps.apple.com/us/app/grocery-dealz-price-tracker/id6478849172) — proves the market exists and App Store approval is achievable. PriceCap differentiates with camera-first flow and gamified verdict instead of browse/search.
- [Stretch](https://www.supermarketnews.com/grocery-technology/mobile-app-will-help-shoppers-compare-local-grocery-prices) — what PriceCap is explicitly NOT. Stretch is pre-shop planning; PriceCap is in-the-moment.
- Hackathon theme: "Escape the Permanent Underclass" — price transparency as economic empowerment.

**Design identity (from existing mockups):**
- Dark background, neon green (#00FF41-range) on near-black
- Matrix-style binary rain background texture
- £ shield logo with lightning bolt
- Tagline: "THE SYSTEM DOESN'T WANT YOU TO KNOW"
- Monospace / techy typography
- Two-screen scan flow with green corner-bracket viewfinder
- POW-style comic reveal for verdict
- Message bubble shape for suggestions (lighter, funnier tone than the verdict)

## Goals
- Give low-income UK shoppers real-time, in-store price transparency with no friction
- Make it feel empowering and fun — not a dry utility app
- Nail the anti-establishment brand voice; the submission narrative is the surge pricing story
- Learning goals: full-stack architecture (React Native + Python FastAPI), real-world API integration, on-device ML (OCR)

## What "Done" Looks Like
1. User opens app → landing screen (dark, Matrix aesthetic, "SCAN BARCODE" CTA)
2. Step 1: camera opens → user points at product barcode → auto-scans → product identified via Open Food Facts API
3. Step 2: camera opens → user points at shelf price label → on-device OCR reads the price (Apple Vision framework)
4. Verdict screen: POW-style reveal — **FAIR** (green), **OVERPRICED** (orange), or **INFLATED** (red) — based on comparison against SerpAPI Google Shopping UK prices
5. Suggestion bubble: "Tesco on [Street] has this for £X less — Y mins away" via Google Places + SerpAPI, templated string

## What's Explicitly Cut
- **Pre-shopping planning / basket comparison** — market saturated (Stretch, Flipp, Basket already exist). Absolute no.
- **Receipt scanning** — different use case, different app. Absolute no.
- **Social sharing / leaderboards** — strong post-MVP vision (community price transparency feed), but not MVP.
- **Historical price tracking** — compelling direction, post-MVP.
- **User accounts / profiles** — post-MVP. MVP is anonymous, scan-and-go.
- **LLM-generated suggestion text** — post-MVP enhancement. MVP uses templated strings with real data.
- **Shrinkflation alerts, unit price comparison, own-brand alternatives** — good bubble ideas, post-MVP.

## Loose Implementation Notes
- **Platform:** iOS, React Native
- **Backend:** Python FastAPI — API keys live here (not in the app), protecting against cost exposure. This is also where websockets/webhook learning happens.
- **Product ID:** Barcode scan → Open Food Facts API (free, strong UK coverage)
- **Shelf price:** Apple Vision framework on-device OCR — free, fast, no extra API
- **Price comparison:** SerpAPI Google Shopping UK endpoint — structured multi-retailer data (Tesco, Sainsbury's, ASDA, etc.) in one call
- **Nearby stores:** Dropped — SerpAPI already returns retailer names; suggestion bubbles say "[Retailer] has this for £X less" (no GPS/location data needed)
- **Verdict logic:** compare scanned price against SerpAPI results; define thresholds (e.g. >10% above average = Overpriced, >25% = Inflated) — to be refined in PRD
- **Suggestion bubbles:** pre-written templates, data-filled at runtime, no LLM dependency
