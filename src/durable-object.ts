import { clampMaxEntries, mergeEntries, queryEntries } from "./entries";
import type { CgmEntry, EntryQuery, EntriesSnapshot } from "./types";

const STORAGE_KEY = "entries";

export class EntriesDurableObject {
  constructor(
    private readonly ctx: DurableObjectState,
    private readonly env: Env
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

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
