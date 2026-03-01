# DevContainer Reference

Containerized development environments for reproducible, secure agent workspaces.

---

## Why

Agents need environments that are **reproducible**, **isolated**, and **deterministic**.

- **Eliminates "works on my machine"**: Every agent session starts from the same known state. No drift between local setups, CI, and production.
- **Security isolation**: Autonomous agents execute arbitrary commands. A container boundary limits blast radius --- a malformed `rm -rf /` destroys a disposable container, not the host.
- **Deterministic toolchains**: Pinned language versions, locked dependencies, and pre-installed tools mean agents never waste cycles debugging environment mismatches.
- **Disposable by design**: Spin up, do work, tear down. No state leaks between sessions.

---

## What to Check

Detect existing devcontainer configuration in the repository:

```
.devcontainer/devcontainer.json          # Standard location
.devcontainer/Dockerfile                 # Custom container image
.devcontainer/docker-compose.yml         # Multi-service setups
.devcontainer/<name>/devcontainer.json   # Named configurations
```

Also check for related container config:

```
Dockerfile              # May indicate container awareness
docker-compose.yml      # Service dependencies
.docker/                # Docker configuration directory
```

If `.devcontainer/devcontainer.json` exists, the project already has container support. Evaluate its quality against the criteria below.

---

## Three Isolation Tiers

Not all containers are equal. Choose the tier that matches your threat model.

### Tier 1: DevContainer (VS Code Native)

**What**: Standard devcontainer spec. Supported by VS Code, GitHub Codespaces, and Copilot Workspace.

**Isolation**: Reproducible environment with shared filesystem. The container runs on the host and can mount host directories.

**Best for**: Development parity, consistent toolchains, team onboarding.

```
Host OS
 └── Docker
      └── DevContainer
           ├── Language runtime (pinned version)
           ├── Build tools, linters, formatters
           ├── Project source (mounted or cloned)
           └── Agent runs here
```

**Trade-off**: Filesystem sharing means the agent can access mounted host paths. Not a hard security boundary.

### Tier 2: Docker Sandboxes (microVM)

**What**: Fully isolated containers or microVMs with network-level controls. No shared filesystem --- code is cloned inside.

**Isolation**: Stronger. Network policies restrict egress. No host mounts.

**Best for**: Running untrusted code, CI/CD pipelines, multi-tenant agent platforms.

```
Host OS
 └── Docker / microVM runtime
      └── Sandbox container
           ├── Own filesystem (no host mounts)
           ├── Network firewall (egress restricted)
           ├── Code cloned inside
           └── Agent runs here
```

### Tier 3: claude-code-devcontainer

**What**: A purpose-built container image with firewall rules, pre-configured for Claude Code. Combines devcontainer ergonomics with sandbox-grade isolation.

**Isolation**: Container IS the security boundary. Firewall rules restrict network access. Pre-configured permissions.

**Best for**: Autonomous Claude Code sessions where the agent needs full tool access without host risk.

```
Host OS
 └── Docker
      └── claude-code-devcontainer
           ├── Claude Code pre-installed
           ├── Firewall rules (restrict egress)
           ├── --dangerously-skip-permissions is safe here
           └── Container IS the security boundary
```

**Key insight**: In a properly isolated container, `claude --dangerously-skip-permissions` is safe because the container itself is the security boundary. The agent has full autonomy inside a disposable, firewalled box.

---

## What Good Looks Like

### Node 20 TypeScript Project

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Node 20 TypeScript",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "postCreateCommand": "npm install",

  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

Why this works:
- **Official base image** with Node 20 and TypeScript pre-installed.
- **`postCreateCommand`** runs `npm install` once after container creation --- dependencies are ready before the agent starts.
- **Extensions** provide lint/format integration, not personal preferences.

### Python 3.12 Project

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Python 3.12",
  "image": "mcr.microsoft.com/devcontainers/python:3.12",

  "postCreateCommand": "pip install -e '.[dev]'",

  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "charliermarsh.ruff"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python"
      }
    }
  }
}
```

Why this works:
- **Editable install** (`pip install -e '.[dev]'`) so the agent can modify source and immediately test.
- **Ruff** for fast linting/formatting, configured as an extension.
- **Interpreter path** explicitly set --- no ambiguity about which Python.

### Multi-Feature Configuration

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Full Stack Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/python:1": {
      "version": "3.12"
    }
  },

  "postCreateCommand": "npm install && pip install -r requirements.txt",

  "forwardPorts": [3000, 5432],

  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "ms-python.python"
      ]
    }
  }
}
```

Why this works:
- **Features** install additional tools without a custom Dockerfile. GitHub CLI for PR workflows, Docker-in-Docker for containerized tests.
- **Port forwarding** makes services accessible during development.
- **Composable**: features layer on top of the base image.

### With Custom Dockerfile

```jsonc
// .devcontainer/devcontainer.json
{
  "name": "Custom Build",
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  },

  "postCreateCommand": "npm install",

  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint"
      ]
    }
  }
}
```

```dockerfile
# .devcontainer/Dockerfile
FROM mcr.microsoft.com/devcontainers/typescript-node:20

# System dependencies not available as features
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*
```

Use a custom Dockerfile only when you need system packages not available as devcontainer features.

---

## What to Generate

When a project lacks devcontainer config, generate one based on the detected stack:

### Detection Logic

