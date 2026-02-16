# <img src="https://superlucky84.github.io/ctxloc/ctxloc.png" alt="ctxloc" width="24" height="24" style="vertical-align: -4px; margin-right: 8px;" /> ctxloc

Local-first, deterministic CLI to save/load branch-scoped **ctx** and run bidirectional sync with remote ctx storage.

Docs: https://superlucky84.github.io/ctxloc/

> **Core idea:** keep working context local by default, then converge with remote storage only when needed.

## Agent workflow (core)

This is the most important usage. Let agents consistently save and load branch context.

### Option 1: Zero-setup (simplest)

Ask your AI agent directly:

```text
"Run `npx ctxloc help`, read the output, then save the current context."
```

### Option 2: Add-on snippet

For consistent behavior across sessions, use the add-on block from docs:

- Guide: https://superlucky84.github.io/ctxloc/#/guide/agent-addon
- Then ask:
  - "Use npx ctxloc to save the current context."
  - "Use npx ctxloc to load the current context."
  - "Run npx ctxloc sync."

## Relationship to ctxbin

- `ctxbin` is the remote-storage-oriented CLI.
- `ctxloc` is a companion focused on local `ctx` workflows + explicit sync.
- Sync entrypoint is `ctxloc sync` (not `ctxbin sync`).

GitHub:
- ctxloc: https://github.com/superlucky84/ctxloc
- ctxbin: https://github.com/superlucky84/ctxbin

## Features

- `ctx`-only command surface (`load`, `save`, `delete`, `list`)
- Local JSON store (`~/.ctxloc/store.json`) with atomic writes
- Git-based key inference (`{project}/{branch}`) matching ctxbin behavior
- Metadata-compatible value envelope (`ctxbin-meta@1`)
- Deterministic sync conflict rules (including legacy no-metadata handling)

## Install

Recommended (no install):

```bash
npx ctxloc --version
```

Or global install:

```bash
pnpm add -g ctxloc
```

## Quick Usage

### Save / Load ctx

```bash
# auto key inside git repo
npx ctxloc ctx save --value "summary / decisions / next"
npx ctxloc ctx load

# explicit key
npx ctxloc ctx save my-project/main --value "summary"
npx ctxloc ctx load my-project/main
```

### Append / List / Delete

```bash
npx ctxloc ctx save --append --value "more notes"
npx ctxloc ctx list
npx ctxloc ctx delete
```

### Metadata output

```bash
npx ctxloc ctx load --meta
```

## Sync Usage

```bash
npx ctxloc sync
```

### Remote credentials for sync

`ctxloc sync` resolves credentials in this order:

1. `CTXBIN_STORE_URL` and `CTXBIN_STORE_TOKEN`
2. `~/.ctxbin/config.json` (ctxbin fallback config)

Example:

```bash
export CTXBIN_STORE_URL="https://your-redis.upstash.io"
export CTXBIN_STORE_TOKEN="your-token"
npx ctxloc sync
```

## Sync conflict rules

Per key:

1. If one side only exists, copy it to the other side.
2. If both metadata parse, newer `savedAt` wins.
3. If one side has valid metadata and the other is legacy/no-metadata, metadata side wins.
4. If timestamps are equal but values differ, remote side wins (deterministic tie-break).

## Important constraints

- `ctxloc` supports only `ctx` and `sync`.
- `agent`/`skill` commands are intentionally unsupported.
- For `ctx` save input, exactly one method must be used:
  - `--value`
  - `--file`
  - stdin

## Built-in guide

```bash
npx ctxloc help
```

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
