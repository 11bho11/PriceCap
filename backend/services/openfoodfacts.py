import httpx


async def get_product_name(barcode: str) -> str | None:
    url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            data = response.json()
        except Exception:
            return None

    if data.get("status") != 1:
        return None

    product = data.get("product", {})
    return product.get("product_name") or None
