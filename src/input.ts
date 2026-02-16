import fs from "node:fs/promises";
import process from "node:process";
import { fail } from "./errors";

export type SaveInput = { value: string };

export interface SaveOptions {
  file?: string;
  value?: string;
}

export async function resolveSaveInput(
  opts: SaveOptions,
  stdinIsTTY: boolean = Boolean(process.stdin.isTTY)
): Promise<SaveInput> {
  const hasFile = typeof opts.file === "string";
  const hasValue = typeof opts.value === "string";
  const explicitCount = [hasFile, hasValue].filter(Boolean).length;
  const hasStdin = !stdinIsTTY && explicitCount === 0;
  const methods = explicitCount + (hasStdin ? 1 : 0);

  if (methods !== 1) {
    return fail("INVALID_INPUT", "exactly one input method must be used");
  }

  if (hasFile) {
    const content = await fs.readFile(opts.file as string, "utf8");
    return { value: content };
  }

  if (hasValue) {
    return { value: opts.value as string };
  }

  return { value: await readStdin() };
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}
