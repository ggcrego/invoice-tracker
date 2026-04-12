from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.models.company import Company
from app.models.category import Category
import uuid

DEFAULT_CATEGORIES = [
    {"name": "Paid Tools / Subscriptions", "type": "trackable", "gst_reminder_enabled": True},
    {"name": "Travel", "type": "simple", "gst_reminder_enabled": True},
    {"name": "Team Meals", "type": "simple", "gst_reminder_enabled": False},
    {"name": "Office Supplies", "type": "simple", "gst_reminder_enabled": True},
    {"name": "Parking", "type": "simple", "gst_reminder_enabled": False},
    {"name": "Hardware", "type": "simple", "gst_reminder_enabled": True},
    {"name": "Miscellaneous", "type": "simple", "gst_reminder_enabled": False},
]

async def register_company_and_admin(
    db: AsyncSession,
    company_name: str,
    full_name: str,
    email: str,
    supabase_user_id: str,
) -> tuple[Company, User]:
    """Create company, admin user, and seed default categories."""
    # Create company
    company = Company(name=company_name)
    db.add(company)
    await db.flush()

    # Create admin user with Supabase auth ID
    user = User(
        id=uuid.UUID(supabase_user_id),
        company_id=company.id,
        email=email,
        full_name=full_name,
        role="admin",
    )
    db.add(user)

    # Seed default categories
    for i, cat_data in enumerate(DEFAULT_CATEGORIES):
        category = Category(
            company_id=company.id,
            name=cat_data["name"],
            type=cat_data["type"],
            gst_reminder_enabled=cat_data["gst_reminder_enabled"],
            display_order=i,
        )
        db.add(category)

    await db.commit()
    await db.refresh(company)
    await db.refresh(user)
    return company, user
