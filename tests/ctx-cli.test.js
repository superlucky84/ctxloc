const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.resolve(__dirname, "..", "dist", "cli.js");

function runCli(args, opts = {}) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], {
    encoding: "utf8",
    env: { ...process.env, ...(opts.env || {}) },
    cwd: opts.cwd,
    input: opts.input,
  });
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ctxloc-test-"));
}

test("ctx save/load/list/delete flow with explicit key", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store.json");
  const env = { CTXLOC_STORE_PATH: storePath };

  let result = runCli(["ctx", "save", "demo/main", "--value", "hello"], { env });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "load", "demo/main"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "hello");

  result = runCli(["ctx", "load", "demo/main", "--meta"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /savedAt:/);
  assert.match(result.stdout, /---\nhello$/);

  result = runCli(["ctx", "save", "demo/main", "--append", "--value", "world"], { env });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "load", "demo/main"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "hello\n\nworld");

  result = runCli(["ctx", "save", "demo/zzz", "--value", "v2"], { env });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "list"], { env });
  assert.equal(result.status, 0, result.stderr);
  const listedKeys = result.stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\t")[0]);
  assert.deepEqual(listedKeys, ["demo/main", "demo/zzz"]);

  result = runCli(["ctx", "delete", "demo/main"], { env });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "load", "demo/main"], { env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR NOT_FOUND/);
});

test("ctx key inference uses package.json name in git repository", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store.json");
  const repoDir = path.join(dir, "repo");
  fs.mkdirSync(repoDir);
  fs.writeFileSync(path.join(repoDir, "package.json"), JSON.stringify({ name: "demo-pkg" }), "utf8");

  let result = spawnSync("git", ["init", "-b", "main"], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  result = spawnSync("git", ["config", "user.email", "test@example.com"], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  result = spawnSync("git", ["config", "user.name", "Ctxloc Test"], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  fs.writeFileSync(path.join(repoDir, "README.md"), "# test\n", "utf8");
  result = spawnSync("git", ["add", "."], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  result = spawnSync("git", ["commit", "-m", "init"], { cwd: repoDir, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);

  const env = { CTXLOC_STORE_PATH: storePath };
  result = runCli(["ctx", "save", "--value", "auto-key"], { env, cwd: repoDir });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "list"], { env, cwd: repoDir });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^demo-pkg\/main\t--value$/m);
});

test("ctx commands fail fast on malformed local store JSON", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store.json");
  fs.writeFileSync(storePath, "{invalid-json", "utf8");

  const result = runCli(["ctx", "list"], { env: { CTXLOC_STORE_PATH: storePath } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR IO: invalid JSON in store file/);
});
