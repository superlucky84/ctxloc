import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fail } from "./errors";

type StoreData = {
  ctx: Record<string, string>;
};

export type StoreEntry = { key: string; value: string };

export interface CtxStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<StoreEntry[]>;
}

const STORE_PATH_ENV = "CTXLOC_STORE_PATH";

export function resolveStorePath(): string {
  const envPath = process.env[STORE_PATH_ENV];
  if (envPath && envPath.trim()) return envPath;
  return path.join(os.homedir(), ".ctxloc", "store.json");
}

export function createLocalStore(storePath: string = resolveStorePath()): CtxStore {
  return {
    async get(key: string): Promise<string | null> {
      const data = await readStoreData(storePath);
      return data.ctx[key] ?? null;
    },
    async set(key: string, value: string): Promise<void> {
      const data = await readStoreData(storePath);
      data.ctx[key] = value;
      await writeStoreData(storePath, data);
    },
    async delete(key: string): Promise<void> {
      const data = await readStoreData(storePath);
      delete data.ctx[key];
      await writeStoreData(storePath, data);
    },
    async list(): Promise<StoreEntry[]> {
      const data = await readStoreData(storePath);
      return Object.entries(data.ctx)
        .map(([key, value]) => ({ key, value }))
        .sort((a, b) => a.key.localeCompare(b.key));
    },
  };
}

async function readStoreData(storePath: string): Promise<StoreData> {
  let raw: string;
  try {
    raw = await fs.readFile(storePath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { ctx: {} };
    }
    return fail("IO", `failed to read store file: ${storePath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fail("IO", `invalid JSON in store file: ${storePath}`);
  }
  return normalizeStoreData(parsed, storePath);
}

function normalizeStoreData(parsed: unknown, storePath: string): StoreData {
  if (!parsed || typeof parsed !== "object") {
    return fail("IO", `invalid store shape in file: ${storePath}`);
  }

  const ctx = (parsed as { ctx?: unknown }).ctx;
  if (ctx === undefined) {
    return { ctx: {} };
  }
  if (!ctx || typeof ctx !== "object" || Array.isArray(ctx)) {
    return fail("IO", `invalid store shape in file: ${storePath}`);
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(ctx as Record<string, unknown>)) {
    if (typeof value !== "string") {
      return fail("IO", `invalid value type for key "${key}" in store file: ${storePath}`);
    }
    out[key] = value;
  }
  return { ctx: out };
}

async function writeStoreData(storePath: string, data: StoreData): Promise<void> {
  const dir = path.dirname(storePath);
  try {
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  } catch {
    return fail("IO", `failed to create store directory: ${dir}`);
  }

  const tmpPath = `${storePath}.tmp-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const body = JSON.stringify(data, null, 2);

  try {
    await fs.writeFile(tmpPath, body, "utf8");
    await fs.rename(tmpPath, storePath);
  } catch {
    try {
      await fs.unlink(tmpPath);
    } catch {
      // ignore cleanup error
    }
    return fail("IO", `failed to write store file: ${storePath}`);
  }
}
