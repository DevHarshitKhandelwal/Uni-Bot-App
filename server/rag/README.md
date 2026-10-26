# UniBot RAG service

The Express chatbot calls this service for retrieval and answer generation. The service
uses Gemini chat and embedding models with `GEMINI_API_KEY` from `server/.env`. Its
knowledge-base documents are bundled from `server/rag/data/documents` and it builds the
FAISS index on startup. Docker Compose keeps the index in the `rag_vectorstore` volume.

The chat model defaults to `gemini-3.5-flash-lite`; set `GEMINI_CHAT_MODEL` in `server/.env`
to choose another supported model. Embeddings default to `models/gemini-embedding-001`
and can be configured through `GEMINI_EMBEDDING_MODEL`. Embedding requests are batched,
limited to 75 requests per minute, and retried on Gemini quota responses. Free-tier
availability still depends on the Google AI Studio account and selected models.
The HTTP service starts independently of index construction. `/health` reports
`ready: false` and `retryAfterSeconds` when indexing must wait for quota to reset.
If Gemini embedding quota is exhausted, the service still loads the documents and
uses BM25 retrieval. Chat generation can use either Gemini or OpenAI when their
respective API keys are configured in the service environment.
The `/chat` endpoint requires the shared `RAG_SERVICE_TOKEN`; keep it configured as a
secret in both the API and RAG service environments.

Start the application with `docker compose up --build`. The Node backend sends chatbot
requests to the RAG service over the Compose network. `/api/health` reports whether the
selected provider and knowledge base are ready. Chat requests return an explicit error if
the provider, documents, or RAG service is unavailable; they do not fall back to canned
answers.

For local development, run `uvicorn src.api:app --host 0.0.0.0 --port 8000` from
`server/rag`. The service loads `GEMINI_API_KEY` and `RAG_SERVICE_TOKEN` from
`server/.env`; set the same `RAG_SERVICE_TOKEN` and
`RAG_SERVICE_URL=http://localhost:8000` in the Node backend environment.
