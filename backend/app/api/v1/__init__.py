from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.businesses import router as businesses_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.imports import router as imports_router
from app.api.v1.reconciliation import router as reconciliation_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.passports import router as passports_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(businesses_router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(imports_router, prefix="/imports", tags=["Data Ingestion & Imports"])
api_router.include_router(reconciliation_router, prefix="/reconciliation", tags=["Reconciliation"])
api_router.include_router(analysis_router, prefix="/analysis", tags=["Financial Analysis"])
api_router.include_router(passports_router, prefix="/passports", tags=["Financial Passports"])

