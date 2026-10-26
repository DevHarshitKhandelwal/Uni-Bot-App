import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from src.api import ChatRequest, verify_rag_service_token


class RagServiceAuthTests(unittest.TestCase):
    def test_chat_requires_configured_service_token(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(HTTPException) as context:
                verify_rag_service_token("supplied")

        self.assertEqual(context.exception.status_code, 503)

    def test_chat_rejects_invalid_service_token(self):
        with patch.dict(os.environ, {"RAG_SERVICE_TOKEN": "expected"}):
            with self.assertRaises(HTTPException) as context:
                verify_rag_service_token("incorrect")

        self.assertEqual(context.exception.status_code, 401)

    def test_chat_accepts_valid_service_token(self):
        with patch.dict(os.environ, {"RAG_SERVICE_TOKEN": "expected"}):
            self.assertIsNone(verify_rag_service_token("expected"))

    def test_chat_provider_is_restricted(self):
        with self.assertRaises(ValueError):
            ChatRequest(question="hello", provider="other")


if __name__ == "__main__":
    unittest.main()
