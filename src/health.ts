import type { HealthViewModel } from "./types";

type HealthLocale = "en" | "es";

interface HealthCopy {
  lessThanOneMinute: string;
  minute: string;
  minutes: (count: number) => string;
  hour: string;
  hours: (count: number) => string;
  setupComplete: string;
  setupCompleteBody: string;
  useUrl: string;
  savedIt: string;
  setupInitialized: string;
  setupInitializedBody: string;
  latestReading: string;
  receivedAgo: string;
  direction: string;
  noData: string;
  noReadings: string;
  configureUrl: string;
  latestTreatment: string;
  untypedTreatment: string;
  insulin: string;
  noInsulin: string;
  notes: string;
  noNotes: string;
  noTreatments: string;
  noTreatmentsBody: string;
  title: string;
  subtitle: string;
  status: string;
  storedReadings: string;
  storedTreatments: string;
  viewStatusJson: string;
}

const COPY: Record<HealthLocale, HealthCopy> = {
  en: {
    lessThanOneMinute: "less than 1 minute",
    minute: "1 minute",
    minutes: (count) => `${count} minutes`,
    hour: "1 hour",
    hours: (count) => `${count} hours`,
    setupComplete: "Setup complete",
    setupCompleteBody: "Save this API secret now. For security reasons it will only be shown this one time.",
    useUrl: "Use this xDrip+ URL:",
    savedIt: "I saved it",
    setupInitialized: "Setup already initialized",
    setupInitializedBody: "The one-time API secret screen has already been claimed in another browser session.",
    latestReading: "Latest reading",
    receivedAgo: "Received",
    direction: "Direction",
    noData: "No data",
    noReadings: "No readings received yet.",
    configureUrl: "Configure xDrip+ with this URL:",
    latestTreatment: "Latest treatment",
    untypedTreatment: "Untyped treatment",
    insulin: "Insulin",
    noInsulin: "No insulin",
    notes: "Notes",
    noNotes: "No notes",
    noTreatments: "No treatments received yet.",
    noTreatmentsBody: "TinyScout Lite will show the most recent Nightscout-compatible treatment here.",
    title: "TinyScout Lite is running",
    subtitle: "Secondary/recovery server for Nightscout-compatible CGM readings.",
    status: "Status",
    storedReadings: "Stored readings",
    storedTreatments: "Stored treatments",
    viewStatusJson: "View status JSON"
  },
  es: {
    lessThanOneMinute: "menos de 1 minuto",
    minute: "1 minuto",
    minutes: (count) => `${count} minutos`,
    hour: "1 hora",
    hours: (count) => `${count} horas`,
    setupComplete: "Configuracion completada",
    setupCompleteBody: "Guarda este secreto API ahora. Por seguridad solo se mostrara esta unica vez.",
    useUrl: "Usa esta URL de xDrip+:",
    savedIt: "Ya lo guarde",
    setupInitialized: "La configuracion ya fue inicializada",
    setupInitializedBody: "La pantalla de secreto de un solo uso ya fue reclamada en otra sesion del navegador.",
    latestReading: "Ultima lectura",
    receivedAgo: "Recibido hace",
    direction: "Direccion",
    noData: "Sin datos",
    noReadings: "Todavia no se han recibido lecturas.",
    configureUrl: "Configura xDrip+ con esta URL:",
    latestTreatment: "Ultimo treatment",
    untypedTreatment: "Treatment sin tipo",
    insulin: "Insulina",
    noInsulin: "Sin insulina",
    notes: "Notas",
    noNotes: "Sin notas",
    noTreatments: "Todavia no se han recibido treatments.",
    noTreatmentsBody: "TinyScout Lite mostrara aqui el treatment compatible con Nightscout mas reciente.",
    title: "TinyScout Lite esta funcionando",
    subtitle: "Servidor secundario o de recuperacion para lecturas CGM compatibles con Nightscout.",
    status: "Estado",
    storedReadings: "Lecturas guardadas",
    storedTreatments: "Treatments guardados",
    viewStatusJson: "Ver status JSON"
  }
};

function formatElapsed(date: number, now: number, copy: HealthCopy): string {
  const deltaMs = Math.max(0, now - date);
  const minutes = Math.floor(deltaMs / 60000);

  if (minutes < 1) {
    return copy.lessThanOneMinute;
  }

  if (minutes === 1) {
    return copy.minute;
  }

  if (minutes < 60) {
    return copy.minutes(minutes);
  }

  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return copy.hour;
  }

  return copy.hours(hours);
}

export function renderHealthPage(view: HealthViewModel, locale: HealthLocale = "en"): string {
  const copy = COPY[locale];
  const exampleSecret = view.setupSecret ?? "YOUR_API_SECRET";
  const exampleUrl = `https://${exampleSecret}@${view.baseUrl.replace(/^https?:\/\//, "")}/api/v1/`;
  const acknowledgePath = locale === "es" ? "/es/setup/acknowledge" : "/setup/acknowledge";
  const setupBlock = view.setupSecret
    ? `
      <section class="setup setup-ready">
        <h2>${copy.setupComplete}</h2>
        <p>${copy.setupCompleteBody}</p>
        <code>${view.setupSecret}</code>
        <p>${copy.useUrl}</p>
        <code>${exampleUrl}</code>
        <form method="post" action="${acknowledgePath}">
          <button type="submit">${copy.savedIt}</button>
        </form>
      </section>
    `
    : view.setupPending
      ? `
      <section class="setup">
        <h2>${copy.setupInitialized}</h2>
        <p>${copy.setupInitializedBody}</p>
      </section>
    `
      : "";
  const latestBlock = view.latest
    ? `
      <section>
        <h2>${copy.latestReading}</h2>
        <p class="reading">${view.latest.sgv} mg/dL</p>
        <p>${copy.receivedAgo}: ${formatElapsed(view.latest.date, Date.now(), copy)}</p>
        <p>${copy.direction}: ${view.latest.direction ?? copy.noData}</p>
      </section>
    `
    : `
      <section>
        <h2>${copy.noReadings}</h2>
        <p>${copy.configureUrl}</p>
        <code>${exampleUrl}</code>
      </section>
    `;
  const latestTreatmentBlock = view.latestTreatment
    ? `
      <section>
        <h2>${copy.latestTreatment}</h2>
        <p class="treatment-type">${view.latestTreatment.eventType || copy.untypedTreatment}</p>
        <p>${copy.receivedAgo}: ${formatElapsed(view.latestTreatment.mills, Date.now(), copy)}</p>
        <p>${copy.insulin}: ${
          typeof view.latestTreatment.insulin === "number" ? `${view.latestTreatment.insulin} U` : copy.noInsulin
        }</p>
        <p>${copy.notes}: ${view.latestTreatment.notes ?? copy.noNotes}</p>
      </section>
    `
    : `
      <section>
        <h2>${copy.noTreatments}</h2>
        <p>${copy.noTreatmentsBody}</p>
      </section>
    `;

  return `<!doctype html>
<html lang="${locale}">
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
      <h1>${copy.title} <span class="ok">OK</span></h1>
      <p>${copy.subtitle}</p>
      ${setupBlock}
      ${latestBlock}
      ${latestTreatmentBlock}
      <section>
        <h2>${copy.status}</h2>
        <p>${copy.storedReadings}: ${view.count}</p>
        <p>${copy.storedTreatments}: ${view.treatmentCount ?? 0}</p>
        <p><a href="/api/v1/status.json">${copy.viewStatusJson}</a></p>
      </section>
    </main>
  </body>
</html>`;
}
