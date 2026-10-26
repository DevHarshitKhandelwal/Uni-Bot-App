from pathlib import Path
from threading import Lock, Thread
import time
import os

from fastapi import FastAPI, HTTPException
from google.genai.errors import APIError
from pydantic import BaseModel, Field

from src.config import DATA_DIR, VECTOR_DB_DIR
from src.embeddings import EmbeddingQuotaError
from src.llm import get_llm
from src.loader import load_documents, split_documents
from src.rag_chain import RAGChain
from src.retriever import AdvancedRetriever
from src.vector_store import (
    create_vector_store,
    load_documents_from_vectorstore,
    load_vector_store,
)

app = FastAPI(title="UniBot RAG Service", version="1.0.0")
_rag_chain = None
_rag_lock = Lock()
_rag_error = None
_rag_initializing = False
_rag_retry_at = None


class SupplementalDocument(BaseModel):
    source: str
    content: str
    page: int | None = None
    fileUrl: str = ""


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=10000)
    scope: str = "all_resources"
    selectedSubject: str = ""
    supplementalContext: list[SupplementalDocument] = Field(default_factory=list)


def get_rag_chain():
    if _rag_chain is None:
        if _rag_error:
            raise RuntimeError(_rag_error)
        raise RuntimeError("The RAG knowledge base is still initializing.")
    return _rag_chain


def _build_rag_chain():
    vectorstore = load_vector_store()
    documents = load_documents_from_vectorstore()
    if vectorstore is None or not documents:
        source_documents = load_documents(DATA_DIR)
        if not source_documents:
            raise RuntimeError(
                f"No supported PDF or DOCX documents found in {DATA_DIR}."
            )
        documents = split_documents(source_documents)
        if not documents:
            raise RuntimeError("Document loading succeeded, but no chunks were created.")
        vectorstore = create_vector_store(documents)

    retriever = AdvancedRetriever(documents, vectorstore)
    return RAGChain(retriever, get_llm())


def _initialize_rag_in_background():
    global _rag_chain, _rag_error, _rag_initializing, _rag_retry_at

    while _rag_chain is None:
        with _rag_lock:
            _rag_initializing = True
        try:
            chain = _build_rag_chain()
            with _rag_lock:
                _rag_chain = chain
                _rag_error = None
                _rag_retry_at = None
            print("[RAG] Knowledge base initialized successfully.", flush=True)
            return
        except Exception as error:
            retry_after = (
                error.retry_after_seconds
                if isinstance(error, EmbeddingQuotaError)
                else 300
            )
            with _rag_lock:
                _rag_error = str(error)
                _rag_retry_at = time.time() + retry_after
                _rag_initializing = False
            print(
                f"[RAG] Initialization failed: {_rag_error}. "
                f"Retrying in {retry_after:.0f}s.",
                flush=True,
            )
            time.sleep(retry_after)
        finally:
            with _rag_lock:
                _rag_initializing = False


@app.on_event("startup")
def initialize_rag():
    global _rag_initializing
    with _rag_lock:
        _rag_initializing = True
    Thread(
        target=_initialize_rag_in_background,
        name="rag-initializer",
        daemon=True,
    ).start()


@app.get("/health")
def health():
    api_key_configured = bool(os.getenv("GEMINI_API_KEY"))
    vector_index_exists = (
        (Path(VECTOR_DB_DIR) / "index.faiss").is_file()
        and (Path(VECTOR_DB_DIR) / "index.pkl").is_file()
        and (Path(VECTOR_DB_DIR) / "chunks.pkl").is_file()
    )
    documents_exist = Path(DATA_DIR).is_dir() and any(
        path.suffix.lower() in {".pdf", ".docx"}
        for path in Path(DATA_DIR).iterdir()
        if path.is_file()
    )
    with _rag_lock:
        ready = _rag_chain is not None and api_key_configured
        message = "" if ready else (
            _rag_error
            or "The Gemini API key and knowledge base have not finished initializing."
        )
        initializing = _rag_initializing
        retry_after_seconds = (
            max(0, int(_rag_retry_at - time.time()))
            if _rag_retry_at is not None
            else None
        )
    return {
        "status": "ok",
        "ready": ready,
        "message": message,
        "initializing": initializing,
        "retryAfterSeconds": retry_after_seconds,
        "geminiKeyConfigured": api_key_configured,
        "vectorIndexAvailable": vector_index_exists,
        "sourceDocumentsAvailable": documents_exist,
        "initialized": _rag_chain is not None,
    }


@app.post("/chat")
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        rag = get_rag_chain()
        supplemental_context = [
            item.model_dump() for item in request.supplementalContext
        ]
        answer, sources = rag.ask(
            request.question,
            supplemental_context=supplemental_context,
            retrieve=request.scope != "my_vault",
        )
        return {"answer": answer, "sources": sources}
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except APIError as error:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini API request failed: {error}",
        ) from error
    except Exception as error:
        print(f"[RAG] Chat request failed: {error}", flush=True)
        raise HTTPException(
            status_code=503,
            detail=f"RAG retrieval or generation failed: {error}",
        ) from error