| Signal | Stack | Base Image |
|--------|-------|------------|
| `package.json` + `tsconfig.json` | TypeScript/Node | `mcr.microsoft.com/devcontainers/typescript-node:20` |
| `package.json` (no tsconfig) | JavaScript/Node | `mcr.microsoft.com/devcontainers/javascript-node:20` |
| `pyproject.toml` or `setup.py` | Python | `mcr.microsoft.com/devcontainers/python:3.12` |
| `go.mod` | Go | `mcr.microsoft.com/devcontainers/go:1.22` |
| `Cargo.toml` | Rust | `mcr.microsoft.com/devcontainers/rust:latest` |
| `Gemfile` | Ruby | `mcr.microsoft.com/devcontainers/ruby:3.3` |
| `pom.xml` or `build.gradle` | Java | `mcr.microsoft.com/devcontainers/java:21` |

### postCreateCommand by Stack

| Stack | Command |
|-------|---------|
| Node (npm) | `npm install` |
| Node (pnpm) | `pnpm install` |
| Node (yarn) | `yarn install` |
| Python (pyproject.toml) | `pip install -e '.[dev]'` |
| Python (requirements.txt) | `pip install -r requirements.txt` |
| Go | `go mod download` |
| Rust | `cargo build` |
| Ruby | `bundle install` |

### Features to Include

Add features based on what the project uses:

| Project uses | Feature |
|-------------|---------|
| GitHub Actions, PRs | `ghcr.io/devcontainers/features/github-cli:1` |
| Docker builds | `ghcr.io/devcontainers/features/docker-in-docker:2` |
| AWS services | `ghcr.io/devcontainers/features/aws-cli:1` |
| Terraform | `ghcr.io/devcontainers/features/terraform:1` |
| kubectl | `ghcr.io/devcontainers/features/kubectl-helm-minikube:1` |

---

## Common Mistakes

### 1. Including personal IDE preferences

```jsonc
// BAD: personal keybindings and themes have no place here
{
  "customizations": {
    "vscode": {
      "settings": {
        "workbench.colorTheme": "Dracula",
        "editor.fontSize": 14,
        "vim.enable": true
      },
      "extensions": [
        "vscodevim.vim",
        "zhuangtongfa.material-theme"
      ]
    }
  }
}
```

```jsonc
// GOOD: only project-relevant tools
{
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

**Rule**: Extensions for linters, formatters, and language support are fine. Themes, keybindings, and personal workflow tools are not.

### 2. Forgetting postCreateCommand

```jsonc
// BAD: agent starts with no dependencies installed
{
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20"
}
```

```jsonc
// GOOD: dependencies ready before first command
{
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "postCreateCommand": "npm install"
}
```

Without `postCreateCommand`, the agent's first action is always `npm install`. This wastes time and can fail if the agent doesn't know the package manager.

### 3. Using a bloated base image

```jsonc
// BAD: full Ubuntu with everything, 2+ GB
{
  "image": "ubuntu:latest",
  "postCreateCommand": "apt-get update && apt-get install -y nodejs npm python3 ..."
}
```

```jsonc
// GOOD: purpose-built image, pre-configured
{
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20"
}
```

Official devcontainer images are optimized for development. They include the right tools at the right versions without bloat.

### 4. Hardcoding user-specific paths

```jsonc
// BAD: breaks for everyone who isn't Alice
{
  "mounts": [
    "source=/Users/alice/.ssh,target=/root/.ssh,type=bind"
  ]
}
```

Devcontainer config is checked into the repo. It must work for any user, any machine.

### 5. Not matching CI

```jsonc
// BAD: dev uses Node 20, CI uses Node 18
// devcontainer.json
{ "image": "mcr.microsoft.com/devcontainers/typescript-node:20" }
// ci.yml
// node-version: 18
```

Use the same major version in devcontainer and CI. The container should predict CI behavior, not contradict it.

### 6. Overusing custom Dockerfiles

If your only customization is installing a tool, check if a devcontainer feature exists first:

```jsonc
// BAD: custom Dockerfile just for GitHub CLI
// Dockerfile: RUN curl -fsSL ... | bash

// GOOD: use a feature
{
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

Features are composable, cacheable, and maintained by the community.

---

## Verification

After generating or modifying devcontainer config, verify it works:

### 1. Config Validity

```bash
# JSON must parse without errors
cat .devcontainer/devcontainer.json | python3 -m json.tool > /dev/null
```

### 2. Build Test

```bash
# Build the container (does not require VS Code)
devcontainer build --workspace-folder .
```

### 3. Lifecycle Test

```bash
# Start the container and run postCreateCommand
devcontainer up --workspace-folder .

# Verify the project builds inside the container
devcontainer exec --workspace-folder . npm run build

# Verify tests pass inside the container
devcontainer exec --workspace-folder . npm test
```

### 4. Feature Verification

```bash
# Verify installed features work
devcontainer exec --workspace-folder . gh --version
devcontainer exec --workspace-folder . docker --version
```

### 5. Quick Checklist

- [ ] `devcontainer.json` parses as valid JSON/JSONC
- [ ] Base image matches the project's primary language
- [ ] `postCreateCommand` installs all dependencies
- [ ] Language version matches CI configuration
- [ ] No personal IDE preferences in config
- [ ] No hardcoded user paths in mounts
- [ ] Features used instead of custom Dockerfile where possible
- [ ] Container builds successfully (`devcontainer build`)
- [ ] Project builds inside container (`npm run build` / `make` / etc.)
- [ ] Tests pass inside container
