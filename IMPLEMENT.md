# ctxloc - Implementation Plan Checklist

## Working Rules

- [ ] Keep `ctx` behavior compatible with existing `ctxbin` semantics.
- [ ] Keep metadata envelope format exactly `ctxbin-meta@1`.
- [ ] Keep sync conflict resolution deterministic.
- [ ] Treat metadata-bearing value as winner against metadata-missing legacy value.
- [ ] Keep `ctxbin` unchanged and unaware of `ctxloc` sync features.
- [ ] Treat tests as release gates, not optional tasks.

## Phase 0 - Foundation and Contracts

### Implementation Checklist

- [ ] Create `ctxloc` package scaffold (`package.json`, `tsconfig`, build/test scripts, `src/` layout).
- [ ] Define shared domain interfaces for `StoreAdapter`, `SyncPlan`, `SyncStats`, and metadata structures.
- [ ] Freeze compatibility rules in constants (`META_HEADER`, separator, summary output keys).
- [ ] Add canonical fixtures for valid metadata, invalid metadata, and legacy raw values.

### Required Tests

- [ ] Verify metadata fixtures round-trip correctly (inject -> extract -> strip).
- [ ] Verify malformed metadata fixtures are rejected without crashing.
- [ ] Verify summary formatter is deterministic for the same input stats.

## Phase 1 - Shared Core Utilities

### Implementation Checklist

- [ ] Implement metadata utilities (`injectMetadata`, `extractMetadata`, `stripMetadata`).
- [ ] Implement timestamp comparator using ISO-8601 parsing with strict validation.
- [ ] Implement `ctx` key inference utility matching `ctxbin` behavior.
- [ ] Implement common error model and error formatting for `ctxloc`.

### Required Tests

- [ ] Metadata parser tests for missing separator, invalid JSON, and non-ISO timestamp.
- [ ] Timestamp compare tests for newer/older/equal and invalid input cases.
- [ ] Key inference parity tests:
- [ ] Case: `package.json` name present.
- [ ] Case: fallback to folder name.
- [ ] Case: not in git repo should fail.
- [ ] Error formatting tests must hide sensitive token values.

## Phase 2 - Local Store Adapter

### Implementation Checklist

- [ ] Implement JSON-backed local adapter with methods `get`, `set`, `delete`, `list`.
- [ ] Add bootstrapping logic to create `~/.ctxloc/store.json` on first write.
- [ ] Implement atomic writes via temp file + rename.
- [ ] Enforce lexicographic ordering for `list`.

### Required Tests

- [ ] Fresh install test: store file is created and writable.
- [ ] Corrupted JSON test: command fails fast with IO/parsing error.
- [ ] Atomicity test: interrupted write cannot leave partial JSON.
- [ ] `list` ordering test: keys are sorted consistently.
- [ ] UTF-8 preservation test for multilingual markdown bodies.

## Phase 3 - ctx Command Implementation in ctxloc

### Implementation Checklist

- [ ] Implement `ctxloc ctx load [key] [--meta]`.
- [ ] Implement `ctxloc ctx save [key]` with one input source rule (`--file`, `--value`, or stdin).
- [ ] Implement `--append` for string values.
- [ ] Implement `ctxloc ctx delete [key]`.
- [ ] Implement `ctxloc ctx list`.
- [ ] Wire key omission path to shared key inference logic.

### Required Tests

- [ ] `save` writes metadata header and body correctly.
- [ ] `load` default output strips metadata and prints body only.
- [ ] `load --meta` prints metadata + body in expected format.
- [ ] `save --append` merges existing body with `\n\n` separator.
- [ ] Invalid flag combinations return non-zero exit with correct error code.
- [ ] Key omission test succeeds in git repo and fails outside git repo.

## Phase 4 - Storage-Agnostic Sync Engine

### Implementation Checklist

