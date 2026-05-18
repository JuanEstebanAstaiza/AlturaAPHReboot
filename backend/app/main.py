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

# Include routers (imported later to avoid circular deps)
# from app.api.router import include_routers
# include_routers(app)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
