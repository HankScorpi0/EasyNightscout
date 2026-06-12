import { clampMaxEntries, mergeEntries, queryEntries } from "./entries";
import { mergeTreatments, queryTreatments } from "./treatments";
import type {
  CgmEntry,
  EntriesSnapshot,
  EntryQuery,
  SetupState,
  Treatment,
  TreatmentsSnapshot,
  TreatmentQuery
} from "./types";

const STORAGE_KEY = "entries";
const TREATMENTS_KEY = "treatments";
const SETUP_KEY = "setup";
const API_SECRET_LENGTH = 6;

export class EntriesDurableObject {
  constructor(
    private readonly ctx: DurableObjectState,
    private readonly env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/setup") {
      const state = await this.getSetupState();
      return Response.json(state);
    }

    if (request.method === "POST" && url.pathname === "/setup/bootstrap") {
      const state = await this.bootstrapSetupState();
      return Response.json(state);
    }

    if (request.method === "POST" && url.pathname === "/setup/acknowledge") {
      const { revealToken } = (await request.json()) as { revealToken?: string };
      const acknowledged = await this.acknowledgeReveal(revealToken ?? null);
      return Response.json({ acknowledged });
    }

    if (request.method === "GET" && url.pathname === "/entries") {
      const query = JSON.parse(url.searchParams.get("query") ?? "{}") as EntryQuery;
      const entries = await this.getEntries();
      return Response.json(queryEntries(entries, query));
    }

    if (request.method === "POST" && url.pathname === "/entries") {
      const incoming = (await request.json()) as CgmEntry[];
      const merged = await this.putEntries(incoming);
      return Response.json({
        stored: incoming.length,
        total: merged.length
      });
    }

    if (request.method === "GET" && url.pathname === "/treatments") {
      const query = JSON.parse(url.searchParams.get("query") ?? "{}") as TreatmentQuery;
      const treatments = await this.getTreatments();
      return Response.json(queryTreatments(treatments, query));
    }

    if (request.method === "POST" && url.pathname === "/treatments") {
      const incoming = (await request.json()) as Treatment[];
      const merged = await this.putTreatments(incoming);
      return Response.json({
        stored: incoming.length,
        total: merged.length
      });
    }

    if (request.method === "GET" && url.pathname === "/snapshot") {
      const snapshot = await this.getSnapshot();
      return Response.json(snapshot);
    }

    if (request.method === "GET" && url.pathname === "/treatments/snapshot") {
      const snapshot = await this.getTreatmentsSnapshot();
      return Response.json(snapshot);
    }

    return new Response("Not found", { status: 404 });
  }

  private async getEntries(): Promise<CgmEntry[]> {
    return (await this.ctx.storage.get<CgmEntry[]>(STORAGE_KEY)) ?? [];
  }

  private async getSetupState(): Promise<SetupState | null> {
    return (await this.ctx.storage.get<SetupState>(SETUP_KEY)) ?? null;
  }

  private async getTreatments(): Promise<Treatment[]> {
    return (await this.ctx.storage.get<Treatment[]>(TREATMENTS_KEY)) ?? [];
  }

  private async bootstrapSetupState(): Promise<SetupState> {
    const existing = await this.getSetupState();
    if (existing) {
      return existing;
    }

    const state = {
      apiSecret: createShortApiSecret(),
      revealToken: createRandomSecret()
    } satisfies SetupState;
    await this.ctx.storage.put(SETUP_KEY, state);
    return state;
  }

  private async acknowledgeReveal(revealToken: string | null): Promise<boolean> {
    if (!revealToken) {
      return false;
    }

    const state = await this.getSetupState();
    if (!state || state.revealToken !== revealToken) {
      return false;
    }

    await this.ctx.storage.put(SETUP_KEY, {
      ...state,
      revealToken: null
    } satisfies SetupState);
    return true;
  }

  private async putEntries(incoming: CgmEntry[]): Promise<CgmEntry[]> {
    const current = await this.getEntries();
    const merged = mergeEntries(current, incoming, clampMaxEntries(this.env.MAX_ENTRIES));
    await this.ctx.storage.put(STORAGE_KEY, merged);
    return merged;
  }

  private async putTreatments(incoming: Treatment[]): Promise<Treatment[]> {
    const current = await this.getTreatments();
    const merged = mergeTreatments(current, incoming, clampMaxEntries(this.env.MAX_ENTRIES));
    await this.ctx.storage.put(TREATMENTS_KEY, merged);
    return merged;
  }

  private async getSnapshot(): Promise<EntriesSnapshot> {
    const entries = await this.getEntries();
    return {
      count: entries.length,
      last: entries[0] ?? null
    };
  }

  private async getTreatmentsSnapshot(): Promise<TreatmentsSnapshot> {
    const treatments = await this.getTreatments();
    return {
      count: treatments.length,
      last: treatments[0] ?? null
    };
  }
}

function createRandomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createShortApiSecret(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(API_SECRET_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
