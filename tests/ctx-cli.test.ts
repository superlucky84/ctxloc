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

function countStoreEntryFiles(storePath) {
  try {
    return fs
      .readdirSync(storePath)
      .filter((fileName) => fileName.endsWith(".ctx"))
      .length;
  } catch (err) {
    if (err && err.code === "ENOENT") return 0;
    throw err;
  }
}

test("ctx save/load/list/delete flow with explicit key", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const env = { CTXLOC_STORE_PATH: storePath };

  let result = runCli(["ctx", "save", "demo/main", "--value", "hello"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(countStoreEntryFiles(storePath), 1);

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
  assert.equal(countStoreEntryFiles(storePath), 2);

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
  assert.equal(countStoreEntryFiles(storePath), 1);

  result = runCli(["ctx", "load", "demo/main"], { env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR NOT_FOUND/);
});

test("ctx key inference uses package.json name in git repository", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
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

test("ctx commands fail fast on malformed local store entry filename", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  fs.mkdirSync(storePath, { recursive: true });
  fs.writeFileSync(path.join(storePath, "not-base64!.ctx"), "x", "utf8");

  const result = runCli(["ctx", "list"], { env: { CTXLOC_STORE_PATH: storePath } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR IO: invalid key filename in store/);
});

test("help and --help print bundled ctxloc skill", () => {
  let result = runCli(["help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /name: ctxloc/);
  assert.match(result.stdout, /# ctxloc Skill/);

  result = runCli(["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /name: ctxloc/);
  assert.match(result.stdout, /# ctxloc Skill/);
});

test("ctx save/load supports large payload via --file", () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const payloadPath = path.join(dir, "payload.md");
  const env = { CTXLOC_STORE_PATH: storePath };
  const payload = ("0123456789abcdef".repeat(16) + "\n").repeat(1024);
  fs.writeFileSync(payloadPath, payload, "utf8");

  let result = runCli(["ctx", "save", "big/main", "--file", payloadPath], { env });
  assert.equal(result.status, 0, result.stderr);

  result = runCli(["ctx", "load", "big/main"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, payload);
});

test("--missing is rejected for non-sync commands", () => {
  const result = runCli(["ctx", "list", "--missing", "copy"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR INVALID_INPUT: --missing is only valid for sync/);
});
