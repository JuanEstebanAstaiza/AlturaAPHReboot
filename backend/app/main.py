from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import structlog

from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    structlog.configure(
        processors=[
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.PrintLoggerFactory(),
    )
    logger = structlog.get_logger()
    logger.info("aph_startup", app=app.title, version=get_settings().APP_VERSION)
    yield
    # Shutdown
    logger.info("aph_shutdown")


settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Asistente de Propiedad Horizontal - API RESTful Multi-Tenant",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.api.router import include_routers
include_routers(app)

from fastapi.responses import JSONResponse
from app.core.exceptions import AuthenticationError, AuthorizationError, FeatureNotAvailableError, TenantNotFoundError, UserNotFoundError, TenantLimitExceededError, PQRSError, DocumentError, ReservationError, FinancialError


@app.exception_handler(AuthenticationError)
async def authentication_error_handler(request, exc):
    return JSONResponse(status_code=401, content={"detail": exc.message})


@app.exception_handler(AuthorizationError)
async def authorization_error_handler(request, exc):
    return JSONResponse(status_code=403, content={"detail": exc.message})


@app.exception_handler(FeatureNotAvailableError)
async def feature_not_available_handler(request, exc):
    return JSONResponse(status_code=403, content={"detail": exc.message})


@app.exception_handler(TenantNotFoundError)
async def tenant_not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(TenantLimitExceededError)
async def tenant_limit_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(PQRSError)
async def pqrs_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(DocumentError)
async def document_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(ReservationError)
async def reservation_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(FinancialError)
async def financial_error_handler(request, exc):
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
