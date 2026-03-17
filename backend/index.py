from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers.Chat_route import router as ChatRouter
from lib.Database_config import init_db, test_connection
import lib.Cloudinary_config

load_dotenv()

app = FastAPI(
    title="AI Chatbot API with Database",
    description="Multi-model AI chatbot with PostgreSQL database persistence",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orbit.sharexpress.in",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("\n🚀 Starting AI Chatbot API...")

    if test_connection():
        init_db()
        print("✅ Database initialized successfully!\n")
    else:
        print("⚠️ Database connection failed! Check your DATABASE_URL\n")


app.include_router(ChatRouter)


@app.get("/")
async def root():
    """API Root"""
    return {
        "message": "AI Chatbot API with Database",
        "version": "2.0.0",
        "docs": "/docs",
        "database": "PostgreSQL",
        "features": [
            "Conversation tracking",
            "Message history",
            "File storage",
            "Multi-model AI",
        ],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
