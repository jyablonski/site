---
name: arc
year: "2026 - present"
kind: CLI tool
summary: Personal CLI for system management and maintenance on Arch Linux and macOS. One interface for ops tasks with safer defaults, consistent flags, and platform-native workflows.
tags: [Go, Arch Linux, macOS, CLI]
featured: false
repo: https://github.com/jyablonski/arc
---

## What it is

`arc` is a personal CLI for day-to-day maintenance across my Arch Linux and macOS machines: system updates, package hygiene, hardware info, AI tool usage tracking, and shared config sync across AI coding tools. One binary instead of a growing pile of shell aliases and one-off scripts.

It uses platform-native backends under a shared command surface: pacman, yay, systemd, and Linux hardware tools on Arch; Homebrew, pmset, system_profiler, and sysctl on macOS.

![arc ai usage output showing remaining quota across Claude, Codex, and Cursor](/images/projects/arc-ai-usage.png)

_Tracking usage windows across Claude, Codex, and Cursor in one place._

## What it does

| Command area | Examples                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------- |
| Updates      | `arc update system`, `arc update self`, `arc update uv`                                     |
| Cleanup      | `arc clean --orphans-only`                                                                  |
| Packages     | `arc packages --top 25 --json`, `arc search neovim`, `arc installed --aur-only` (Arch-only) |
| System       | `arc info`, `arc parts`, `arc sleep`                                                        |
| Cloud / AI   | `arc aws rotate-keys`, `arc ai usage`                                                       |
| Shared tools | `arc skills sync`, `arc rules sync`                                                         |

On Arch, package and system commands use pacman, yay, paccache, and systemd. On macOS, the same command surface uses Homebrew, pmset, system_profiler, and sysctl where appropriate. `arc update system`, `arc clean`, `arc packages`, `arc installed`, `arc parts`, and `arc sleep` dispatch to platform-specific implementations.

Consistent flag parsing across commands, colored help text, JSON output where it's useful, and guardrails before anything destructive runs.

The `skills` and `rules` commands sync a single canonical set of AI tool configs to Claude, Codex, Cursor, and OpenCode, so I can edit a skill once and have it reflected everywhere instead of maintaining four near-identical copies.

![arc skills list output showing canonical skills synced to Claude, Codex, Cursor, and OpenCode](/images/projects/arc-skills-list.png)

## Why I built it

The process of running system updates, cleaning up old packages / caches, or checking my AI tool usage across multiple platforms became cumbersome for me. I wanted to build a single interface to standardize and simplify these tasks whether I'm on my Arch desktop or my personal or work Macbook.

```bash
# Before
sudo pacman -Syu && yay -Syu --aur && sudo paccache -rv
aws sts get-caller-identity && aws iam create-access-key --user-name "$USER" && aws configure
# no single place to check ai tool usage

# After
arc update system
arc aws rotate-keys
arc ai usage
```

## Tech stack

- Language: Go
- CLI framework: Cobra
- Distribution: GitHub Releases
- Targets: Arch Linux and macOS

## What I learned

- Go is the right choice for these CLI apps, it compiles into a single binary with no runtime dependencies and has great cross-compilation support.
- Self-update functionality is a must-have, not a nice-to-have. Shipping `arc update self` meaningfully reduced friction for a tool I touch and update consistently across multiple devices.
- Centralizing AI tool configs was the highest-leverage feature. I can manage a single canonical set of skills across Claude, Codex, Cursor, and OpenCode, and easily monitor my usage across them in one place.
