import { SELF, reset } from "cloudflare:test";
import { afterEach, describe, expect, it } from "vitest";

afterEach(async () => {
  await reset();
});

async function initializeSetup(): Promise<{ secret: string; cookie: string }> {
  const response = await SELF.fetch("https://example.com/health");
  expect(response.status).toBe(200);

  const cookie = response.headers.get("Set-Cookie");
  expect(cookie).toContain("tinyscout_setup=");

  const html = await response.text();
  const secretMatch = html.match(/<code>([a-z2-9]{6})<\/code>/);
  expect(secretMatch?.[1]).toBeTruthy();

  return {
    secret: secretMatch![1],
    cookie: cookie!.split(";", 1)[0]
  };
}

async function acknowledgeSetup(cookie: string) {
  const response = await SELF.fetch("https://example.com/setup/acknowledge", {
    method: "POST",
    headers: { Cookie: cookie },
    redirect: "manual"
  });
  expect(response.status).toBe(303);
}

function secretHeader(secret: string): HeadersInit {
  return { "api-secret": secret };
}

async function postEntries(body: unknown, headers: HeadersInit) {
  return SELF.fetch("https://example.com/api/v1/entries.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

async function postTreatments(body: unknown, headers: HeadersInit) {
  return SELF.fetch("https://example.com/api/v1/treatments.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });
}

describe("api", () => {
  it("generates the setup secret on first health visit and reveals it once", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    const secondResponse = await SELF.fetch("https://example.com/health", {
      headers: secretHeader(secret)
    });
    expect(secondResponse.status).toBe(200);
    const secondHtml = await secondResponse.text();
    expect(secondHtml).not.toContain(secret);

    const postResponse = await postEntries(
      { sgv: 143, date: 2781111111111 },
      secretHeader(secret)
    );
    expect(postResponse.status).toBe(201);
  });

  it("rejects POST without API secret", async () => {
    const { cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    const response = await SELF.fetch("https://example.com/api/v1/entries.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sgv: 143, date: 1781111111111 })
    });

    expect(response.status).toBe(401);
  });

  it("accepts single-object POST and returns current entry", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    const postResponse = await postEntries({
      sgv: 143,
      date: 2781111111111,
      direction: "Flat",
      type: "sgv",
      device: "xDrip"
    }, secretHeader(secret));

    expect(postResponse.status).toBe(201);

    const currentResponse = await SELF.fetch(
      "https://example.com/api/v1/entries/current.json",
      { headers: secretHeader(secret) }
    );
    expect(currentResponse.status).toBe(200);

    const current = (await currentResponse.json()) as Array<{ sgv: number }>;
    expect(current).toHaveLength(1);
    expect(current[0].sgv).toBe(143);
  });

  it("accepts arrays, deduplicates, and limits count", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    await postEntries([
      { sgv: 140, date: 1781111112112, type: "sgv" },
      { sgv: 141, date: 1781111112113, type: "sgv" },
      { sgv: 141, date: 1781111112113, type: "sgv" }
    ], secretHeader(secret));

    const response = await SELF.fetch(
      "https://example.com/api/v1/entries.json?count=2",
      { headers: secretHeader(secret) }
    );

    const entries = (await response.json()) as Array<{ date: number }>;
    expect(entries).toHaveLength(2);
    expect(entries[0].date).toBeGreaterThan(entries[1].date);
  });

  it("filters sgv entries and date ranges", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    await postEntries([
      { sgv: 120, date: 1781111113100, type: "mbg" },
      { sgv: 121, date: 1781111113200, type: "sgv" },
      { sgv: 122, date: 1781111113300, type: "sgv" }
    ], secretHeader(secret));

    const response = await SELF.fetch(
      "https://example.com/api/v1/entries/sgv.json?find[date][$gte]=1781111113250",
      { headers: secretHeader(secret) }
    );

    const entries = (await response.json()) as Array<{ date: number; type: string }>;
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("sgv");
    expect(entries[0].date).toBe(1781111113300);
  });

  it("stores and queries treatments", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    const postResponse = await postTreatments([
      {
        eventType: "Carb Correction",
        created_at: "2026-06-10T20:00:00.000Z",
        carbs: 12,
        notes: "Juice"
      },
      {
        eventType: "Correction Bolus",
        created_at: "2026-06-10T20:05:00.000Z",
        insulin: 1.2,
        enteredBy: "xDrip"
      }
    ], secretHeader(secret));

    expect(postResponse.status).toBe(201);

    const treatmentsResponse = await SELF.fetch(
      "https://example.com/api/v1/treatments.json?count=1&find[eventType]=Correction%20Bolus",
      { headers: secretHeader(secret) }
    );
    expect(treatmentsResponse.status).toBe(200);

    const treatments = (await treatmentsResponse.json()) as Array<{ eventType: string; mills: number }>;
    expect(treatments).toHaveLength(1);
    expect(treatments[0].eventType).toBe("Correction Bolus");
    expect(treatments[0].mills).toBe(1781121900000);
  });

  it("returns status and compatibility endpoints", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    const statusResponse = await SELF.fetch("https://example.com/api/v1/status.json", {
      headers: secretHeader(secret)
    });
    expect(statusResponse.status).toBe(200);
    const status = (await statusResponse.json()) as { status: string; entries: { count: number } };
    expect(status.status).toBe("ok");
    expect(typeof status.entries.count).toBe("number");

    const treatmentsResponse = await SELF.fetch("https://example.com/api/v1/treatments", {
      headers: secretHeader(secret)
    });
    expect(await treatmentsResponse.json()).toEqual([]);
  });

  it("renders the health page", async () => {
    const { secret, cookie } = await initializeSetup();
    await acknowledgeSetup(cookie);

    await postEntries({ sgv: 143, date: 1781111111111 }, secretHeader(secret));
    await postTreatments(
      {
        eventType: "Correction Bolus",
        created_at: "2026-06-10T20:05:00.000Z",
        insulin: 1.2,
        notes: "Test bolus"
      },
      secretHeader(secret)
    );

    const response = await SELF.fetch("https://example.com/health", {
      headers: secretHeader(secret)
    });

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("TinyScout Lite");
    expect(html).toContain("Stored readings");
    expect(html).toContain("Latest treatment");
    expect(html).toContain("Correction Bolus");
    expect(html).toContain("Insulin: 1.2 U");
    expect(html).toContain("Stored treatments: 1");
  });
});
