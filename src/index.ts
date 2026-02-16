export { getVersion } from "./version";
export { formatError, fail, CtxlocError, type ErrorCode } from "./errors";
export {
  injectMetadata,
  stripMetadata,
  extractMetadata,
  formatMetadataBlock,
  extractSavedAtMs,
  META_HEADER,
  META_SEPARATOR,
  type Metadata,
} from "./metadata";
export { inferCtxKey } from "./git";
export { resolveSaveInput, type SaveInput, type SaveOptions } from "./input";
export { createLocalStore, resolveStorePath, type CtxStore, type StoreEntry as LocalStoreEntry } from "./local-store";
export { createCtxbinRemoteStore, type RemoteCtxStore, type RemoteEntry } from "./ctxbin-remote";
export { planSync, type PlannedOperation, type PlannedSync, type StoreEntry, type SyncStats, type Winner } from "./sync-core";
