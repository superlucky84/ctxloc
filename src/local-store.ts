import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fail } from "./errors";

export type StoreEntry = { key: string; value: string };

export interface CtxStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<StoreEntry[]>;
}

const STORE_PATH_ENV = "CTXLOC_STORE_PATH";
const ENTRY_FILE_EXT = ".ctx";

export function resolveStorePath(): string {
  const envPath = process.env[STORE_PATH_ENV];
  if (envPath && envPath.trim()) return envPath;
  return path.join(os.homedir(), ".ctxloc", "store");
}

export function createLocalStore(storePath: string = resolveStorePath()): CtxStore {
  return {
    async get(key: string): Promise<string | null> {
      return readEntryFile(entryPath(storePath, key));
    },
    async set(key: string, value: string): Promise<void> {
      await ensureStoreDir(storePath);
      await writeEntryFile(entryPath(storePath, key), value);
    },
    async delete(key: string): Promise<void> {
      await deleteEntryFile(entryPath(storePath, key));
    },
    async list(): Promise<StoreEntry[]> {
      const entries = await listEntryFiles(storePath);
      return entries.sort((a, b) => a.key.localeCompare(b.key));
    },
  };
}

function entryPath(storeDir: string, key: string): string {
  return path.join(storeDir, `${encodeKey(key)}${ENTRY_FILE_EXT}`);
}

function encodeKey(key: string): string {
  if (!key) {
    return fail("INVALID_INPUT", "ctx key must not be empty");
  }
  return Buffer.from(key, "utf8").toString("base64url");
}

function decodeKey(fileName: string, storeDir: string): string {
  if (!fileName.endsWith(ENTRY_FILE_EXT)) {
    return fail("IO", `invalid store entry filename: ${path.join(storeDir, fileName)}`);
  }

  const encoded = fileName.slice(0, -ENTRY_FILE_EXT.length);
  if (!encoded) {
    return fail("IO", `invalid store entry filename: ${path.join(storeDir, fileName)}`);
  }

  const decoded = Buffer.from(encoded, "base64url").toString("utf8");

  if (Buffer.from(decoded, "utf8").toString("base64url") !== encoded) {
    return fail("IO", `invalid key filename in store: ${path.join(storeDir, fileName)}`);
  }

  return decoded;
}

async function readEntryFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return null;
    return fail("IO", `failed to read store entry: ${filePath}`);
  }
}

async function deleteEntryFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return;
    return fail("IO", `failed to delete store entry: ${filePath}`);
  }
}

async function listEntryFiles(storeDir: string): Promise<StoreEntry[]> {
  let dirEntries: fs.Dirent[];
  try {
    dirEntries = await fs.readdir(storeDir, { withFileTypes: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    return fail("IO", `failed to read store directory: ${storeDir}`);
  }

  const out: StoreEntry[] = [];

  for (const dirEntry of dirEntries) {
    if (!dirEntry.isFile()) continue;
    if (!dirEntry.name.endsWith(ENTRY_FILE_EXT)) continue;

    const key = decodeKey(dirEntry.name, storeDir);
    const filePath = path.join(storeDir, dirEntry.name);

    let value: string;
    try {
      value = await fs.readFile(filePath, "utf8");
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "ENOENT") continue;
      return fail("IO", `failed to read store entry: ${filePath}`);
    }

    out.push({ key, value });
  }

  return out;
}

async function ensureStoreDir(storeDir: string): Promise<void> {
  try {
    await fs.mkdir(storeDir, { recursive: true, mode: 0o700 });
  } catch {
    return fail("IO", `failed to create store directory: ${storeDir}`);
  }
}

async function writeEntryFile(filePath: string, value: string): Promise<void> {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(
    dir,
    `.tmp-${path.basename(filePath)}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );

  try {
    await fs.writeFile(tmpPath, value, "utf8");
    await fs.rename(tmpPath, filePath);
  } catch {
    try {
      await fs.unlink(tmpPath);
    } catch {
      // ignore cleanup error
    }
    return fail("IO", `failed to write store entry: ${filePath}`);
  }
}
