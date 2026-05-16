---
name: NBA ELT Pipeline
year: "2021 - present"
kind: Data platform
summary: An end-to-end NBA analytics platform with ingestion, dbt models, REST API, and a dashboard for season metrics, insights, and ML-powered win predictions, all hosted on cloud infrastructure.
tags: [Python, dbt, Terraform, AWS]
featured: true
site: https://nbadashboard.jyablonski.dev
repo: https://github.com/jyablonski/nba_elt_ingestion
---

## What it is

A personal, production-grade data platform for NBA season analytics: daily ingestion, SQL transformations, ML win predictions, a public REST API, and an interactive Dash dashboard. Infrastructure is Terraform-managed on AWS, with orchestration on Step Functions for near-zero cost.

Full architecture write-up: [NBA Project on Doqs](https://doqs.jyablonski.dev/architecture/nba_project/).

## What it does

- Ingests raw data from basketball-reference, DraftKings, Reddit, and (historically) Twitter into Postgres bronze tables, with S3 backups for redundancy
- Transforms data through a medallion architecture (bronze → silver → gold) using dbt, with dbt-expectations for data quality testing
- Predicts daily game win probabilities with a logistic regression model using recent team performance, rest days, and active injuries as features
- Serves gold marts through a Lambda-hosted REST API ([api.jyablonski.dev](https://api.jyablonski.dev)) and a Dash frontend ([nbadashboard.jyablonski.dev](https://nbadashboard.jyablonski.dev))
- Runs daily on a single pipeline (ingestion → dbt → ML), with feature flags that control which sources get scraped based on the season schedule

```mermaid
flowchart LR
  SRC[External sources]

  subgraph aws [AWS]
    SF[Step Functions]

    subgraph pipeline [Daily ECS pipeline]
      ING[Ingestion]
      DBT[dbt]
      ML[ML]
    end

    PG[(Postgres)]

    subgraph serve [User-facing]
      API[REST API]
      DASH[Dash dashboard]
    end
  end

  SRC --> ING
  SF -.-> pipeline
  ING --> PG
  PG --> DBT
  DBT --> PG
  PG --> ML
  ML --> PG
  PG --> API
  PG --> DASH
```

## Why I built it

I wanted a real end-to-end analytics product, not a notebook or a single script, with scheduling, testing, IAM, and something I could show in interviews. NBA data was a fun domain with messy sources, including APIs that block AWS IPs and force custom scraping solutions. Keeping monthly spend around $1 on the AWS free tier made cost discipline part of the design from day one.

## Tech stack

| Layer       | Tools                                                                                |
| ----------- | ------------------------------------------------------------------------------------ |
| Ingestion   | Python, Pandas, SQLAlchemy                                                           |
| Transform   | dbt, dbt-expectations, Postgres                                                      |
| ML          | Python, scikit-learn                                                                 |
| API         | FastAPI, AWS Lambda, CloudFront                                                      |
| Dashboard   | Dash, Plotly                                                                         |
| Infra       | Terraform (custom modules), ECS Fargate, Step Functions, RDS, S3                     |
| Shared libs | [jyablonski_common_modules](https://github.com/jyablonski/jyablonski_common_modules) |

Related repos: [dbt](https://github.com/jyablonski/nba_elt_dbt), [ML](https://github.com/jyablonski/nba_elt_mlflow), [REST API](https://github.com/jyablonski/nba_elt_rest_api), [Dash](https://github.com/jyablonski/nba_elt_dashboard), [Terraform](https://github.com/jyablonski/aws_terraform).
