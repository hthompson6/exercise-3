# Alembic

Need to give path to the alembic file

poetry run alembic -c sbir_loader/db/alembic.ini revision --autogenerate -m "initial schema"

poetry run alembic -c sbir_loader/db/alembic.ini upgrade head