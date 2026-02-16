const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = path.resolve(__dirname, "..");
  const src = path.join(root, "skills", "ctxloc", "SKILL.md");
  const pkgPath = path.join(root, "package.json");
  const distRoot = path.join(root, "dist");
  const destDir = path.join(root, "dist", "skills", "ctxloc");
  const dest = path.join(destDir, "SKILL.md");

  try {
    await fs.mkdir(distRoot, { recursive: true });
    await fs.mkdir(destDir, { recursive: true });
    const skillText = await fs.readFile(src, "utf8");
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    const frontmatter = [
      "---",
      "name: ctxloc",
      "description: Use when working with ctxloc to store local ctx and run ctxloc-only sync with ctxbin.",
      "metadata:",
      "  short-description: ctxloc workflow",
      `  version: ${pkg.version}`,
      "---",
      "",
      "",
    ].join("\n");
    await fs.writeFile(dest, frontmatter + skillText, "utf8");
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return;
    }
    throw err;
  }
}

main().catch((err) => {
  process.stderr.write(String(err) + "\n");
  process.exit(1);
});
