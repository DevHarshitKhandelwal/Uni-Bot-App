from rank_bm25 import BM25Okapi

from src.config import TOP_K


class AdvancedRetriever:

    def __init__(self, documents, vectorstore):

        self.documents = documents
        self.vectorstore = vectorstore

        self.bm25 = BM25Okapi([doc.page_content.lower().split() for doc in documents])

    def mmr_search(self, query, k):

        retriever = self.vectorstore.as_retriever(
            search_type="mmr", search_kwargs={"k": k, "fetch_k": 60, "lambda_mult": 0.5}
        )

        return retriever.invoke(query)

    def bm25_search(self, query, k):

        scores = self.bm25.get_scores(query.lower().split())

        ranked = sorted(zip(self.documents, scores), key=lambda x: x[1], reverse=True)

        return [doc for doc, score in ranked[:k]]

    def reciprocal_rank_fusion(self, result_lists, k=60):

        scores = {}

        for result_list in result_lists:

            for rank, doc in enumerate(result_list):

                key = doc.page_content

                if key not in scores:

                    scores[key] = {"score": 0, "document": doc}

                scores[key]["score"] += 1 / (k + rank + 1)

        ranked = sorted(scores.values(), key=lambda x: x["score"], reverse=True)

        return [item["document"] for item in ranked]

    def rerank(self, question, documents, top_k=TOP_K):
        return documents[:top_k]

    def retrieve(self, question, top_k=TOP_K):

        candidate_k = 30

        mmr_results = self.mmr_search(question, candidate_k)
        bm25_results = self.bm25_search(question, candidate_k)

        fused_results = self.reciprocal_rank_fusion([mmr_results, bm25_results])

        return self.rerank(question, fused_results, top_k)


## RAG FUSION :-
# def generate_queries(self, question):

#         prompt = f"""
# Generate 3 different search queries for this university question.

# Original question:
# {question}

# Make each query focus on a slightly different way of finding
# the relevant information.

# Return only the queries, one per line.
# """

#         response = self.llm.invoke(prompt)

#         queries = response.content.split("\n")

#         queries = [q.strip() for q in queries if q.strip()]

#         return queries[:3]


# RETRIEVER FOR RAG FUSION :-
# def retrieve(self, question, top_k=4):

#         queries = self.generate_queries(question)

#         all_results = []

#         for query in queries:

#             mmr_results = self.mmr_search(query, k=5)

#             bm25_results = self.bm25_search(query, k=5)

#             all_results.append(mmr_results)
#             all_results.append(bm25_results)

#         fused_results = self.reciprocal_rank_fusion(all_results)

#         final_documents = self.rerank(question, fused_results, top_k)

#         return final_documents
