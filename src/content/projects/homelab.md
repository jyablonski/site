---
name: Homelab
year: "2025 - present"
kind: Infrastructure
summary: K3s cluster managed with Helmfile for Home Assistant, monitoring, and personal services on Longhorn storage.
tags: [Kubernetes, Helm, Helmfile]
featured: true
repo: https://github.com/jyablonski/homelab
---

## Why I built it

I've been wanting to get more hands-on experience with Kubernetes and Helm since these are hard technologies to grok without real usage, and I've had a personal interest in smart home automation for a few years now.

Running my own homelab is a fun way to get that experience with infrastructure I'd otherwise only see at work. It gives me a place to run Home Assistant for the smart devices I rely on day to day, and a low-stakes playground for learning Kubernetes, Helm, and cluster management without the risk of breaking anything important.

Home Assistant is the primary hub that smart home devices connect to, and where they can all be managed in one place. Running it on my homelab means I can keep it up to date and customize it with add-ons and integrations without paying for a hosted solution.

For now I'm running a single-node cluster on an old desktop, but I plan to move to multiple Beelink nodes for more capacity, redundancy, and to future-proof the setup (~96GB of memory could run everything you'd ever want to throw at it in a homelab context).

## Tech stack

| Layer         | Tools                                               |
| ------------- | --------------------------------------------------- |
| Cluster       | K3s                                                 |
| Deploy        | Helmfile, Helm charts                               |
| Ingress / LB  | Traefik, MetalLB                                    |
| Storage       | Longhorn                                            |
| Observability | Prometheus, Grafana, Loki, Promtail                 |
| Secrets       | SOPS (Postgres credentials)                         |
| Apps          | Custom API and Django images in `apps/`             |
| CI            | `validate` workflow mirroring local `make validate` |

## What I learned

- Git as a source of truth has real advantages. It forces good discipline around configuration, secrets management, and reproducibility.
- Helmfile and Helm are powerful once you get familiar with them. I came out of this with much deeper confidence in self-hosting on Kubernetes, which I plan to use at work to advocate for self-hosting over paid SaaS where it makes sense.
- A golden path for deploying services is a must-have. I have a custom Helm chart that all of my in-house apps use, which means I can deploy a new service and configure autoscaling, ingress, and storage with a single `values.yaml`.
