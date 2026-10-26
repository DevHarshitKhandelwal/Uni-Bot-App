import os

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from src.config import GEMINI_CHAT_MODEL


def get_llm(provider="gemini"):
    if provider == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError("OPENAI_API_KEY is not configured for the RAG service.")
        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0.0,
            max_tokens=512,
            timeout=120,
            max_retries=2,
        )

    if provider != "gemini":
        raise ValueError(f"Unsupported AI provider: {provider}")

    if not os.getenv("GEMINI_API_KEY"):
        raise RuntimeError("GEMINI_API_KEY is not configured for the RAG service.")
    return ChatGoogleGenerativeAI(
        model=GEMINI_CHAT_MODEL,
        temperature=0.0,
        max_output_tokens=512,
        timeout=120,
        max_retries=2,
    )