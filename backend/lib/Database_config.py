import os
from dotenv import load_dotenv

load_dotenv()
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")


print(DATABASE_URL)

DB_ENABLED = DATABASE_URL is not None

if DB_ENABLED:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=2,
        pool_timeout=30,
        pool_recycle=1800,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Base class for models
    Base = declarative_base()

    print("✅ Database configuration loaded")
else:
    engine = None
    SessionLocal = None
    Base = None
    print("⚠️ DATABASE_URL not found - running without database persistence")


# Dependency to get database session
def get_db():
    """Get database session"""
    if not DB_ENABLED:
        # Return None if database is not configured
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize database (create tables)
def init_db():
    """Create all database tables"""
    if not DB_ENABLED:
        print("⚠️ Database not configured - skipping table creation")
        return False

    from models import database_models

    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
    return True


# Test database connection
def test_connection():
    """Test database connection"""
    if not DB_ENABLED:
        print("⚠️ Database not configured")
        return False

    try:
        with engine.connect() as conn:
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
