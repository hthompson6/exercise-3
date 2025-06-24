import os
from flask import Flask, jsonify, request
import click
from sqlalchemy.orm import Session


from sbir_loader.db.engine import engine
from sbir_loader.etl.fetcher import fetch_solicitations_stream, fetch_and_clean_html#, chunk_document, get_embeddings
from sbir_loader.repository.solicitation import upsert_solicitations, insert_documents

app = Flask(__name__)


def run_sbir_etl():
    """Fetches and stores SBIR solicitations."""
    url = os.getenv("API_URL")
    total = 0

    with Session(engine) as session:
        for batch in fetch_solicitations_stream(url, limit=10, max_records=200):
            upsert_solicitations(session, batch)
            total += len(batch)
            print(f"Upserted batch of {len(batch)} (total so far: {total})")
    
            # for sol in batch:
            #     embed_solicitation(session, sol)

    print(f"Loaded {total} solicitations.")


# def embed_solicitation(session: Session, solicitation):
#     url = solicitation.solicitation_agency_url
#     if not url or not url.startswith("http"):
#         return

#     text = fetch_and_clean_html(url)
#     if not text:
#         return

#     chunks = chunk_document(text)
#     if not chunks:
#         return

#     embeddings = get_embeddings(chunks)
#     insert_documents(session, solicitation.id, chunks, embeddings)


@app.cli.command("load-sbir")
def load_sbir_command():
    """CLI entrypoint for loading solicitations"""
    run_sbir_etl()


@app.route("/load-sbir", methods=["POST"])
def load_sbir_endpoint():
    total = run_sbir_etl()
    return jsonify({"message": f"Loaded {total} solicitations."}), 200