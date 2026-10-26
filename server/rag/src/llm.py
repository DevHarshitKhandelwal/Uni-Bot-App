import os

from langchain_google_genai import ChatGoogleGenerativeAI
from src.config import GEMINI_CHAT_MODEL

def get_llm():
    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is not configured for the RAG service.")
    return ChatGoogleGenerativeAI(
        model=GEMINI_CHAT_MODEL,
        temperature=0.0,
        max_output_tokens=512,
        timeout=120,
        max_retries=2,
    )