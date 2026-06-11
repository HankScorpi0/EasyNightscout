import { optionsResponse, requireReadAuth, requireWriteAuth } from "./auth";
import { EntriesDurableObject } from "./durable-object";
import {
  MAX_REQUEST_BYTES,
  normalizeEntries,
  parseEntryQuery
} from "./entries";
import { renderHealthPage } from "./health";
import { htmlResponse, jsonResponse } from "./responses";
import type { CgmEntry, Env, StatusPayload } from "./types";

export { EntriesDurableObject };

const APP_NAME = "TinyScout Lite";
const APP_VERSION = "0.1.0";
const EMPTY_COLLECTION = [];

function getEntriesStub(env: Env): DurableObjectStub<EntriesDurableObject> {
  const id = env.ENTRIES_DO.idFromName("global");
  return env.ENTRIES_DO.get(id) as DurableObjectStub<EntriesDurableObject>;
}

async function listEntries(env: Env, query: ReturnType<typeof parseEntryQuery>): Promise<CgmEntry[]> {
  const stub = getEntriesStub(env);
  const response = await stub.fetch(
    `https://entries.internal/entries?query=${encodeURIComponent(JSON.stringify(query))}`
  );
  return (await response.json()) as CgmEntry[];
}

async function storeEntries(env: Env, entries: CgmEntry[]): Promise<{ stored: number; total: number }> {
  const stub = getEntriesStub(env);
  const response = await stub.fetch("https://entries.internal/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entries)
  });

  return (await response.json()) as { stored: number; total: number };
}

async function getSnapshot(env: Env): Promise<StatusPayload["entries"]> {
  const stub = getEntriesStub(env);
  const response = await stub.fetch("https://entries.internal/snapshot");
  return (await response.json()) as StatusPayload["entries"];
}

async function parsePostBody(request: Request): Promise<unknown> {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_REQUEST_BYTES) {
    throw new Error("Payload too large.");
  }

  return JSON.parse(raw);
}

function isEntriesReadRoute(pathname: string): boolean {
  return [
    "/api/v1/entries",
    "/api/v1/entries.json",
    "/api/v1/entries/sgv",
    "/api/v1/entries/sgv.json",
    "/api/v1/entries/current",
    "/api/v1/entries/current.json"
  ].includes(pathname);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return optionsResponse();
    }

    if (url.pathname === "/") {
      return Response.redirect(`${url.origin}/health`, 302);
    }

    if (url.pathname === "/health") {
      const authError = requireReadAuth(request, env);
      if (authError) {
        return authError;
      }

      const snapshot = await getSnapshot(env);
      return htmlResponse(
        renderHealthPage({
          latest: snapshot.last,
          count: snapshot.count,
          baseUrl: url.origin
        })
      );
    }

    if (url.pathname === "/api/v1/status.json") {
      const authError = requireReadAuth(request, env);
      if (authError) {
        return authError;
      }

      const snapshot = await getSnapshot(env);
      const payload: StatusPayload = {
        status: "ok",
        name: APP_NAME,
        version: APP_VERSION,
        serverTime: new Date().toISOString(),
        apiEnabled: true,
        entries: snapshot
      };
      return jsonResponse(payload);
    }

    if (
      [
        "/api/v1/treatments",
        "/api/v1/treatments.json",
        "/api/v1/profile",
        "/api/v1/profile.json",
        "/api/v1/devicestatus",
        "/api/v1/devicestatus.json"
      ].includes(url.pathname)
    ) {
      const authError = requireReadAuth(request, env);
      if (authError) {
        return authError;
      }

      return jsonResponse(EMPTY_COLLECTION);
    }

    if (request.method === "POST" && ["/api/v1/entries", "/api/v1/entries.json"].includes(url.pathname)) {
      const authError = requireWriteAuth(request, env);
      if (authError) {
        return authError;
      }

      try {
        const body = await parsePostBody(request);
        const entries = normalizeEntries(body);
        const result = await storeEntries(env, entries);
        return jsonResponse(result, { status: 201 });
      } catch (error) {
        return jsonResponse(
          { error: error instanceof Error ? error.message : "Invalid request body." },
          { status: 400 }
        );
      }
    }

    if (request.method === "GET" && isEntriesReadRoute(url.pathname)) {
      const authError = requireReadAuth(request, env);
      if (authError) {
        return authError;
      }

      const query = parseEntryQuery(
        url,
        url.pathname.includes("/current"),
        url.pathname.includes("/sgv")
      );
      const entries = await listEntries(env, query);
      return jsonResponse(entries);
    }

    return jsonResponse({ error: "Not found" }, { status: 404 });
  }
};
