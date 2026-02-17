const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { createLocalStore, CtxlocError, injectMetadata } = require("../dist/index.js");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ctxloc-local-store-test-"));
}

test("local store list fails when store path is a file", async () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store-path-is-file");
  fs.writeFileSync(storePath, "x", "utf8");
  const store = createLocalStore(storePath);

  await assert.rejects(
    async () => store.list(),
    (err) => {
      assert(err instanceof CtxlocError);
      assert.equal(err.code, "IO");
      assert.match(err.message, /failed to read store directory/);
      return true;
    }
  );
});

test(
  "local store write fails on read-only store directory",
  { skip: process.platform === "win32" || (typeof process.getuid === "function" && process.getuid() === 0) },
  async () => {
    const dir = makeTempDir();
    const storePath = path.join(dir, "store");
    fs.mkdirSync(storePath, { recursive: true, mode: 0o700 });
    fs.chmodSync(storePath, 0o500);
    const store = createLocalStore(storePath);

    try {
      await assert.rejects(
        async () => store.set("project/main", "value"),
        (err) => {
          assert(err instanceof CtxlocError);
          assert.equal(err.code, "IO");
          assert.match(err.message, /failed to write store entry/);
          return true;
        }
      );
    } finally {
      fs.chmodSync(storePath, 0o700);
    }
  }
);

test("local store handles concurrent writes across many keys", async () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const store = createLocalStore(storePath);
  const total = 200;

  await Promise.all(
    Array.from({ length: total }, (_, i) => {
      return store.set(`project/key-${String(i).padStart(3, "0")}`, `value-${i}`);
    })
  );

  const listed = await store.list();
  assert.equal(listed.length, total);

  const byKey = new Map(listed.map((entry) => [entry.key, entry.value]));
  for (let i = 0; i < total; i += 1) {
    const key = `project/key-${String(i).padStart(3, "0")}`;
    assert.equal(byKey.get(key), `value-${i}`);
  }

  const tmpFiles = fs.readdirSync(storePath).filter((fileName) => fileName.startsWith(".tmp-"));
  assert.equal(tmpFiles.length, 0);
});

test("local store concurrent writes on same key keep a valid final value", async () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const store = createLocalStore(storePath);
  const key = "race/main";
  const values = Array.from({ length: 50 }, (_, i) => `payload-${i}-${"x".repeat(512)}`);

  await Promise.all(values.map((value) => store.set(key, value)));

  const finalValue = await store.get(key);
  assert.equal(typeof finalValue, "string");
  assert(values.includes(finalValue));

  const listed = await store.list();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].key, key);
  assert.equal(listed[0].value, finalValue);
});

// ─── Key encoding/decoding safety tests ───

test("key round-trip: slashes, dots, hyphens in typical project/branch keys", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));
  const keys = [
    "my-project/main",
    "my-project/feature/nested-branch",
    "@scope/pkg-name/dev",
    "project/release-v1.2.3",
    "a/b/c/d/e",
    "dot.dot/slash.slash",
  ];

  for (const key of keys) {
    await store.set(key, `value-for-${key}`);
  }

  const listed = await store.list();
  const listedKeys = listed.map((e) => e.key);
  for (const key of keys) {
    assert(listedKeys.includes(key), `key "${key}" must survive round-trip`);
    const loaded = await store.get(key);
    assert.equal(loaded, `value-for-${key}`);
  }
});

test("key round-trip: unicode characters (CJK, emoji, accents)", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));
  const keys = [
    "프로젝트/메인",
    "项目/主分支",
    "プロジェクト/メイン",
    "projet/branche-hébergée",
    "emoji-🚀/branch-✨",
    "mixed/한글-and-english",
    "Ünïcödé/spëcîal",
  ];

  for (const key of keys) {
    await store.set(key, `value-${key}`);
  }

  const listed = await store.list();
  const listedKeys = listed.map((e) => e.key);
  for (const key of keys) {
    assert(listedKeys.includes(key), `unicode key "${key}" must survive round-trip`);
    const loaded = await store.get(key);
    assert.equal(loaded, `value-${key}`);
  }
});

