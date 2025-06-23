import httpx
from typing import List
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