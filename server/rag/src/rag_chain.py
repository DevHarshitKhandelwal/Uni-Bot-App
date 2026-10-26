# from src.llm import get_llm
# from src.prompt import get_prompt
# import re

# class RAGChain:

#     def __init__(self, retriever, llm):

#         self.retriever = retriever
#         self.llm = llm
#         self.prompt = get_prompt()

#     def ask(self, question):

#         documents = self.retriever.retrieve(
#             question
#         )

#         context = "\n\n".join(
#             f"[Context {i+1}]\n{doc.page_content}"
#             for i, doc in enumerate(documents)
#         )

#         messages = self.prompt.format_messages(
#             context=context,
#             question=question
#         )

#         response = self.llm.invoke(messages)

#         sources = [
#             {
#                 "source": doc.metadata.get("source"),
#                 "page": doc.metadata.get("page")
#             }
#             for doc in documents
#         ]

#         return response.content, documents ,sources

import re

from langchain_core.documents import Document
from src.prompt import get_prompt

def clean_context(text):
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def format_document(index, document):
    source = document.metadata.get("source", "University document")
    page = document.metadata.get("page")
    location = f", page {page}" if page else ""
    return f"[Context {index} | {source}{location}]\n{clean_context(document.page_content)}"


class RAGChain:

    def __init__(self, retriever, llm):
        self.retriever = retriever
        self.llm = llm
        self.prompt = get_prompt()

    def ask(self, question, supplemental_context=None, retrieve=True, llm=None):
        documents = self.retriever.retrieve(question) if retrieve else []
        documents.extend(
            Document(
                page_content=item["content"],
                metadata={
                    "source": item["source"],
                    "page": item.get("page"),
                    "fileUrl": item.get("fileUrl", ""),
                },
            )
            for item in (supplemental_context or [])
            if item.get("content")
        )

        context = "\n\n".join(
            format_document(i + 1, doc) for i, doc in enumerate(documents)
        )

        messages = self.prompt.format_messages(
            context=context,
            question=question
        )

        response = (llm or self.llm).invoke(messages)
        content = response.content
        if isinstance(content, list):
            answer = "\n".join(
                block.get("text", "") if isinstance(block, dict) else str(block)
                for block in content
            ).strip()
        else:
            answer = str(content)

        sources = [
            {
                "source": doc.metadata.get("source"),
                "page": doc.metadata.get("page"),
                "snippet": clean_context(doc.page_content)[:240],
                "fileUrl": doc.metadata.get("fileUrl", ""),
            }
            for doc in documents
        ]

        return answer, sources