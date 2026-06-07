---
name: Homelab
year: "2025 - present"
kind: Infrastructure
summary: K3s cluster managed with Helmfile for Home Assistant, monitoring, and personal services on Longhorn storage.
tags: [Kubernetes, Helm, Helmfile]
featured: true
repo: https://github.com/jyablonski/homelab
---

## What it is

My homelab is a single-node K3s cluster running on an old desktop with 32GB of RAM. It's managed with Helmfile, using a mix of third-party charts and a custom Helm chart for my in-house apps. The cluster runs Home Assistant for smart home device management, along with a monitoring stack of Prometheus, Grafana, Loki, and Promtail. Longhorn provides persistent storage for stateful workloads, and Traefik and MetalLB handle ingress and load balancing.

The main use case is a self-hosted environment for Home Assistant, which acts as the central hub for all of my smart home devices. Beyond that, it doubles as a low-stakes playground for learning Kubernetes, Helm, and cluster management.

## Why I built it

I've wanted hands-on experience with Kubernetes and Helm for a while. These are hard technologies to grok without real usage, and I've had a personal interest in smart home automation for a few years now. A homelab lets me get that experience with infrastructure I'd otherwise only touch at work, while giving me a place to run the smart devices I rely on day to day.

It's also where I learned the value of a golden path for deployments, which turned out to be the most useful idea to come out of the project. More on that below.

## Helm chart

Third-party charts are easy to deploy: you use them as-is and configure them through `values.yaml`. My own Python and Go apps are the harder case, since there's no off-the-shelf chart, and handwriting the K8s resources for each one gets painful and repetitive fast.

So I built a custom chart in `charts/app` that all of my in-house apps share. Helm renders a single `values.yaml` into everything an app needs, including Deployments, Services, Ingresses, PersistentVolumeClaims, and ServiceMonitors, with optional autoscaling, ingress, and persistent storage. To stand up something new, I just have to create a `Dockerfile` for it and set a few specific parameters in `values.yaml`:

```yaml
env:
  API_ENV: "production"
  API_LOG_LEVEL: "INFO"
  API_ROOT_PATH: "/api"

resources:
  requests:
    cpu: 25m
    memory: 128Mi
  limits:
    cpu: 250m
    memory: 256Mi

service:
  port: 8000

ingress:
  enabled: true
  className: traefik
  hosts:
    - host: apps.home
      paths:
        - path: /api
          pathType: Prefix

serviceMonitor:
  enabled: true
```

This pattern has been a huge time-saver and keeps my in-house apps consistent with each other. It's also the clearest takeaway I've carried into work, where I now make the case for the same golden-path approach and for self-hosting on Kubernetes over paid SaaS where it fits.

## What's next

The current single-node setup is enough to learn on, but it's a single point of failure and limited on resources. My plan is to expand the cluster to three mini PC nodes with 96GB of memory total. That gives me a real multi-node environment to work with and should help future-proof the cluster for anything I want to throw at it.

The bigger goal is to move my long-running personal apps off cloud infrastructure and onto the cluster. Right now those run on paid cloud services, and a three-node homelab gives me the capacity and redundancy to host them myself, cut recurring costs, and keep everything under the same golden-path deployment pattern I already use for my in-house apps.

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

- Treating Git as the source of truth has real advantages. It enforces discipline around configuration, secrets management, and reproducibility.
- Helmfile and Helm are powerful once they click. Working through them gave me much deeper confidence in self-hosting on Kubernetes.
- A golden path for deploying services is a must-have. The custom chart turned per-service Kubernetes boilerplate into a single `values.yaml`, which is the change that made everything else easier to build and maintain.
