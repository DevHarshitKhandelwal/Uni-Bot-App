from langchain_google_genai import GoogleGenerativeAIEmbeddings
from src.config import GEMINI_EMBEDDING_MODEL


def get_embeddings():
    return GoogleGenerativeAIEmbeddings(model=GEMINI_EMBEDDING_MODEL)