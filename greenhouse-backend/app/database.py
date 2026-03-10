from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Change this one line to switch from SQLite to PostgreSQL:
# e.g. "postgresql://user:password@localhost/greenhouse"
DATABASE_URL = "sqlite:///./greenhouse.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # SQLite-only; remove for PostgreSQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
