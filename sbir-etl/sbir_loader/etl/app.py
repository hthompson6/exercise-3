import os
from flask import Flask
import click
from sqlalchemy.orm import Session

from sbir_loader.db.engine import engine
from sbir_loader.etl.fetcher import fetch_solicitations_stream
from sbir_loader.repository.solicitation import upsert_solicitations

app = Flask(__name__)

@app.cli.command("load-sbir")
def load_sbir():
    """Fetches and stores SBIR solicitations."""
    url = os.getenv("API_URL")
    total = 0

    with Session(engine) as session:
        for batch in fetch_solicitations_stream(url, limit=10, max_records=200):
            upsert_solicitations(session, batch)
            total += len(batch)
            print(f"Upserted batch of {len(batch)} (total so far: {total})")
    
    print(f"Loaded {total} solicitations.")