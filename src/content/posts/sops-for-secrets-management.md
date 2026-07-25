---
title: "SOPS: Secrets Management Without Another Service"
seoTitle: Managing Secrets in Git with SOPS and age
date: 2026-07-26
updated: 2026-07-26
tags: [sops, infrastructure]
excerpt: How SOPS and age make encrypted files practical to keep in Git, where that simplifies secret management, and where the approach stops working.
draft: false
---

## The Problem

Managing secrets and other sensitive credentials in personal or team projects is a common challenge for developers.

- You could store them in an `.env` file, but a plaintext file should not be checked into Git. Keeping it up to date across developers and machines then becomes a manual process.
- GitHub Actions can store secrets, but each value still has to be added and updated there. The copy in CI can easily drift from the copy used locally.
- Cloud secret managers solve this problem, but add another service, authentication setup, and often extra costs.
- Self-hosted tools like HashiCorp Vault offer even more control, but are a much heavier operational lift than most small projects need.

SOPS fits cleanly between a plaintext `.env` file and a full secret-management service. It gives small projects and teams a lightweight way to store secrets next to the code that uses them without exposing the actual values.

## What Is SOPS?

[SOPS](https://github.com/getsops/sops) is an open-source tool for editing encrypted files. It supports YAML, JSON, and several other formats. Those encrypted files are designed to be checked into Git; the decrypted files are not.

For structured files, SOPS encrypts each value while leaving the property names readable. If a password changes, Git shows which encrypted value changed instead of treating the entire file as a new blob.

This allows the repository to become the single source of truth. Developers, CI/CD, and deployed applications can use the same encrypted file, and changes can go through the normal Git review process.

## How It Works

SOPS needs a way to encrypt and decrypt each file. Cloud key services can handle this, but [age](https://github.com/FiloSottile/age) is a simple option that works without any cloud dependencies.

age gives you two keys:

- A public key, which SOPS uses to encrypt the file. This can safely live in Git.
- A private key, which is needed to decrypt the file. This must remain secret.

Behind the scenes, SOPS creates a separate encryption key for each file, encrypts the values with it, and then protects that key with your age public key.

This design has a few useful advantages:

1. **Git diffs remain useful.** You can see which value changed, although not the old or new plaintext.
2. **The same workflow can grow with you.** A personal project can use age, while a larger deployment can use a cloud key service and its existing access controls.

SOPS does not completely remove the secret-distribution problem. A laptop, CI job, or application still needs a private age key or permission to use the cloud key. The win is that you can carefully manage one key instead of manually keeping dozens of secret values in sync.

## An Example With age

First, generate an age key:

```sh
age-keygen -o key.txt
```

This creates the private key in `key.txt` and prints the matching public key, which starts with `age1`. Do not commit `key.txt`. Store it somewhere protected and keep a recovery copy.

Next, add a `.sops.yaml` file at the root of the repository. It tells SOPS which files to encrypt and which public key to use:

```yaml
creation_rules:
  - path_regex: .*\.sops\.ya?ml$
    age: >-
      age1k3876j8v8anfwv58cnunwj7wpdjluynqkzw5futvedfy5dft9qssnjqgyz
```

The public key is safe to commit along with this configuration. Tell SOPS where the private key is stored:

```sh
export SOPS_AGE_KEY_FILE="$PWD/key.txt"
```

Then create or edit a secrets file:

```sh
sops edit secrets.sops.yaml
```

Your editor shows the normal values:

```yaml
postgres:
  username: app_user
  password: my_jenny_password_8675309
```

When you save and close the editor, an abbreviated version of the file on disk looks like this:

```yaml
postgres:
  username: ENC[AES256_GCM,data:Xtqxz/aK1QQ=,...]
  password: ENC[AES256_GCM,data:kdTzBj6BCnc=,...]
sops:
  age:
    - recipient: age1k3876j8v8anfwv58cnunwj7wpdjluynqkzw5futvedfy5dft9qssnjqgyz
      enc: |
        -----BEGIN AGE ENCRYPTED FILE-----
        ...
        -----END AGE ENCRYPTED FILE-----
```

The property names remain readable, but the values are encrypted. The `sops` section contains the information needed to decrypt the file.

To view the decrypted contents:

```sh
sops decrypt secrets.sops.yaml
```

> **Note:** Be careful with this command in CI because it prints the secrets.

## Where I Use It

I find SOPS especially useful in infrastructure repositories, where secrets often need to change alongside the configuration that uses them.

- **Kubernetes and Helmfile:** Helmfile has native `secrets` configuration and uses the `helm-secrets` plugin to decrypt and merge encrypted files with the normal Helm values during a deployment. This lets me keep credentials such as a Postgres password next to the rest of my homelab configuration without committing the plaintext.
- **Terraform:** I use SOPS to protect secret input files such as `.tfvars`, keeping them out of plaintext Git history, but I still have to secure the Terraform state separately because [Terraform may write those values into its plan or state](https://developer.hashicorp.com/terraform/language/manage-sensitive-data).

In Helmfile, I add an encrypted file under `secrets`:

```yaml
environments:
  default:
    secrets:
      - secrets.sops.yaml
```

With the [helm-secrets plugin](https://helmfile.readthedocs.io/en/stable/environments/) installed, Helmfile decrypts and merges the file when I run it.

## Things to Keep in Mind

There are a few things about SOPS to be aware of:

1. **Property names are still visible.** A name like `stripe_api_key` can reveal which services the project uses, although the source code often reveals the same thing.
2. **The private age key unlocks everything.** Anyone who gets it can decrypt every file that uses it, so keep it out of Git and back it up somewhere protected.
3. **Git remembers mistakes.** If a plaintext secret is committed once, encrypting it in a later commit does not remove it from Git history. Change the exposed credential immediately.
4. **age does not provide centralized access control or audit logs.** If you need to quickly revoke access or track every decryption, use a cloud key service or a dedicated secret manager.

### Shared or Individual Keys?

Some teams prefer a separate age key for each person so they can remove access to future versions when someone leaves. That requires updating and rotating every affected SOPS file, and the removed key can still decrypt old versions in Git.

**My take:** I do not think every project needs that overhead. Routine offboarding does not always mean rotating every secret someone could access, so pick the approach that works for your team.

## When to Use Something Else

SOPS is a strong fit for secrets that change occasionally and should be deployed alongside code: database credentials, API keys, etc.

It is not the right source for short-lived credentials. If a CI job can use [GitHub OpenID Connect](https://docs.github.com/en/actions/reference/security/oidc) to get temporary cloud access, that is better than storing a long-lived cloud key. If an application needs credentials created on demand, automatic expiration, immediate revocation, or detailed auditing, use a cloud secret manager or [Vault](https://developer.hashicorp.com/vault/docs/secrets).

The key takeaway is that SOPS is encrypted configuration in Git, not a running secret-management service. Within that boundary, it solves an awkward problem extremely well: one reviewed, versioned source of truth without another service to operate.
