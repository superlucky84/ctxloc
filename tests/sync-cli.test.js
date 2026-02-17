const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const { injectMetadata } = require("../dist/index.js");

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
  return fs.mkdtempSync(path.join(os.tmpdir(), "ctxloc-sync-test-"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function localEntryPath(storeDir, key) {
  const encoded = Buffer.from(key, "utf8").toString("base64url");
  return path.join(storeDir, `${encoded}.ctx`);
}

function writeLocalEntries(storeDir, entries) {
  fs.mkdirSync(storeDir, { recursive: true });
  for (const [key, value] of Object.entries(entries)) {
    fs.writeFileSync(localEntryPath(storeDir, key), value, "utf8");
  }
}

function readLocalEntries(storeDir) {
  const out = {};
  const files = fs.existsSync(storeDir) ? fs.readdirSync(storeDir) : [];
  for (const fileName of files) {
    if (!fileName.endsWith(".ctx")) continue;
    const encoded = fileName.slice(0, -4);
    const key = Buffer.from(encoded, "base64url").toString("utf8");
    out[key] = fs.readFileSync(path.join(storeDir, fileName), "utf8");
  }
  return out;
}

function createFakeCtxbinScript(scriptPath) {
const content = `
const fs = require("node:fs");
const storePath = process.env.FAKE_CTXBIN_STORE;
const failList = process.env.FAKE_FAIL_LIST === "1";
const failLoadKey = process.env.FAKE_FAIL_LOAD_KEY || "";
const failSaveKey = process.env.FAKE_FAIL_SAVE_KEY || "";
const failDeleteKey = process.env.FAKE_FAIL_DELETE_KEY || "";
if (!storePath) {
  console.error("missing FAKE_CTXBIN_STORE");
  process.exit(1);
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storePath, "utf8"));
  } catch (err) {
    if (err && err.code === "ENOENT") {
      return { ctx: {} };
    }
    throw err;
  }
}

function writeStore(data) {
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf8");
}

const args = process.argv.slice(2);
if (args[0] !== "ctx") {
  console.error("unsupported resource");
  process.exit(2);
}

const cmd = args[1];
if (cmd === "list") {
  if (failList) {
    console.error("simulated list failure");
    process.exit(1);
  }
  const data = readStore();
  const keys = Object.keys(data.ctx || {}).sort((a, b) => a.localeCompare(b));
  if (keys.length) {
    process.stdout.write(keys.map((k) => k + "\\t--value").join("\\n") + "\\n");
  }
  process.exit(0);
}

if (cmd === "load") {
  const key = args[2];
  if (failLoadKey && key === failLoadKey) {
    console.error("simulated load failure for key: " + key);
    process.exit(1);
  }
  const raw = args.includes("--raw");
  if (!raw) {
    console.error("fake ctxbin load only supports --raw");
    process.exit(2);
  }
  const data = readStore();
  const value = data.ctx && data.ctx[key];
  if (typeof value !== "string") {
    console.error("CTXBIN_ERR NOT_FOUND: no value");
    process.exit(1);
  }
  process.stdout.write(value);
  process.exit(0);
}

if (cmd === "save") {
  const key = args[2];
  if (failSaveKey && key === failSaveKey) {
    console.error("simulated save failure for key: " + key);
    process.exit(1);
  }
  const raw = args.includes("--raw");
  if (!raw) {
    console.error("fake ctxbin save only supports --raw");
    process.exit(2);
  }
  const value = fs.readFileSync(0, "utf8");
  const data = readStore();
  if (!data.ctx || typeof data.ctx !== "object") data.ctx = {};
  data.ctx[key] = value;
  writeStore(data);
  process.exit(0);
}

if (cmd === "delete") {
  const key = args[2];
  if (failDeleteKey && key === failDeleteKey) {
    console.error("simulated delete failure for key: " + key);
    process.exit(1);
  }
  const data = readStore();
  if (data.ctx && Object.prototype.hasOwnProperty.call(data.ctx, key)) {
    delete data.ctx[key];
    writeStore(data);
  }
  process.exit(0);
}

console.error("unsupported command");
process.exit(2);
`;

  fs.writeFileSync(scriptPath, content, "utf8");
}

test("sync converges local and remote using winner rules", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  const tBase = "2026-02-16T12:00:00.000Z";
  const tOld = "2026-02-16T11:59:00.000Z";
  const tNew = "2026-02-16T12:01:00.000Z";

  const sameTsLocal = injectMetadata("tie-local", { savedAt: tBase });
  const sameTsRemote = injectMetadata("tie-remote", { savedAt: tBase });

  writeLocalEntries(localPath, {
    "only/local": injectMetadata("only-local", { savedAt: tOld }),
    "conflict/newer-local": injectMetadata("newer-local", { savedAt: tNew }),
    "legacy/remote": injectMetadata("meta-local", { savedAt: tOld }),
    "tie/remote": sameTsLocal,
    "equal/value": injectMetadata("equal", { savedAt: tOld }),
  });

  writeJson(remotePath, {
    ctx: {
      "only/remote": injectMetadata("only-remote", { savedAt: tOld }),
      "conflict/newer-local": injectMetadata("older-remote", { savedAt: tOld }),
      "legacy/remote": "legacy-no-metadata",
      "tie/remote": sameTsRemote,
      "equal/value": injectMetadata("equal", { savedAt: tOld }),
    },
  });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
  };

  const result = runCli(["sync"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /scanned: 6/);
  assert.match(result.stdout, /local_to_remote: 3/);
  assert.match(result.stdout, /remote_to_local: 2/);
  assert.match(result.stdout, /conflicts: 3/);
  assert.match(result.stdout, /skipped: 1/);

  const local = readLocalEntries(localPath);
  const remote = readJson(remotePath).ctx;
  assert.deepEqual(local, remote);
  assert.equal(local["tie/remote"], sameTsRemote, "same timestamp should choose remote value");
  assert.equal(local["legacy/remote"], injectMetadata("meta-local", { savedAt: tOld }));
});

test("sync is idempotent on second run after convergence", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  writeLocalEntries(localPath, {
    "only/local": injectMetadata("only-local", { savedAt: "2026-02-16T11:59:00.000Z" }),
  });

  writeJson(remotePath, {
    ctx: {
      "only/remote": injectMetadata("only-remote", { savedAt: "2026-02-16T11:59:00.000Z" }),
    },
  });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
  };

  let result = runCli(["sync"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local_to_remote: 1/);
  assert.match(result.stdout, /remote_to_local: 1/);

  result = runCli(["sync"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local_to_remote: 0/);
  assert.match(result.stdout, /remote_to_local: 0/);
  assert.match(result.stdout, /skipped: 2/);
});

test("sync fails fast when remote list command fails", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  writeLocalEntries(localPath, {
    "only/local": injectMetadata("only-local", { savedAt: "2026-02-16T11:59:00.000Z" }),
  });
  writeJson(remotePath, { ctx: {} });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
    FAKE_FAIL_LIST: "1",
  };

  const result = runCli(["sync"], { env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR COMMAND: ctxbin command failed: simulated list failure/);
});