- [ ] Implement sync planner that reads local and remote key maps.
- [ ] Implement union-key traversal and per-key winner selection.
- [ ] Implement deterministic tie-breaker rules.
- [ ] Produce explicit operation list (`setLocal`, `setRemote`, `skip`) before apply.
- [ ] Return structured stats object for CLI summary output.

### Required Tests

- [ ] Winner selection matrix test:
- [ ] local-only key.
- [ ] remote-only key.
- [ ] both valid metadata with newer local.
- [ ] both valid metadata with newer remote.
- [ ] same timestamp, different value.
- [ ] metadata-present vs metadata-missing legacy value (metadata side must win).
- [ ] one valid metadata vs one broken metadata.
- [ ] both broken metadata.
- [ ] Plan determinism test: same inputs generate byte-identical plans.
- [ ] Idempotency test: applying same converged state generates zero write operations.

## Phase 5 - `ctxloc sync` Command

### Implementation Checklist

- [ ] Implement remote Upstash adapter reuse path for reading/writing `ctx`.
- [ ] Implement credential resolution (`ENV` first, then `~/.ctxbin/config.json`).
- [ ] Wire `ctxloc sync` to shared sync engine and summary printer.
- [ ] Ensure non-zero exit on partial/failed apply.

### Required Tests

- [ ] ENV credential path test.
- [ ] Config-file fallback credential path test.
- [ ] Missing credentials test.
- [ ] End-to-end sync from divergent local/remote state converges in one run.
- [ ] End-to-end sync where remote has legacy raw ctx (no metadata) and local has metadata value; local must win and overwrite remote.
- [ ] Re-run sync test reports zero writes after convergence.

## Phase 6 - `ctxbin` Isolation Guarantee

### Implementation Checklist

- [ ] Do not add `sync` command support to `ctxbin`.
- [ ] Keep all sync orchestration code in `ctxloc` only.
- [ ] Keep remote communication protocol compatible with existing `ctxbin` storage (`ctx` hash + metadata format).
- [ ] Ensure existing `ctxbin` commands are not changed by `ctxloc` work.

### Required Tests

- [ ] `ctxbin` unsupported-command test: `ctxbin sync` must fail as unknown/unsupported command.
- [ ] Backward compatibility test for existing `ctxbin ctx load/save/delete/list`.
- [ ] Regression test for metadata behavior in `ctxbin` non-sync commands.
- [ ] `ctxloc sync` still converges correctly against Upstash data written by `ctxbin`.

## Phase 7 - Deep Test Hardening (Post-Major-Phase Reinforcement)

### Implementation Checklist

- [ ] Add stress suite for large key counts and large payloads.
- [ ] Add fault injection suite for network timeout and transient failures.
- [ ] Add local filesystem fault tests (permission denied, disk-full simulation, rename failure).
- [ ] Add repeated-run stability suite (`N` consecutive syncs on converged state).
- [ ] Add cross-platform newline and path-behavior checks.
- [ ] Add compatibility suite for legacy values without metadata.
- [ ] Add test reports and minimum quality gates for CI (coverage and pass thresholds).

### Required Tests

- [ ] Scale test with at least 10,000 keys and deterministic runtime/assertions.
- [ ] Property-like randomized state test for conflict resolver consistency.
- [ ] Partial failure recovery test confirms explicit failure reporting.
- [ ] Snapshot tests for summary output remain stable across runs.
- [ ] Long-run idempotency test (`sync` repeated at least 20 times) stays zero-change.

## Phase 8 - Release Readiness

### Implementation Checklist

- [ ] Update README with exact command examples and sync conflict rules.
- [ ] Add migration note for users moving between `ctxbin` and `ctxloc`.
- [ ] Add troubleshooting section for credential and metadata issues.
- [ ] Verify package `files`/`bin` fields and publish contents.

### Required Tests

- [ ] Full clean run: install -> build -> test -> packed artifact validation.
- [ ] Smoke test using packaged binary via `npx` in a temp project.
- [ ] Documentation command examples are executable and verified.
