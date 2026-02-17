import { spawn } from "node:child_process";
import { CtxlocError } from "./errors";

export type RemoteEntry = { key: string; value: string };

export interface RemoteCtxStore {
  list(): Promise<RemoteEntry[]>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

export function createCtxbinRemoteStore(): RemoteCtxStore {
  return {
    async list(): Promise<RemoteEntry[]> {
      const listOutput = await runCtxbinCommand(["ctx", "list"]);
      const keys = parseListOutput(listOutput.stdout);
      const entries: RemoteEntry[] = [];
      for (const key of keys) {
        const loaded = await runCtxbinCommand(["ctx", "load", key, "--raw"], undefined, {
          CTXBIN_SUPPRESS_RAW_WARN: "1",
        });
        entries.push({ key, value: loaded.stdout });
      }
      entries.sort((a, b) => a.key.localeCompare(b.key));
      return entries;
    },
    async set(key: string, value: string): Promise<void> {
      await runCtxbinCommand(["ctx", "save", key, "--raw"], value, {
        CTXBIN_SUPPRESS_RAW_WARN: "1",
      });
    },
    async delete(key: string): Promise<void> {
      await runCtxbinCommand(["ctx", "delete", key]);
    },
  };
}

function parseListOutput(output: string): string[] {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => line.split("\t")[0])
    .filter((key) => key.length > 0)
    .sort((a, b) => a.localeCompare(b));
}

async function runCtxbinCommand(
  args: string[],
  input?: string,
  envOverride?: Record<string, string>
): Promise<{ stdout: string; stderr: string }> {
  const bin = process.env.CTXLOC_CTXBIN_BIN?.trim() || "npx";
  const prefixRaw = process.env.CTXLOC_CTXBIN_ARGS?.trim();
  const prefix = prefixRaw ? splitArgs(prefixRaw) : ["ctxbin@latest"];
  return runProcess(bin, [...prefix, ...args], input, envOverride);
}

function splitArgs(value: string): string[] {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function runProcess(
  command: string,
  args: string[],
  input?: string,
  envOverride?: Record<string, string>
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...(envOverride ?? {}) },
      stdio: "pipe",
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("error", (err) => {
      reject(new CtxlocError("COMMAND", `failed to execute ctxbin command: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }
      const message = stderr.trim() || stdout.trim() || `exit code ${String(code)}`;
      reject(new CtxlocError("COMMAND", `ctxbin command failed: ${message}`));
    });

    if (typeof input === "string") {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}
