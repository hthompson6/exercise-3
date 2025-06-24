import requests
from typing import List

from bs4 import BeautifulSoup
import httpx
from pydantic import TypeAdapter

from sbir_loader.etl.schema import SolicitationSchema

SolicitationListAdapter = TypeAdapter(List[SolicitationSchema])

MAX_PAGE_SIZE = 10


def fetch_solicitations_stream(api_url: str, limit=10, max_records: int | None = None):
    if limit > MAX_PAGE_SIZE:
        raise ValueError(f"API limit exceeded: max 'rows' value is {MAX_PAGE_SIZE}, got {limit}")
    
    max_pages = (max_records // limit + 1) if max_records else float("inf")
    fetched = 0

    with httpx.Client() as client:
        for page in range(int(max_pages)):
            params = [("rows", limit), ("start", page * limit)]
            r = client.get(api_url, params=params)
            r.raise_for_status()

            data = r.json()
            batch = SolicitationListAdapter.validate_python(data)

            if not batch:
                break

            yield batch

            fetched += len(batch)
            if max_records and fetched >= max_records:
                break

            if len(batch) < limit:
                break

def fetch_and_clean_html(url: str) -> str:
    """Download HTML content and return plain cleaned text."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        return text
    except Exception as e:
        print(f"[WARN] Failed to fetch or clean HTML from {url}: {e}")
        return ""



# embedding_model = HuggingFaceEmbeddings(
#     model_name="sentence-transformers/all-MiniLM-L6-v2"
# )

# def chunk_document(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
#     """Split long text into overlapping chunks for embedding."""
#     return chunk_text(text, chunk_size=chunk_size, overlap=overlap)


# def get_embeddings(chunks: list[str]) -> list[list[float]]:
#     """Generate vector embeddings for a list of text chunks."""
#     return embedding_model.embed_documents(chunks)