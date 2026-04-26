import os
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from services.openfoodfacts import get_product_name
from services.ocr import extract_price

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VerdictRequest(BaseModel):
    barcode: str
    product_name: str
    scanned_price: float


@app.get("/ping")
def ping():
    return {"status": "ok"}


@app.post("/product/{barcode}")
@limiter.limit("20/minute")
async def get_product(barcode: str, request: Request):
    name = await get_product_name(barcode)
    if name is None:
        return {"error": "not_found"}
    return {"name": name}


@app.post("/ocr")
@limiter.limit("20/minute")
async def ocr(request: Request, file: UploadFile = File(...)):
    image_bytes = await file.read()
    price = extract_price(image_bytes)
    if price is None:
        return {"error": "no_price_detected"}
    return {"price": price}


@app.post("/verdict")
@limiter.limit("20/minute")
async def verdict(request: Request, body: VerdictRequest):
    return {
        "verdict": "FAIR",
        "scanned_price": body.scanned_price,
        "average_price": 1.99,
        "retailer_prices": [
            {"name": "Tesco", "price": 1.99},
            {"name": "Sainsbury's", "price": 2.09},
        ],
        "suggestions": [],
    }
