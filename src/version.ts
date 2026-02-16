import path from "node:path";
import { readFileSync } from "node:fs";

export function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const raw = readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(raw) as { version?: string };
    if (typeof pkg.version === "string") return pkg.version;
  } catch {
    // ignore
  }
  return "0.0.0";
}