test("key round-trip: escape sequences and control-like characters in key", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));
  const keys = [
    "has\\backslash/branch",
    "has\ttab/branch",
    "has\nnewline/branch",
    "has space/branch name",
    'has"quote/branch',
    "has'single/branch",
    "has`backtick/branch",
    "has$dollar/branch",
    "has&ampersand/branch",
    "has|pipe/branch",
    "has<angle>/branch",
    "has(paren)/branch",
    "has[bracket]/branch",
    "has{brace}/branch",
    "has#hash/branch",
    "has%percent/branch",
    "has!bang/branch",
    "has~tilde/branch",
    "has=equals/branch",
    "has+plus/branch",
    "has;semi/branch",
  ];

  for (const key of keys) {
    await store.set(key, `val-${key}`);
  }

  const listed = await store.list();
  assert.equal(listed.length, keys.length);
  const listedKeys = listed.map((e) => e.key);
  for (const key of keys) {
    assert(listedKeys.includes(key), `special-char key "${key}" must survive round-trip`);
    const loaded = await store.get(key);
    assert.equal(loaded, `val-${key}`);
  }
});

test("key round-trip: keys that look like base64 or encoded strings", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));
  const keys = [
    "bXktcHJvamVjdC9tYWlu",
    "already-base64url/branch",
    "AA==/branch",
    "----/____",
  ];

  for (const key of keys) {
    await store.set(key, `val-${key}`);
  }

  const listed = await store.list();
  const listedKeys = listed.map((e) => e.key);
  for (const key of keys) {
    assert(listedKeys.includes(key), `base64-like key "${key}" must survive round-trip`);
  }
  assert.equal(listed.length, keys.length, "no collision between base64-like keys");
});

test("key round-trip: keys that could collide if encoding were broken", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));

  const key1 = "project/main";
  const key2 = "project\\main";
  const key3 = "project\x00main";

  await store.set(key1, "val1");
  await store.set(key2, "val2");
  await store.set(key3, "val3");

  assert.equal(await store.get(key1), "val1");
  assert.equal(await store.get(key2), "val2");
  assert.equal(await store.get(key3), "val3");

  const listed = await store.list();
  assert.equal(listed.length, 3, "all three similar keys must be stored separately");
});

test("empty key is rejected", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));

  await assert.rejects(
    async () => store.set("", "value"),
    (err) => {
      assert(err instanceof CtxlocError);
      assert.equal(err.code, "INVALID_INPUT");
      assert.match(err.message, /ctx key must not be empty/);
      return true;
    }
  );

  await assert.rejects(
    async () => store.get(""),
    (err) => {
      assert(err instanceof CtxlocError);
      return true;
    }
  );
});

test("key encoding produces filesystem-safe filenames", async () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const store = createLocalStore(storePath);
  const dangerousKeys = [
    "../escape/attempt",
    "../../etc/passwd",
    "project/main\x00injected",
    "CON",
    "NUL",
    "com1/branch",
  ];

  for (const key of dangerousKeys) {
    await store.set(key, `safe-${key}`);
  }

  const files = fs.readdirSync(storePath);
  for (const file of files) {
    assert.match(file, /^[A-Za-z0-9_-]+\.ctx$/, `filename "${file}" must be base64url-safe`);
    const fullPath = path.resolve(storePath, file);
    assert(fullPath.startsWith(path.resolve(storePath)), "resolved path must stay inside store dir");
  }

  for (const key of dangerousKeys) {
    const loaded = await store.get(key);
    assert.equal(loaded, `safe-${key}`);
  }
});

test("list ignores non-.ctx files and subdirectories in store dir", async () => {
  const dir = makeTempDir();
  const storePath = path.join(dir, "store");
  const store = createLocalStore(storePath);

  await store.set("real/key", "real-value");

  fs.writeFileSync(path.join(storePath, "random.txt"), "noise", "utf8");
  fs.writeFileSync(path.join(storePath, ".hidden"), "noise", "utf8");
  fs.mkdirSync(path.join(storePath, "subdir"));

  const listed = await store.list();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].key, "real/key");
  assert.equal(listed[0].value, "real-value");
});

test("delete on non-existent key is silent no-op", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));

  await assert.doesNotReject(async () => store.delete("nonexistent/key"));
});

test("get on non-existent key returns null", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));

  const result = await store.get("nonexistent/key");
  assert.equal(result, null);
});

test("value with metadata envelope preserves exact content through store", async () => {
  const dir = makeTempDir();
  const store = createLocalStore(path.join(dir, "store"));
  const value = injectMetadata("body with\nnewlines\nand unicode 한글 🚀", {
    savedAt: "2026-02-16T12:00:00.000Z",
    by: "test-agent",
  });

  await store.set("meta/test", value);
  const loaded = await store.get("meta/test");
  assert.equal(loaded, value, "metadata envelope must be preserved byte-for-byte");
});
