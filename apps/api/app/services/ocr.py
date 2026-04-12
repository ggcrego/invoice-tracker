import httpx
import re
import base64
from app.config import settings

GSTIN_PATTERN = r'\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}'

async def check_gstin_on_invoice(file_url: str, company_gstin: str) -> tuple[bool, float | None]:
    """
    Downloads the invoice image from Supabase Storage,
    sends it to Google Cloud Vision API for text detection,
    and checks if the company's GSTIN appears in the extracted text.

    Returns: (is_compliant: bool, gst_amount: float | None)
    """
    # 1. Download the file
    async with httpx.AsyncClient() as client:
        file_response = await client.get(file_url)
        file_bytes = file_response.content

    # 2. Send to Google Cloud Vision
    vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={settings.GOOGLE_CLOUD_VISION_API_KEY}"
    encoded_image = base64.b64encode(file_bytes).decode('utf-8')

    payload = {
        "requests": [{
            "image": {"content": encoded_image},
            "features": [{"type": "TEXT_DETECTION"}]
        }]
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(vision_url, json=payload, timeout=30.0)
        result = response.json()

    # 3. Extract text
    try:
        full_text = result["responses"][0]["fullTextAnnotation"]["text"]
    except (KeyError, IndexError):
        return False, None

    # 4. Check for company GSTIN
    found_gstins = re.findall(GSTIN_PATTERN, full_text)
    is_compliant = company_gstin in found_gstins if company_gstin else False

    # 5. Try to extract GST amount
    gst_amount = None
    gst_amount_patterns = [
        r'(?:IGST|CGST|SGST|GST)\s*:?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
        r'(?:Tax|GST)\s+Amount\s*:?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+\.?\d*)',
    ]
    for pattern in gst_amount_patterns:
        match = re.search(pattern, full_text, re.IGNORECASE)
        if match:
            gst_amount = float(match.group(1).replace(',', ''))
            break

    return is_compliant, gst_amount
