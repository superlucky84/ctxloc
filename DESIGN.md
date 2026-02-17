# ctxloc - Design Specification

## 1. Purpose

`ctxloc` is a Node.js CLI that mirrors `ctxbin` behavior for `ctx` data, but stores data locally instead of Upstash Redis.

Primary outcomes:

1. Keep the `ctx` command UX consistent with `ctxbin`.
2. Support only `ctx` resource operations.
3. Add deterministic bidirectional sync between local `ctxloc` storage and remote `ctxbin` storage.
4. Resolve conflicts by comparing metadata timestamps and keeping the newest value on both sides.
5. Keep `ctxbin` unaware of `ctxloc`; sync entrypoint is `ctxloc sync` only.

## 2. Scope and Non-Goals

In scope:

1. `ctx` commands: `load`, `save`, `delete`, `list`.
2. `sync` command for local <-> Upstash convergence.
3. Metadata compatibility with `ctxbin`.

Out of scope:

1. `agent` commands.
2. `skill` commands.
3. Semantic retrieval, embeddings, or RAG features.
4. Adding `sync` command support to `ctxbin`.

## 3. Runtime and Distribution

1. Runtime: Node.js 18+.
2. Execution model: `npx ctxloc ...`.
3. Cross-platform target: macOS, Linux, Windows.
4. Non-interactive command behavior (same philosophy as `ctxbin`).

## 4. Compatibility Contract with ctxbin

`ctxloc` must remain wire-compatible with `ctxbin` for `ctx` values.

Legacy note:

1. Early `ctxbin` records may exist without metadata envelope (`ctxbin-meta@1`).
2. Sync must treat these legacy raw values as metadata-missing values.

### 4.1 Value envelope

Stored `ctx` values must keep the exact metadata envelope format used by `ctxbin`:

```txt
ctxbin-meta@1
{"savedAt":"2026-02-16T14:20:31.123Z","by":"optional"}
---
<markdown body>
```

Rules:

1. `savedAt` is required and must be ISO-8601 UTC.
2. `by` is optional.
3. Metadata format version string must remain `ctxbin-meta@1` for interoperability.

### 4.2 Key inference parity

When `ctx` key is omitted, key inference must match `ctxbin` behavior:

1. Detect git root and current branch.
2. Use `package.json` `name` if present, otherwise git root folder name.
3. Build key as `{project}/{branch}`.

## 5. Local Storage Model

Local storage uses a file-per-key directory layout.

Default path:

1. `~/.ctxloc/store/`

File layout:

```text
~/.ctxloc/store/
  {base64url(key)}.ctx   # one file per key
```

Each `.ctx` file contains the raw ctx value (metadata envelope + body).

Write guarantees:

1. Use temp-file + atomic rename.
2. Create store directory automatically if missing.
3. Fail fast on I/O or filesystem errors.
4. Preserve UTF-8 content exactly.

## 6. CLI Surface

Supported commands:

1. `ctxloc ctx load [key] [--meta]`
2. `ctxloc ctx save [key] [--file|--value|stdin] [--append] [--by]`
3. `ctxloc ctx delete [key]`
4. `ctxloc ctx list`
5. `ctxloc sync`

Behavior notes:

1. Key omission is allowed only for `ctx`.
2. `save` always injects fresh metadata (`savedAt`, optional `by`).
3. `load` prints body by default and metadata+body when `--meta` is used.
4. `list` prints lexicographically sorted keys.
5. Sync is exposed only as `ctxloc sync`; `ctxbin sync` is intentionally unsupported.

## 7. Sync Architecture

Sync entrypoint policy:

1. `npx ctxloc sync`
2. `npx ctxbin sync` is not part of the design and must remain unsupported.

Recommended structure:

1. Shared core module: metadata parsing, comparison, and merge planning.
2. Local adapter: `ctxloc` file store.
3. Remote adapter: Upstash `ctx` hash (`ctxbin` backend).
4. Single command wrapper in `ctxloc` only.

Remote credentials resolution:

1. `CTXBIN_STORE_URL` and `CTXBIN_STORE_TOKEN`.
2. Fallback to `~/.ctxbin/config.json`.

## 8. Sync Semantics

### 8.1 Inputs

1. Local map: all `ctx` keys in `ctxloc`.
2. Remote map: all `ctx` fields in Upstash hash.

### 8.2 Merge key set

1. Compute union of local keys and remote keys.

### 8.3 Winner selection (per key)

1. If key exists only on one side, that side wins.
2. If both sides exist and raw value is identical, no-op.
3. If both metadata blocks parse and `savedAt` differs, newer timestamp wins.
4. If both metadata blocks parse and `savedAt` is equal but values differ, remote (`ctxbin`) wins.
5. If exactly one side has valid metadata, that side wins.
6. This includes legacy `ctxbin` values with no metadata header: the metadata-bearing side is always considered newer.
7. If neither side has valid metadata and values differ, remote (`ctxbin`) wins.

### 8.4 Write-back policy

1. Write winner value to both sides when needed.
2. Skip writes for already-converged side.
3. No delete propagation in sync.
4. Sync is idempotent: a second run after convergence should produce zero writes.

### 8.5 Output summary

`sync` must print a deterministic summary including:

1. Total keys scanned.
2. Local -> remote updates.
3. Remote -> local updates.
4. Conflict resolutions.
5. No-op/skipped keys.

## 9. Error Handling

1. Fail fast on remote access errors (network/auth/Upstash API failures).
2. Fail fast on local read/write/parse failures.
3. Build merge plan before applying writes.
4. On partial failure during apply, return non-zero exit and include counts of completed writes.

## 10. Security and Safety

1. Keep token handling in-memory only.
2. Never print secrets in errors.
3. Avoid destructive defaults; sync must not delete keys.
4. Prevent path traversal by fixed local store path resolution.

## 11. Test Strategy Overview

Unit tests:

1. Metadata parse/strip/inject behavior.
2. Key inference parity with `ctxbin`.
3. Winner selection matrix.
4. Merge plan determinism and idempotency.

Integration tests:

1. Local-only key propagation.
2. Remote-only key propagation.
3. Newer timestamp overwrite in both directions.
4. Same timestamp tie-break behavior.
5. Broken metadata fallback behavior.
6. Re-run stability (zero-change second run).
