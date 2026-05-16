# jyablonski.dev

[![Website CI / CD Pipeline](https://github.com/jyablonski/site/actions/workflows/ci_cd.yaml/badge.svg)](https://github.com/jyablonski/site/actions/workflows/ci_cd.yaml) [![Quality](https://github.com/jyablonski/site/actions/workflows/quality.yaml/badge.svg)](https://github.com/jyablonski/site/actions/workflows/quality.yaml)

Personal site and blog built with [Astro](https://astro.build). The production build is a static site deployed to AWS S3 and served through CloudFront at https://jyablonski.dev

## Running the App

Use the Makefile commands below:

```bash
make setup   # install dependencies (npm ci)
make up      # dev server at http://localhost:4321
make down    # stop dev server on port 4321
```

To run tests:

```bash
make test
make e2e
```
