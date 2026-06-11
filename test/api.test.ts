import { SELF, reset } from "cloudflare:test";
import { afterEach, describe, expect, it } from "vitest";

const secretHeader = { "api-secret": "secret" };

afterEach(async () => {
  await reset();
});

async function postEntries(body: unknown, headers: HeadersInit = secretHeader) {
  return SELF.fetch("https://example.com/api/v1/entries.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

describe("api", () => {
  it("rejects POST without API secret", async () => {
    const response = await SELF.fetch("https://example.com/api/v1/entries.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sgv: 143, date: 1781111111111 })
    });

    expect(response.status).toBe(401);
  });

  it("accepts single-object POST and returns current entry", async () => {
    const postResponse = await postEntries({
      sgv: 143,
      date: 2781111111111,
      direction: "Flat",
      type: "sgv",
      device: "xDrip"
    });

    expect(postResponse.status).toBe(201);

    const currentResponse = await SELF.fetch(
      "https://example.com/api/v1/entries/current.json",
      { headers: secretHeader }
    );
    expect(currentResponse.status).toBe(200);

    const current = (await currentResponse.json()) as Array<{ sgv: number }>;
    expect(current).toHaveLength(1);
    expect(current[0].sgv).toBe(143);
  });

  it("accepts arrays, deduplicates, and limits count", async () => {
    await postEntries([
      { sgv: 140, date: 1781111112112, type: "sgv" },
      { sgv: 141, date: 1781111112113, type: "sgv" },
      { sgv: 141, date: 1781111112113, type: "sgv" }
    ]);

    const response = await SELF.fetch(
      "https://example.com/api/v1/entries.json?count=2",
      { headers: secretHeader }
    );

    const entries = (await response.json()) as Array<{ date: number }>;
    expect(entries).toHaveLength(2);
    expect(entries[0].date).toBeGreaterThan(entries[1].date);
  });

  it("filters sgv entries and date ranges", async () => {
    await postEntries([
      { sgv: 120, date: 1781111113100, type: "mbg" },
      { sgv: 121, date: 1781111113200, type: "sgv" },
      { sgv: 122, date: 1781111113300, type: "sgv" }
    ]);

    const response = await SELF.fetch(
      "https://example.com/api/v1/entries/sgv.json?find[date][$gte]=1781111113250",
      { headers: secretHeader }
    );

    const entries = (await response.json()) as Array<{ date: number; type: string }>;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("sgv");
    expect(entries[0].date).toBe(1781111113300);
  });

  it("returns status and compatibility endpoints", async () => {
    const statusResponse = await SELF.fetch("https://example.com/api/v1/status.json", {
      headers: secretHeader
    });
    expect(statusResponse.status).toBe(200);
    const status = (await statusResponse.json()) as { status: string; entries: { count: number } };
    expect(status.status).toBe("ok");
    expect(typeof status.entries.count).toBe("number");

    const treatmentsResponse = await SELF.fetch("https://example.com/api/v1/treatments", {
      headers: secretHeader
    });
    expect(await treatmentsResponse.json()).toEqual([]);
  });

  it("renders the health page", async () => {
    const response = await SELF.fetch("https://example.com/health", {
      headers: secretHeader
    });

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("TinyScout Lite");
    expect(html).toContain("Stored readings");
  });
});
