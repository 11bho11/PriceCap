import os
import re
import httpx


async def get_retailer_prices(product_name: str) -> list[dict] | None:
    api_key = os.getenv("SERPAPI_KEY")
    params = {
        "engine": "google_shopping",
        "q": product_name,
        "gl": "gb",
        "hl": "en",
        "api_key": api_key,
    }
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()

    if "error" in data:
        print(f"SerpAPI returned error: {data['error']}")
        return None

    results = data.get("shopping_results", [])
    if not results:
        return None

    prices = []
    for item in results:
        source = item.get("source")
        price = item.get("extracted_price")
        if not source or price is None:
            continue
        prices.append({
            "name": source,
            "price": price,
            "url": item.get("product_link"),
        })

    if not prices:
        return None

    retailer_patterns = re.compile(
        r"amazon|ocado|sainsbury|tesco|asda|costco|morrisons|waitrose"
        r"|marks.{0,3}spencer|m&s|boots|superdrug|aldi|lidl|iceland"
        r"|co.?op|whole.?foods|holland.{0,3}barrett",
        re.IGNORECASE,
    )

    filtered = [r for r in prices if retailer_patterns.search(r["name"])]

    if not filtered:
        return None

    return sorted(filtered, key=lambda r: r["price"])[:8]
