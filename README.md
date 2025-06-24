# Present functionality
- [x] SBIR Solicitations available to users in web app
- [ ] Continuously ingest SBIR Solicitations
- [x] Ingest SBIR Solicitations
- [x] Store SBIR Solicitations in Postgres
- [x] Expose them via basic search functionality


# Search Limitations
- Title
- Program
- Agency
- Topic Descriptions

# TODOs - No JIRA board so...

## String Match Search
- [ ] Fix query time as it is very very poor. Caching could help, but also need better UX

## Semantic Search

- [x] Enable pgvector in Postgres automatically
- [x] Add to alembic ETL migrations
- [ ] Add schema models
- [x] Add embedding insertion to the repostory layer
- [ ] Pull in the HTML files if present in the solicitation_agency_url (In Progress)
- [ ] Split the embedding API out from the ETL
- [ ] Switch embedding model from local to OpenAI improve response time
- [ ] Use LLM or better yet standard NLP to create a brief title during ETL
- [ ] Manage rate-limit on the front-end since we have a semantic search
- [ ] Semantic metadata search
- [ ] Semantic file searching

## Continous Ingestion
- [x] Move from Flask Command to Endpoint
- [ ] Integrate with Apache Airflow

deprecated req
- [ ] Cronjob to provide continous ingesting (K8s job, lambda, etc)

## Others
- [x] There Docker images are wayyy to big; shrink them
    - Fixed RCA is context param scoped too wide
- [ ] Improve search experience via highlighting, different layout
- [ ] Webpage Obfuscation
- [ ] Authentication & Security layers (WAF, VPC private nets, bastions)
- [ ] Loadbalancing & Route53 DNS registry for frontend
- [ ] Aysnc pipeline w/ kafka for ETL layer
- [ ] Storage solution revisted postgres vs DynamoDB
- [ ] Caching...caching everywhere
- [x] Press "Enter" to search intead of needing to click button
- [x] Click table row to go to solicitation URL
- [ ] Add filtering for open/closed/time/etc
- [ ] Add sorting for columsn based on open
- [ ] Move is_open and is_close to one column (Why did I even do it this way...)
- [ ] Dockerize each app (In Progress)
- [ ] Analysis of horizontal vs vertical scaling
- [ ] Testing...so much testing needs to be written still.
    - [ ] Unit tests across the applications
    - [ ] Selenium for automated system testing
- [ ] Full-text Keyword searching
- [ ] Full-text Document Level Keyword Searching
- [ ] Beautify the readme
- [ ] Show initial page of results on load
- [ ] Logging and monitoring through the standard affair. ELK (really OLK) and Otel + Jaeger/Grafana/Prometheus
- [ ] Infra and arch diagrams for all of it
- [ ] Add linters for Python and actually run them for TypeScript apps



# Developer Environment Deployment

## Postgres (Run This First)

```sh
docker-compose up --build postgres
```

## Node App Front-End & API Server

### Installation

```sh
pnpm install
```

### Deployment
```sh
pnpm dev
```

## ETL

### Installation
```
poetry install
```

### Deployment
```
poetry run flask --app sbir_loader.etl.app load-sbir
```


# Dev Dependency Notes (Do Not Execute Unless You Know Why)

### Install airflow

pip install "apache-airflow[postgres]" --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.9.1/constraints-3.12.txt"

### Prisma

```sh
pnpm --filter @repo/database exec prisma generate
```


# Production Environment Deployment
- [ ] IaaS terraform scripts to deploy to AWS
- [ ] Security and role assn / pass via IAM