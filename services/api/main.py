from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from orbit.db import create_db_and_tables
from orbit.routes.chat import router as chat_router
from orbit.routes.ingest import router as ingest_router
from orbit.routes.portfolio import router as portfolio_router
from orbit.routes.mission import router as mission_router
from orbit.routes.interview import router as interview_router
from orbit.routes.metrics import router as metrics_router


app = FastAPI(title="Orbit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


app.include_router(ingest_router)
app.include_router(chat_router)
app.include_router(portfolio_router)
app.include_router(mission_router)
app.include_router(interview_router)
app.include_router(metrics_router)
