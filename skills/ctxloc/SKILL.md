# ctxloc Skill

## Purpose
Use `ctxloc` to manage local branch-scoped `ctx` and run bidirectional sync with remote `ctxbin` storage.

## Scope
- `ctx` only (`agent` and `skill` are not supported in `ctxloc`)
- Local file-per-key storage plus explicit sync to remote `ctxbin`
- Sync entrypoint is `ctxloc sync` only

## Core Usage

### Save ctx
```bash
# Auto key: {project}/{branch}
npx ctxloc ctx save --value "summary / decisions / next"

# Explicit key
npx ctxloc ctx save my-project/main --value "summary / decisions / next"
```

### Load ctx
```bash
npx ctxloc ctx load
npx ctxloc ctx load my-project/main
```

### Load with metadata block
```bash
npx ctxloc ctx load --meta
```

### Append
```bash
npx ctxloc ctx save --append --value "extra notes"
```

### List / Delete
```bash
npx ctxloc ctx list
npx ctxloc ctx delete
npx ctxloc ctx delete my-project/main
```

## Sync

```bash
npx ctxloc sync
npx ctxloc sync --missing copy   # default
npx ctxloc sync --missing delete # delete one-sided keys
npx ctxloc sync --missing skip   # keep one-sided keys
```

Behavior:
- Compares local ctx store and remote `ctxbin` ctx store
- Missing-key policy is controlled by `--missing` (default: `copy`)
- For same key, newer `savedAt` wins
- If one side has valid metadata and the other side is legacy/no-metadata, metadata side wins
- If timestamps are equal but values differ, remote (`ctxbin`) wins
- Writes winner value to both sides to converge

## Key Inference
When key is omitted:
```text
key = {project}/{branch}
project = package.json name (fallback: folder name)
branch  = current git branch
```

## Recommended ctx format
```markdown
# summary
What changed and current status.

# decisions
Important decisions and trade-offs.

# open
Unresolved questions or blockers.

# next
Ordered next actions.

# risks
Potential issues to watch.
```

## Do Not
- Do not store secrets
- Do not assume `ctxbin sync` exists for this workflow