test("sync reports partial apply counts when remote save fails mid-run", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  const t = "2026-02-16T11:59:00.000Z";
  writeLocalEntries(localPath, {
    "a/ok": injectMetadata("ok", { savedAt: t }),
    "b/fail": injectMetadata("fail", { savedAt: t }),
  });
  writeJson(remotePath, { ctx: {} });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
    FAKE_FAIL_SAVE_KEY: "b/fail",
  };

  const result = runCli(["sync"], { env });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR IO: sync apply failed after remote_to_local=0, local_to_remote=1/);
});

test("sync --missing=delete removes one-sided keys from each side", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  writeLocalEntries(localPath, {
    "only/local": injectMetadata("only-local", { savedAt: "2026-02-16T11:59:00.000Z" }),
  });
  writeJson(remotePath, {
    ctx: {
      "only/remote": injectMetadata("only-remote", { savedAt: "2026-02-16T11:59:00.000Z" }),
    },
  });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
  };

  const result = runCli(["sync", "--missing", "delete"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local_to_remote: 0/);
  assert.match(result.stdout, /remote_to_local: 0/);
  assert.match(result.stdout, /local_deleted: 1/);
  assert.match(result.stdout, /remote_deleted: 1/);

  assert.deepEqual(readLocalEntries(localPath), {});
  assert.deepEqual(readJson(remotePath).ctx, {});
});

test("sync --missing=skip leaves one-sided keys untouched", () => {
  const dir = makeTempDir();
  const localPath = path.join(dir, "local-store");
  const remotePath = path.join(dir, "remote-store.json");
  const fakeCtxbinPath = path.join(dir, "fake-ctxbin.js");
  createFakeCtxbinScript(fakeCtxbinPath);

  const localOnlyValue = injectMetadata("only-local", { savedAt: "2026-02-16T11:59:00.000Z" });
  const remoteOnlyValue = injectMetadata("only-remote", { savedAt: "2026-02-16T11:59:00.000Z" });
  writeLocalEntries(localPath, { "only/local": localOnlyValue });
  writeJson(remotePath, { ctx: { "only/remote": remoteOnlyValue } });

  const env = {
    CTXLOC_STORE_PATH: localPath,
    CTXLOC_CTXBIN_BIN: process.execPath,
    CTXLOC_CTXBIN_ARGS: fakeCtxbinPath,
    FAKE_CTXBIN_STORE: remotePath,
  };

  const result = runCli(["sync", "--missing", "skip"], { env });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /local_to_remote: 0/);
  assert.match(result.stdout, /remote_to_local: 0/);
  assert.match(result.stdout, /local_deleted: 0/);
  assert.match(result.stdout, /remote_deleted: 0/);
  assert.match(result.stdout, /skipped: 2/);

  assert.deepEqual(readLocalEntries(localPath), { "only/local": localOnlyValue });
  assert.deepEqual(readJson(remotePath).ctx, { "only/remote": remoteOnlyValue });
});

test("sync rejects invalid --missing policy", () => {
  const result = runCli(["sync", "--missing", "prompt"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CTXLOC_ERR INVALID_INPUT: --missing must be one of: "copy", "delete", "skip"/);
});
