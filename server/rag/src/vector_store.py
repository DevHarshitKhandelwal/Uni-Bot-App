import os
import pickle
from langchain_community.vectorstores import FAISS
from src.embeddings import get_embeddings
from src.config import VECTOR_DB_DIR


def create_vector_store(documents):

    embeddings = get_embeddings()

    vectorstore = FAISS.from_documents(
        documents,
        embeddings
    )

    vectorstore.save_local(VECTOR_DB_DIR)

    with open(
        os.path.join(VECTOR_DB_DIR, "chunks.pkl"),
        "wb"
    ) as f:
        pickle.dump(documents, f)

    return vectorstore


def load_vector_store():
    if not all(
        os.path.isfile(os.path.join(VECTOR_DB_DIR, filename))
        for filename in ("index.faiss", "index.pkl")
    ):
        return None

    embeddings = get_embeddings()

    return FAISS.load_local(
        VECTOR_DB_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )


def load_documents_from_vectorstore():

    path = os.path.join(
        VECTOR_DB_DIR,
        "chunks.pkl"
    )

    if not os.path.exists(path):
        return None

    with open(path, "rb") as f:
        return pickle.load(f)