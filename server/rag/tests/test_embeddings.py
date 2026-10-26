import unittest
from unittest.mock import patch

from src.embeddings import RateLimitedEmbeddings


class FakeEmbeddings:
    def __init__(self, fail_once=False):
        self.calls = []
        self.fail_once = fail_once

    def embed_documents(self, texts, batch_size):
        self.calls.append((texts, batch_size))
        if self.fail_once:
            self.fail_once = False
            raise RuntimeError("429 RESOURCE_EXHAUSTED retry in 2s")
        return [[float(len(text))] for text in texts]

    def embed_query(self, text):
        return [float(len(text))]


class RateLimitedEmbeddingsTests(unittest.TestCase):
    def test_documents_are_batched(self):
        provider = FakeEmbeddings()
        embeddings = RateLimitedEmbeddings(
            provider,
            batch_size=2,
            requests_per_minute=75,
        )

        with patch("src.embeddings.time.sleep"):
            result = embeddings.embed_documents(
                ["one", "two", "three", "four", "five"]
            )

        self.assertEqual([len(call[0]) for call in provider.calls], [2, 2, 1])
        self.assertEqual([call[1] for call in provider.calls], [2, 2, 1])
        self.assertEqual(result, [[3.0], [3.0], [5.0], [4.0], [4.0]])

    def test_quota_error_is_retried(self):
        provider = FakeEmbeddings(fail_once=True)
        embeddings = RateLimitedEmbeddings(provider, requests_per_minute=75)

        with patch("src.embeddings.time.sleep") as sleep:
            result = embeddings.embed_documents(["one"])

        self.assertEqual(result, [[3.0]])
        self.assertEqual(len(provider.calls), 2)
        sleep.assert_any_call(3.0)

    def test_non_quota_error_is_not_retried(self):
        class FailingEmbeddings(FakeEmbeddings):
            def embed_documents(self, texts, batch_size):
                self.calls.append((texts, batch_size))
                raise RuntimeError("invalid API key")

        provider = FailingEmbeddings()
        embeddings = RateLimitedEmbeddings(provider, requests_per_minute=75)

        with patch("src.embeddings.time.sleep"):
            with self.assertRaisesRegex(RuntimeError, "invalid API key"):
                embeddings.embed_documents(["one"])

        self.assertEqual(len(provider.calls), 1)


if __name__ == "__main__":
    unittest.main()
