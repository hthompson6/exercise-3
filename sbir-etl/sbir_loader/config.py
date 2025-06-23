import os
from dotenv import load_dotenv

env_file = os.getenv("ENV_FILE", ".env")
load_dotenv(env_file)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in environment or .env file")


API_URL = os.getenv("API_URL")
if not API_URL:
    raise ValueError("API_URL must be set for the ETL to run")