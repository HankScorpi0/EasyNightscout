import type { HealthViewModel } from "./types";

function formatElapsed(date: number, now: number): string {
  const deltaMs = Math.max(0, now - date);
  const minutes = Math.floor(deltaMs / 60000);

  if (minutes < 1) {
    return "less than 1 minute";
  }

  if (minutes === 1) {
    return "1 minute";
  }

  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return "1 hour";
  }

  return `${hours} hours`;
}

export function renderHealthPage(view: HealthViewModel): string {
  const exampleSecret = view.setupSecret ?? "YOUR_API_SECRET";
  const exampleUrl = `https://${exampleSecret}@${view.baseUrl.replace(/^https?:\/\//, "")}/api/v1/`;
  const setupBlock = view.setupSecret
    ? `
      <section class="setup setup-ready">
        <h2>Setup complete</h2>
        <p>Save this API secret now. For security reasons it will only be shown this one time.</p>
        <code>${view.setupSecret}</code>
        <p>Use this xDrip+ URL:</p>
        <code>${exampleUrl}</code>
        <form method="post" action="/setup/acknowledge">
          <button type="submit">I saved it</button>
        </form>
      </section>
    `
    : view.setupPending
      ? `
      <section class="setup">
        <h2>Setup already initialized</h2>
        <p>The one-time API secret screen has already been claimed in another browser session.</p>
      </section>
    `
      : "";
  const latestBlock = view.latest
    ? `
      <section>
        <h2>Latest reading</h2>
        <p class="reading">${view.latest.sgv} mg/dL</p>
        <p>Received: ${formatElapsed(view.latest.date, Date.now())} ago</p>
        <p>Direction: ${view.latest.direction ?? "No data"}</p>
      </section>
    `
    : `
      <section>
        <h2>No readings received yet.</h2>
        <p>Configure xDrip+ with this URL:</p>
        <code>${exampleUrl}</code>
      </section>
    `;
  const latestTreatmentBlock = view.latestTreatment
    ? `
      <section>
        <h2>Latest treatment</h2>
        <p class="treatment-type">${view.latestTreatment.eventType || "Untyped treatment"}</p>
        <p>Received: ${formatElapsed(view.latestTreatment.mills, Date.now())} ago</p>
        <p>Insulin: ${
          typeof view.latestTreatment.insulin === "number" ? `${view.latestTreatment.insulin} U` : "No insulin"
        }</p>
        <p>Notes: ${view.latestTreatment.notes ?? "No notes"}</p>
      </section>
    `
    : `
      <section>
        <h2>No treatments received yet.</h2>
        <p>TinyScout Lite will show the most recent Nightscout-compatible treatment here.</p>
      </section>
    `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TinyScout Lite</title>
    <style>
      body {
        font-family: ui-sans-serif, system-ui, sans-serif;
        margin: 0;
        padding: 2rem;
        background: linear-gradient(180deg, #f4fbff 0%, #ffffff 100%);
        color: #16324f;
      }
      main {
        max-width: 42rem;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #d6e6f5;
        border-radius: 18px;
        padding: 2rem;
        box-shadow: 0 12px 40px rgba(22, 50, 79, 0.08);
      }
      h1, h2 {
        margin-top: 0;
      }
      .ok {
        color: #16734f;
        font-weight: 700;
      }
      .reading {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0.5rem 0;
      }
      .treatment-type {
        font-size: 1.4rem;
        font-weight: 700;
        margin: 0.5rem 0;
      }
      .setup {
        margin-bottom: 2rem;
        padding: 1rem;
        border-radius: 14px;
        background: #f3f9ff;
        border: 1px solid #b8d6f3;
      }
      .setup-ready {
        background: #ecfff4;
        border-color: #99d9b2;
      }
      code {
        display: block;
        padding: 0.75rem;
        border-radius: 12px;
        background: #eef6ff;
        overflow-wrap: anywhere;
      }
      button {
        margin-top: 1rem;
        border: 0;
        border-radius: 999px;
        padding: 0.8rem 1.1rem;
        background: #0b5dbb;
        color: #fff;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      a {
        color: #0b5dbb;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>TinyScout Lite is running <span class="ok">OK</span></h1>
      <p>Secondary/recovery server for Nightscout-compatible CGM readings.</p>
      ${setupBlock}
      ${latestBlock}
      ${latestTreatmentBlock}
      <section>
        <h2>Status</h2>
        <p>Stored readings: ${view.count}</p>
        <p>Stored treatments: ${view.treatmentCount ?? 0}</p>
        <p><a href="/api/v1/status.json">View status JSON</a></p>
      </section>
    </main>
  </body>
</html>`;
}
