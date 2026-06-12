export interface Env {
  API_SECRET?: string;
  MAX_ENTRIES?: string;
  READ_PUBLIC?: string;
  ENTRIES_DO: DurableObjectNamespace;
}

export interface SetupState {
  apiSecret: string;
  revealToken: string | null;
}

export interface CgmEntry {
  _id: string;
  sgv: number;
  date: number;
  dateString: string;
  direction?: string;
  trend?: number;
  type: string;
  device?: string;
  noise?: number;
  filtered?: number;
  unfiltered?: number;
  rssi?: number;
  utcOffset?: number;
  sysTime?: string;
  mills?: number;
  raw?: unknown;
  [key: string]: unknown;
}

export interface EntryQuery {
  count: number;
  onlySgv: boolean;
  currentOnly: boolean;
  dateGte?: number;
  dateLte?: number;
}

export interface EntriesSnapshot {
  count: number;
  last: CgmEntry | null;
}

export interface StatusPayload {
  status: "ok";
  name: string;
  version: string;
  serverTime: string;
  apiEnabled: boolean;
  entries: EntriesSnapshot;
}

export interface HealthViewModel {
  latest: CgmEntry | null;
  count: number;
  baseUrl: string;
  setupSecret?: string | null;
  setupPending?: boolean;
}
