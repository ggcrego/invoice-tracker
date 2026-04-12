from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, company, categories, tools, invoices, approvals, team, directory, dashboard

app = FastAPI(
    title="ExpenseTrack API",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(company.router, prefix="/api/company", tags=["Company"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(tools.router, prefix="/api/tools", tags=["Tools"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["Invoices"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["Approvals"])
app.include_router(team.router, prefix="/api/team", tags=["Team"])
app.include_router(directory.router, prefix="/api/directory", tags=["Tool Directory"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
