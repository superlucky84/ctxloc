const test = require("node:test");
const assert = require("node:assert/strict");
const { injectMetadata, planSync } = require("../dist/index.js");

test("metadata value wins against legacy metadata-missing value", () => {
  const local = injectMetadata("local body", { savedAt: "2026-02-16T12:00:00.000Z" });
  const remote = "legacy body without metadata";

  const planned = planSync([{ key: "k", value: local }], [{ key: "k", value: remote }]);
  assert.equal(planned.operations.length, 1);

  const op = planned.operations[0];
  assert.equal(op.winner, "local");
  assert.equal(op.reason, "local_valid_metadata_remote_invalid");
  assert.equal(op.writeRemote, true);
  assert.equal(op.writeLocal, false);
});

test("same savedAt conflict uses remote tie-break", () => {
  const local = injectMetadata("local body", { savedAt: "2026-02-16T12:00:00.000Z" });
  const remote = injectMetadata("remote body", { savedAt: "2026-02-16T12:00:00.000Z" });

  const planned = planSync([{ key: "k", value: local }], [{ key: "k", value: remote }]);
  const op = planned.operations[0];

  assert.equal(op.winner, "remote");
  assert.equal(op.reason, "equal_savedAt_remote_tiebreak");
  assert.equal(op.writeLocal, true);
  assert.equal(op.writeRemote, false);
});

test("converged identical values produce no writes", () => {
  const value = injectMetadata("same body", { savedAt: "2026-02-16T12:00:00.000Z" });
  const planned = planSync([{ key: "k", value }], [{ key: "k", value }]);

  assert.equal(planned.stats.scanned, 1);
  assert.equal(planned.stats.localToRemote, 0);
  assert.equal(planned.stats.remoteToLocal, 0);
  assert.equal(planned.stats.conflicts, 0);
  assert.equal(planned.stats.skipped, 1);
});

test("planSync handles large keysets deterministically", () => {
  const localEntries = [];
  for (let i = 0; i < 10000; i += 1) {
    localEntries.push({
      key: `k/${String(i).padStart(5, "0")}`,
      value: injectMetadata(`value-${i}`, { savedAt: "2026-02-16T12:00:00.000Z" }),
    });
  }

  const first = planSync(localEntries, []);
  const second = planSync(localEntries, []);

  assert.equal(first.stats.scanned, 10000);
  assert.equal(first.stats.localToRemote, 10000);
  assert.equal(first.stats.remoteToLocal, 0);
  assert.equal(first.stats.conflicts, 0);
  assert.equal(first.stats.skipped, 0);
  assert.deepEqual(first.operations, second.operations);
});

test("missing=delete removes local-only and remote-only keys instead of copying", () => {
  const local = injectMetadata("local", { savedAt: "2026-02-16T12:00:00.000Z" });
  const remote = injectMetadata("remote", { savedAt: "2026-02-16T12:00:00.000Z" });

  const planned = planSync(
    [{ key: "only/local", value: local }],
    [{ key: "only/remote", value: remote }],
    { missing: "delete" }
  );

  const localOnly = planned.operations.find((op) => op.key === "only/local");
  const remoteOnly = planned.operations.find((op) => op.key === "only/remote");
  assert(localOnly);
  assert(remoteOnly);

  assert.equal(localOnly.writeRemote, false);
  assert.equal(localOnly.deleteLocal, true);
  assert.equal(remoteOnly.writeLocal, false);
  assert.equal(remoteOnly.deleteRemote, true);
  assert.equal(planned.stats.localDeleted, 1);
  assert.equal(planned.stats.remoteDeleted, 1);
});

test("missing=skip ignores one-sided keys", () => {
  const local = injectMetadata("local", { savedAt: "2026-02-16T12:00:00.000Z" });
  const remote = injectMetadata("remote", { savedAt: "2026-02-16T12:00:00.000Z" });

  const planned = planSync(
    [{ key: "only/local", value: local }],
    [{ key: "only/remote", value: remote }],
    { missing: "skip" }
  );

  assert.equal(planned.stats.localToRemote, 0);
  assert.equal(planned.stats.remoteToLocal, 0);
  assert.equal(planned.stats.localDeleted, 0);
  assert.equal(planned.stats.remoteDeleted, 0);
  assert.equal(planned.stats.skipped, 2);
});
