import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR.parent / ".env")
DATA_DIR = os.getenv("RAG_DATA_DIR", str(BASE_DIR / "data" / "documents"))
VECTOR_DB_DIR = os.getenv("RAG_VECTOR_DB_DIR", str(BASE_DIR / "vectorstore"))
GEMINI_CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.5-flash-lite")
GEMINI_EMBEDDING_MODEL = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")

CHUNK_SIZE = 1024
CHUNK_OVERLAP = 200

TOP_K = 5