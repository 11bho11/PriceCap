import io
import re
import pytesseract
from PIL import Image

# On Windows, Tesseract installs to a fixed path that isn't always on PATH.
# Pointing pytesseract directly at the binary avoids "not found" errors.
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Matches: optional £, one or more digits, optional decimal point + digits
_PRICE_RE = re.compile(r"£?(\d+(?:\.\d+)?)")


def extract_price(image_bytes: bytes) -> float | None:
    img = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(img)
    match = _PRICE_RE.search(text)
    if match is None:
        return None
    return float(match.group(1))
