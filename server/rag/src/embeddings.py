import re
import time
from threading import Lock

from langchain_core.embeddings import Embeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from src.config import GEMINI_EMBEDDING_MODEL


class RateLimitedEmbeddings(Embeddings):
    def __init__(
        self,
        embeddings,
        batch_size=32,
        requests_per_minute=75,
        max_retries=5,
    ):
        self.embeddings = embeddings
        self.batch_size = batch_size
        self.request_interval = 60 / requests_per_minute
        self.max_retries = max_retries
        self._request_lock = Lock()
        self._next_request_at = 0.0

    def _wait_for_request_slot(self):
        with self._request_lock:
            now = time.monotonic()
            wait = max(0.0, self._next_request_at - now)
            self._next_request_at = (
                max(now, self._next_request_at) + self.request_interval
            )
        if wait:
            time.sleep(wait)

    @staticmethod
    def _quota_retry_delay(error):
        message = str(error)
        if "429" not in message and "RESOURCE_EXHAUSTED" not in message.upper():
            return None

        retry_match = re.search(r"retry in ([\d.]+)s", message, re.IGNORECASE)
        if retry_match:
            return float(retry_match.group(1)) + 1

        retry_match = re.search(r"retryDelay['\"]?\s*:\s*['\"]([\d.]+)s", message)
        if retry_match:
            return float(retry_match.group(1)) + 1

        return 60.0

    def _embed_with_retry(self, callback):
        for attempt in range(self.max_retries):
            self._wait_for_request_slot()
            try:
                return callback()
            except Exception as error:
                retry_delay = self._quota_retry_delay(error)
                if retry_delay is None or attempt == self.max_retries - 1:
                    raise
                print(
                    f"[RAG] Gemini embedding quota reached; retrying in "
                    f"{retry_delay:.1f}s (attempt {attempt + 1}/{self.max_retries - 1}).",
                    flush=True,
                )
                time.sleep(retry_delay)

        raise RuntimeError("Gemini embedding retry loop ended unexpectedly.")

    def embed_documents(self, texts):
        embeddings = []
        for start in range(0, len(texts), self.batch_size):
            batch = texts[start : start + self.batch_size]
            batch_embeddings = self._embed_with_retry(
                lambda batch=batch: self.embeddings.embed_documents(
                    batch,
                    batch_size=len(batch),
                )
            )
            embeddings.extend(batch_embeddings)
        return embeddings

    def embed_query(self, text):
        return self._embed_with_retry(lambda: self.embeddings.embed_query(text))


def get_embeddings():
    return RateLimitedEmbeddings(
        GoogleGenerativeAIEmbeddings(model=GEMINI_EMBEDDING_MODEL)
    )