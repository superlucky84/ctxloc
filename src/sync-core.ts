import { extractSavedAtMs } from "./metadata";

export type SyncSide = "local" | "remote";
export type Winner = SyncSide | "equal";
export type MissingPolicy = "copy" | "delete" | "skip";

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
  deleteLocal: boolean;
  deleteRemote: boolean;
  conflict: boolean;
};

export type SyncStats = {
  scanned: number;
  localToRemote: number;
  remoteToLocal: number;
  localDeleted: number;
  remoteDeleted: number;
  conflicts: number;
  skipped: number;
};

export type PlannedSync = {
  operations: PlannedOperation[];
  stats: SyncStats;
};

export function planSync(
  localEntries: StoreEntry[],
  remoteEntries: StoreEntry[],
  options: { missing?: MissingPolicy } = {}
): PlannedSync {
  const missingPolicy = options.missing ?? "copy";
  const localMap = new Map(localEntries.map((entry) => [entry.key, entry.value]));
  const remoteMap = new Map(remoteEntries.map((entry) => [entry.key, entry.value]));
  const keys = Array.from(new Set([...localMap.keys(), ...remoteMap.keys()])).sort((a, b) => a.localeCompare(b));

  const operations: PlannedOperation[] = [];
  const stats: SyncStats = {
    scanned: keys.length,
    localToRemote: 0,
    remoteToLocal: 0,
    localDeleted: 0,
    remoteDeleted: 0,
    conflicts: 0,
    skipped: 0,
  };

  for (const key of keys) {
    const localValue = localMap.get(key);
    const remoteValue = remoteMap.get(key);
    const operation = decideOperation(key, localValue, remoteValue, missingPolicy);
    operations.push(operation);

    if (operation.conflict) stats.conflicts += 1;
    if (operation.writeRemote) stats.localToRemote += 1;
    if (operation.writeLocal) stats.remoteToLocal += 1;
    if (operation.deleteLocal) stats.localDeleted += 1;
    if (operation.deleteRemote) stats.remoteDeleted += 1;
    if (!operation.writeLocal && !operation.writeRemote && !operation.deleteLocal && !operation.deleteRemote) {
      stats.skipped += 1;
    }
  }

  return { operations, stats };
}

function decideOperation(
  key: string,
  localValue: string | undefined,
  remoteValue: string | undefined,
  missingPolicy: MissingPolicy
): PlannedOperation {
  if (localValue === undefined && remoteValue === undefined) {
    return {
      key,
      winner: "equal",
      reason: "equal_value",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: false,
      deleteRemote: false,
      conflict: false,
    };
  }

  if (remoteValue === undefined) {
    return decideLocalOnlyOperation(key, localValue, missingPolicy);
  }

  if (localValue === undefined) {
    return decideRemoteOnlyOperation(key, remoteValue, missingPolicy);
  }

  if (localValue === remoteValue) {
    return {
      key,
      winner: "equal",
      reason: "equal_value",
      winningValue: localValue,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: false,
      deleteRemote: false,
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
        deleteLocal: false,
        deleteRemote: false,
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
        deleteLocal: false,
        deleteRemote: false,
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
      deleteLocal: false,
      deleteRemote: false,
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
      deleteLocal: false,
      deleteRemote: false,
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
      deleteLocal: false,
      deleteRemote: false,
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
    deleteLocal: false,
    deleteRemote: false,
    conflict: true,
  };
}

function decideLocalOnlyOperation(key: string, localValue: string, missingPolicy: MissingPolicy): PlannedOperation {
  if (missingPolicy === "skip") {
    return {
      key,
      winner: "equal",
      reason: "local_only",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: false,
      deleteRemote: false,
      conflict: false,
    };
  }

  if (missingPolicy === "delete") {
    return {
      key,
      winner: "equal",
      reason: "local_only",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: true,
      deleteRemote: false,
      conflict: false,
    };
  }

  return {
    key,
    winner: "local",
    reason: "local_only",
    winningValue: localValue,
    writeLocal: false,
    writeRemote: true,
    deleteLocal: false,
    deleteRemote: false,
    conflict: false,
  };
}

function decideRemoteOnlyOperation(key: string, remoteValue: string, missingPolicy: MissingPolicy): PlannedOperation {
  if (missingPolicy === "skip") {
    return {
      key,
      winner: "equal",
      reason: "remote_only",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: false,
      deleteRemote: false,
      conflict: false,
    };
  }

  if (missingPolicy === "delete") {
    return {
      key,
      winner: "equal",
      reason: "remote_only",
      winningValue: null,
      writeLocal: false,
      writeRemote: false,
      deleteLocal: false,
      deleteRemote: true,
      conflict: false,
    };
  }

  return {
    key,
    winner: "remote",
    reason: "remote_only",
    winningValue: remoteValue,
    writeLocal: true,
    writeRemote: false,
    deleteLocal: false,
    deleteRemote: false,
    conflict: false,
  };
}
