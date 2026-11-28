from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.db import close_pool
from app.routers import adaptive, feyn


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    close_pool()  # cierra el pool de PostgreSQL al apagar


app = FastAPI(
    title="Synapz & Feyn API",
    description="Backend adaptativo impulsado por Feyn AI",
    version="1.0.0",
    lifespan=lifespan,
)

# Configuración de CORS para permitir solicitudes desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://synapz-jade.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include la ruta de feyn
app.include_router(feyn.router)
app.include_router(adaptive.router)


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Synapz is running!"}

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
  return {"status": "ok"}
