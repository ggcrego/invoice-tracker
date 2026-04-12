from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.tool import Tool
from app.models.invoice import Invoice

router = APIRouter()

@router.get("/")
async def get_directory(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get all active tools
    tools_result = await db.execute(
        select(Tool).where(Tool.company_id == current_user.company_id, Tool.is_active == True).order_by(Tool.name)
    )
    tools = tools_result.scalars().all()

    directory = []
    for tool in tools:
        # Get active subscribers (users with recurring invoices for this tool)
        subs_result = await db.execute(
            select(User.id, User.full_name, User.avatar_url, User.slack_user_id)
            .join(Invoice, Invoice.submitted_by == User.id)
            .where(
                Invoice.tool_id == tool.id,
                Invoice.is_recurring == True,
                Invoice.status.in_(["pending_approval", "approved", "pending_reimbursement", "reimbursed"]),
                User.is_active == True,
            )
            .distinct()
        )
        subscribers = [
            {"id": str(row[0]), "full_name": row[1], "avatar_url": row[2], "slack_user_id": row[3]}
            for row in subs_result.all()
        ]

        directory.append({
            "id": str(tool.id),
            "name": tool.name,
            "icon_url": tool.icon_url,
            "website_url": tool.website_url,
            "subscriber_count": len(subscribers),
            "subscribers": subscribers,
        })

    return directory
