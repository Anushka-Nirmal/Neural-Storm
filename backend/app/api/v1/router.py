from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.complaints import router as complaints_router
from app.api.v1.departments import router as departments_router
from app.api.v1.ai import router as ai_router
from app.api.v1.languages import router as languages_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(complaints_router)
api_v1_router.include_router(departments_router)
api_v1_router.include_router(ai_router)
api_v1_router.include_router(languages_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(admin_router)
