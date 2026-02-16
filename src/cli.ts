import process from "node:process";
import { getVersion } from "./index";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(getVersion() + "\n");
    return;
  }

  process.stderr.write("CTXLOC_ERR INVALID_INPUT: command not implemented yet\n");
  process.exit(1);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`CTXLOC_ERR IO: ${message}\n`);
  process.exit(1);
});
