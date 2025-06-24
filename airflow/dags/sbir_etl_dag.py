from airflow import DAG
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    "owner": "hthompson",
    "retries": 1,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    "sbir_etl",
    default_args=default_args,
    description="Run SBIR ETL with semantic enrichment",
    schedule_interval="0 2 * * *",  # Every day at 2 AM
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    run_etl = BashOperator(
        task_id="run_sbir_etl",
        bash_command=(
            "cd /opt/sbir-etl && "
            "~/.local/bin/poetry run flask --app sbir_loader/app.py load-sbir"
        )
    )