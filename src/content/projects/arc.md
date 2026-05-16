---
name: arc
year: '2026 - present'
kind: CLI tool
summary: Personal CLI for system management and maintenance on Arch Linux. One interface for ops tasks with safer defaults and consistent flags.
tags: [Go, Linux]
featured: false
repo: https://github.com/jyablonski/arc
---

## What it is

`arc` is a personal CLI for day-to-day Arch Linux maintenance: system updates, package hygiene, hardware info, AWS key rotation, AI tool usage tracking, and shared config sync across AI coding tools. One binary instead of a growing pile of shell aliases and one-off scripts.

![arc ai usage output showing remaining quota across Claude, Codex, and Cursor](/images/projects/arc-ai-usage.png)

_Tracking usage windows across Claude, Codex, and Cursor in one place._

## What it does

| Command area | Examples                                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| Updates      | `arc update system`, `arc update self`, `arc update uv`                         |
| Cleanup      | `arc clean --orphans-only`                                                      |
| Packages     | `arc packages --top 25 --json`, `arc search neovim`, `arc installed --aur-only` |
| System       | `arc info`, `arc parts`, `arc sleep`                                            |
| Cloud / AI   | `arc aws rotate-keys`, `arc ai usage`                                           |
| Shared tools | `arc skills sync`, `arc rules sync`                                             |

Consistent flag parsing across commands, colored help text, JSON output where it's useful, and guardrails before anything destructive runs.

The `skills` and `rules` commands sync a single canonical set of AI tool configs to Claude, Codex, Cursor, and OpenCode, so I can edit a skill once and have it reflected everywhere instead of maintaining four near-identical copies.

![arc skills list output showing canonical skills synced to Claude, Codex, Cursor, and OpenCode](/images/projects/arc-skills-list.png)

## Why I built it

Maintenance commands were scattered across shell history, code comments, and one-off scripts. Tasks like full system upgrades, cache cleanup, or AWS key rotation are easy to get wrong once and annoying to remember correctly every time. `arc` encodes the happy path with clearer errors and consistent ergonomics.

```bash
# Before
sudo pacman -Syu && yay -Syu --aur && sudo paccache -rv
aws sts get-caller-identity && aws iam create-access-key --user-name "$USER" && aws configure

# After
arc update system
arc aws rotate-keys
```

## Tech stack

- Language: Go
- Distribution: GitHub Releases (`arc-linux-amd64`), `make install`, or `arc update self`
- Targets: Arch Linux (pacman, yay, AUR workflows)

## What I learned

- CLI UX compounds. Shared flag parsing, consistent help text, and predictable output matter as much as the underlying subprocess calls.
- Self-update is a must-have, not a nice-to-have. Shipping `arc update self` meaningfully reduced friction for a tool I touch weekly.
- Scope discipline pays off. One binary for "machine ops I actually run" beats a general-purpose framework I'd have to maintain forever.
- Centralizing AI tool configs was the highest-leverage feature. The skills and rules sync commands started as a small idea and ended up being the thing I use `arc` for most.
