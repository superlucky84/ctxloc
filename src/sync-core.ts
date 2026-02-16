import { extractSavedAtMs } from "./metadata";

export type SyncSide = "local" | "remote";
export type Winner = SyncSide | "equal";

export type StoreEntry = {
  key: string;
  value: string;
};

export type PlannedOperation = {
  key: string;
  winner: Winner;
  reason:
    | "local_only"
    | "remote_only"
    | "equal_value"
    | "local_newer_savedAt"
    | "remote_newer_savedAt"
    | "equal_savedAt_remote_tiebreak"
    | "local_valid_metadata_remote_invalid"
    | "remote_valid_metadata_local_invalid"
    | "both_invalid_remote_tiebreak";
  winningValue: string | null;
  writeLocal: boolean;
  writeRemote: boolean;
  conflict: boolean;
};

export type SyncStats = {
  scanned: number;
  localToRemote: number;
  remoteToLocal: number;
  conflicts: number;
  skipped: number;
};

export type PlannedSync = {
  operations: PlannedOperation[];
  stats: SyncStats;
};

export function planSync(localEntries: StoreEntry[], remoteEntries: StoreEntry[]): PlannedSync {
  const localMap = new Map(localEntries.map((entry) => [entry.key, entry.value]));
  const remoteMap = new Map(remoteEntries.map((entry) => [entry.key, entry.value]));
  const keys = Array.from(new Set([...localMap.keys(), ...remoteMap.keys()])).sort((a, b) => a.localeCompare(b));

  const operations: PlannedOperation[] = [];
  const stats: SyncStats = {
    scanned: keys.length,
    localToRemote: 0,
    remoteToLocal: 0,
    conflicts: 0,
    skipped: 0,
  };

  for (const key of keys) {
    const localValue = localMap.get(key);
    const remoteValue = remoteMap.get(key);
    const operation = decideOperation(key, localValue, remoteValue);
    operations.push(operation);

    if (operation.conflict) stats.conflicts += 1;
    if (operation.writeRemote) stats.localToRemote += 1;
    if (operation.writeLocal) stats.remoteToLocal += 1;
    if (!operation.writeLocal && !operation.writeRemote) stats.skipped += 1;
  }

  return { operations, stats };
}

function decideOperation(key: string, localValue?: string, remoteValue?: string): PlannedOperation {
  if (localValue === undefined && remoteValue === undefined) {
    return {
      key,
      winner: "equal",
      reason: "equal_value",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      conflict: false,
    };
  }

  if (remoteValue === undefined) {
    return {
      key,
      winner: "local",
      reason: "local_only",
      winningValue: localValue ?? null,
      writeLocal: false,
      writeRemote: typeof localValue === "string",
      conflict: false,
    };
  }

  if (localValue === undefined) {
    return {
      key,
      winner: "remote",
      reason: "remote_only",
      winningValue: remoteValue,
      writeLocal: true,
      writeRemote: false,
      conflict: false,
    };
  }

  if (localValue === remoteValue) {
    return {
      key,
      winner: "equal",
      reason: "equal_value",
      winningValue: localValue,
      writeLocal: false,
      writeRemote: false,
      conflict: false,
    };
  }

  const localSavedAt = extractSavedAtMs(localValue);
  const remoteSavedAt = extractSavedAtMs(remoteValue);

  if (localSavedAt !== null && remoteSavedAt !== null) {
    if (localSavedAt > remoteSavedAt) {
      return {
        key,
        winner: "local",
        reason: "local_newer_savedAt",
        winningValue: localValue,
        writeLocal: false,
        writeRemote: true,
        conflict: true,
      };
    }
    if (localSavedAt < remoteSavedAt) {
      return {
        key,
        winner: "remote",
        reason: "remote_newer_savedAt",
        winningValue: remoteValue,
        writeLocal: true,
        writeRemote: false,
        conflict: true,
      };
    }
    return {
      key,
      winner: "remote",
      reason: "equal_savedAt_remote_tiebreak",
      winningValue: remoteValue,
      writeLocal: true,
      writeRemote: false,
      conflict: true,
    };
  }

  if (localSavedAt !== null && remoteSavedAt === null) {
    return {
      key,
      winner: "local",
      reason: "local_valid_metadata_remote_invalid",
      winningValue: localValue,
      writeLocal: false,
      writeRemote: true,
      conflict: true,
    };
  }

  if (localSavedAt === null && remoteSavedAt !== null) {
    return {
      key,
      winner: "remote",
      reason: "remote_valid_metadata_local_invalid",
      winningValue: remoteValue,
      writeLocal: true,
      writeRemote: false,
      conflict: true,
    };
  }

  return {
    key,
    winner: "remote",
    reason: "both_invalid_remote_tiebreak",
    winningValue: remoteValue,
    writeLocal: true,
    writeRemote: false,
    conflict: true,
  };
}
