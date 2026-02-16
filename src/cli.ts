import process from "node:process";
import { parseArgs } from "node:util";
import { createCtxbinRemoteStore } from "./ctxbin-remote";
import { formatError, fail } from "./errors";
import { inferCtxKey } from "./git";
import { resolveSaveInput } from "./input";
import { createLocalStore } from "./local-store";
import { extractMetadata, formatMetadataBlock, injectMetadata, stripMetadata } from "./metadata";
import { planSync } from "./sync-core";
import { getVersion } from "./version";

type CliOptions = {
  append: boolean;
  meta: boolean;
  by?: string;
  file?: string;
  value?: string;
};

async function main(): Promise<void> {
  let positionals: string[];
  let values: Record<string, unknown>;

  try {
    ({ positionals, values } = parseArgs({
      args: process.argv.slice(2),
      options: {
        append: { type: "boolean" },
        meta: { type: "boolean" },
        by: { type: "string" },
        file: { type: "string" },
        value: { type: "string" },
        version: { type: "boolean", short: "v" },
        help: { type: "boolean", short: "h" },
      },
      allowPositionals: true,
    }));
  } catch (err) {
    return fail("INVALID_INPUT", err instanceof Error ? err.message : "invalid arguments");
  }

  if (values.version) {
    process.stdout.write(getVersion() + "\n");
    return;
  }

  const opts: CliOptions = {
    append: Boolean(values.append),
    meta: Boolean(values.meta),
    by: values.by as string | undefined,
    file: values.file as string | undefined,
    value: values.value as string | undefined,
  };

  const [resource, command, keyArg, ...extra] = positionals;

  if (values.help || resource === "help") {
    if (resource === "help" && (command || keyArg || extra.length > 0)) {
      return fail("INVALID_INPUT", "help does not accept additional arguments");
    }
    printHelp();
    return;
  }

  if (!resource) {
    return fail("INVALID_INPUT", "missing resource");
  }

  if (resource === "sync") {
    if (command || keyArg || extra.length > 0) {
      return fail("INVALID_INPUT", "sync does not accept positional arguments");
    }
    ensureNoSyncFlags(opts);
    await handleSync();
    return;
  }

  if (resource !== "ctx") {
    return fail("INVALID_INPUT", `unknown resource: ${resource}`);
  }

  if (!command) {
    return fail("INVALID_INPUT", "missing command");
  }
  if (extra.length > 0) {
    return fail("INVALID_INPUT", "too many positional arguments");
  }

  const store = createLocalStore();

  if (command === "list") {
    if (keyArg) return fail("INVALID_INPUT", "list does not accept a key");
    ensureNoListFlags(opts);
    await handleList(store);
    return;
  }

  const key = keyArg ?? (await inferCtxKey());

  switch (command) {
    case "load":
      ensureNoLoadInputFlags(opts);
      await handleLoad(store, key, opts.meta);
      return;
    case "save":
      await handleSave(store, key, opts);
      return;
    case "delete":
      ensureNoDeleteFlags(opts);
      await handleDelete(store, key);
      return;
    default:
      return fail("INVALID_INPUT", `unknown command: ${command}`);
  }
}

async function handleLoad(
  store: ReturnType<typeof createLocalStore>,
  key: string,
  showMeta: boolean
): Promise<void> {
  const value = await store.get(key);
  if (value === null) {
    return fail("NOT_FOUND", `no value for ctx:${key}`);
  }

  if (!showMeta) {
    process.stdout.write(stripMetadata(value));
    return;
  }

  const meta = extractMetadata(value);
  const body = stripMetadata(value);
  if (meta) {
    process.stdout.write(formatMetadataBlock(meta) + body);
  } else {
    process.stdout.write(body);
  }
}

async function handleSave(store: ReturnType<typeof createLocalStore>, key: string, opts: CliOptions): Promise<void> {
  const input = await resolveSaveInput({ file: opts.file, value: opts.value });

  if (opts.append) {
    const existing = await store.get(key);
    const existingBody = existing ? stripMetadata(existing) : "";
    const merged = existing ? `${existingBody}\n\n${input.value}` : input.value;
    await store.set(key, injectMetadata(merged, buildMetadata(opts.by)));
    return;
  }

  await store.set(key, injectMetadata(input.value, buildMetadata(opts.by)));
}

async function handleDelete(store: ReturnType<typeof createLocalStore>, key: string): Promise<void> {
  await store.delete(key);
}

async function handleList(store: ReturnType<typeof createLocalStore>): Promise<void> {
  const entries = await store.list();
  if (entries.length === 0) return;
  process.stdout.write(entries.map((entry) => `${entry.key}\t--value`).join("\n") + "\n");
}

async function handleSync(): Promise<void> {
  const localStore = createLocalStore();
  const remoteStore = createCtxbinRemoteStore();

  const localEntries = await localStore.list();
  const remoteEntries = await remoteStore.list();
  const planned = planSync(localEntries, remoteEntries);

  let appliedLocal = 0;
  let appliedRemote = 0;

  try {
    for (const op of planned.operations) {
      if (!op.winningValue) continue;
      if (op.writeLocal) {
        await localStore.set(op.key, op.winningValue);
        appliedLocal += 1;
      }
      if (op.writeRemote) {
        await remoteStore.set(op.key, op.winningValue);
        appliedRemote += 1;
      }
    }
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return fail(
      "IO",
      `sync apply failed after remote_to_local=${appliedLocal}, local_to_remote=${appliedRemote}: ${reason}`
    );
  }

  process.stdout.write(formatSyncSummary(planned.stats));
}

function formatSyncSummary(stats: {
  scanned: number;
  localToRemote: number;
  remoteToLocal: number;
  conflicts: number;
  skipped: number;
}): string {
  return [
    `scanned: ${stats.scanned}`,
    `local_to_remote: ${stats.localToRemote}`,
    `remote_to_local: ${stats.remoteToLocal}`,
    `conflicts: ${stats.conflicts}`,
    `skipped: ${stats.skipped}`,
  ].join("\n") + "\n";
}

function buildMetadata(by?: string): { savedAt: string; by?: string } {
  const meta: { savedAt: string; by?: string } = { savedAt: new Date().toISOString() };
  if (by) {
    meta.by = by;
  }
  return meta;
}

function ensureNoLoadInputFlags(opts: CliOptions): void {
  if (opts.append || opts.by || opts.file || opts.value) {
    return fail("INVALID_INPUT", "load does not accept input flags");
  }
}

function ensureNoDeleteFlags(opts: CliOptions): void {
  if (opts.append || opts.meta || opts.by || opts.file || opts.value) {
    return fail("INVALID_INPUT", "delete does not accept input flags");
  }
}

function ensureNoListFlags(opts: CliOptions): void {
  if (opts.append || opts.meta || opts.by || opts.file || opts.value) {
    return fail("INVALID_INPUT", "list does not accept input flags");
  }
}

function ensureNoSyncFlags(opts: CliOptions): void {
  if (opts.append || opts.meta || opts.by || opts.file || opts.value) {
    return fail("INVALID_INPUT", "sync does not accept flags");
  }
}

function printHelp(): void {
  process.stdout.write(
    [
      "ctxloc usage",
      "",
      "ctxloc ctx load [key] [--meta]",
      "ctxloc ctx save [key] [--file <path> | --value <text> | stdin] [--append] [--by <actor>]",
      "ctxloc ctx delete [key]",
      "ctxloc ctx list",
      "ctxloc sync",
      "ctxloc --version",
    ].join("\n") + "\n"
  );
}

main().catch((err) => {
  process.stderr.write(formatError(err) + "\n");
  process.exit(1);
});
