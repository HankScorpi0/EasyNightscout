import { clampMaxEntries, mergeEntries, queryEntries } from "./entries";
import type { CgmEntry, EntryQuery, EntriesSnapshot, SetupState } from "./types";

const STORAGE_KEY = "entries";
const SETUP_KEY = "setup";

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

    if (request.method === "GET" && url.pathname === "/snapshot") {
      const snapshot = await this.getSnapshot();
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

  private async bootstrapSetupState(): Promise<SetupState> {
    const existing = await this.getSetupState();
    if (existing) {
      return existing;
    }

    const state = {
      apiSecret: createRandomSecret(),
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

  private async getSnapshot(): Promise<EntriesSnapshot> {
    const entries = await this.getEntries();
    return {
      count: entries.length,
      last: entries[0] ?? null
    };
  }
}

function createRandomSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
