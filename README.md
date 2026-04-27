# PriceCap

**THE SYSTEM DOESN'T WANT YOU TO KNOW**

Grocery chains are rolling out electronic shelf labels that enable real-time surge pricing. PriceCap is the consumer counter-move — instant price transparency, no account required, no planning needed. Built for shoppers who want to know if they're being ripped off before they put something in the basket.

A web app for UK shoppers that compares supermarket shelf prices against live retailer data — in-store, in seconds. Scan a barcode, scan the shelf price, get a verdict: **FAIR**, **ABOVE MARKET**, or **OVERPRICED**.

Built for the **VibeJam Spring '26 Hackathon: Escape the Permanent Underclass**

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
