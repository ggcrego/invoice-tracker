import uuid
from fastapi import UploadFile
from supabase import create_client
from app.config import settings

def get_supabase_client():
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

async def upload_invoice_file(file: UploadFile, company_id: uuid.UUID) -> tuple[str, str]:
    """
    Upload invoice file to Supabase Storage.
    Returns: (public_url, original_filename)
    """
    supabase = get_supabase_client()
    file_ext = file.filename.split('.')[-1] if file.filename else 'bin'
    storage_path = f"{company_id}/{uuid.uuid4()}.{file_ext}"

    content = await file.read()

    supabase.storage.from_("invoices").upload(
        path=storage_path,
        file=content,
        file_options={"content-type": file.content_type or "application/octet-stream"}
    )

    # Get public URL (for MVP with public bucket)
    url = supabase.storage.from_("invoices").get_public_url(storage_path)

    return url, file.filename or "unknown"
