from pathlib import Path
from threading import Lock, Thread
import time
import os
from typing import Literal
from hmac import compare_digest

from fastapi import Depends, FastAPI, Header, HTTPException
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
_documents = None
_vectorstore = None
_rag_lock = Lock()
_rag_error = None
_rag_initializing = False
_rag_retry_at = None
_provider_status = {"gemini": "unknown", "openai": "unknown"}


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
    provider: Literal["gemini", "openai"] = "gemini"


def verify_rag_service_token(
    x_rag_service_token: str | None = Header(default=None),
):
    expected_token = os.getenv("RAG_SERVICE_TOKEN")
    if not expected_token:
        raise HTTPException(
            status_code=503,
            detail="RAG service authentication is not configured.",
        )
    if not x_rag_service_token or not compare_digest(x_rag_service_token, expected_token):
        raise HTTPException(status_code=401, detail="Invalid RAG service token.")


def get_rag_chain():
    if _rag_chain is None:
        if _rag_error:
            raise RuntimeError(_rag_error)
        raise RuntimeError("The RAG knowledge base is still initializing.")
    return _rag_chain


def _build_rag_chain():
    global _documents, _vectorstore, _rag_error
    vectorstore = load_vector_store() if os.getenv("GEMINI_API_KEY") else None
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
        if not os.getenv("GEMINI_API_KEY"):
            _rag_error = "Gemini embedding key is not configured; using BM25 retrieval."
        else:
            try:
                vectorstore = create_vector_store(documents)
            except EmbeddingQuotaError as error:
                _provider_status["gemini"] = "quota_exhausted"
                print(
                    "[RAG] Gemini embedding quota exhausted; enabling BM25 retrieval "
                    "until vector indexing can complete.",
                    flush=True,
                )
                vectorstore = None
                _rag_error = str(error)

    retriever = AdvancedRetriever(documents, vectorstore)
    _documents = documents
    _vectorstore = vectorstore
    return RAGChain(retriever, None)


def _initialize_rag_in_background():
    global _rag_chain, _rag_error, _rag_initializing, _rag_retry_at

    while _vectorstore is None:
        with _rag_lock:
            _rag_initializing = True
        try:
            chain = _build_rag_chain()
            with _rag_lock:
                _rag_chain = chain
                if _vectorstore is not None:
                    _rag_error = None
                _rag_retry_at = None
            if _vectorstore is not None:
                print("[RAG] Vector knowledge base initialized successfully.", flush=True)
                return
            print("[RAG] BM25 knowledge base initialized; vector indexing will retry.", flush=True)
            raise EmbeddingQuotaError(
                _rag_error or "Gemini embeddings are quota limited.",
                300,
            )
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
    providers = {
        "gemini": bool(os.getenv("GEMINI_API_KEY")),
        "openai": bool(os.getenv("OPENAI_API_KEY")),
    }
    api_key_configured = any(providers.values())
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
        "geminiKeyConfigured": providers["gemini"],
        "vectorIndexAvailable": vector_index_exists,
        "sourceDocumentsAvailable": documents_exist,
        "initialized": _rag_chain is not None,
        "retrievalMode": "vector+bm25" if _vectorstore is not None else (
            "bm25" if _rag_chain is not None else "initializing"
        ),
        "providers": providers,
        "quotaStatus": _provider_status["gemini"],
        "providerStatus": {
            name: (
                "not_configured"
                if not providers[name] and _provider_status[name] == "unknown"
                else _provider_status[name]
            )
            for name in providers
        },
    }


@app.post("/chat", dependencies=[Depends(verify_rag_service_token)])
def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        rag = get_rag_chain()
        llm = get_llm(request.provider)
        supplemental_context = [
            item.model_dump() for item in request.supplementalContext
        ]
        answer, sources = rag.ask(
            request.question,
            supplemental_context=supplemental_context,
            retrieve=request.scope != "my_vault",
            llm=llm,
        )
        _provider_status[request.provider] = "ready"
        return {
            "answer": answer,
            "sources": sources,
            "retrievalMode": "vector+bm25" if _vectorstore is not None else "bm25",
        }
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except APIError as error:
        if getattr(error, "code", None) == 429 or "RESOURCE_EXHAUSTED" in str(error).upper():
            _provider_status[request.provider] = "quota_exhausted"
        raise HTTPException(
            status_code=503,
            detail=f"{request.provider.title()} API request failed: {error}",
        ) from error
    except Exception as error:
        if "429" in str(error) or "RESOURCE_EXHAUSTED" in str(error).upper():
            _provider_status[request.provider] = "quota_exhausted"
        print(f"[RAG] Chat request failed: {error}", flush=True)
        raise HTTPException(
            status_code=503,
            detail=f"RAG retrieval or generation failed: {error}",
        ) from error
