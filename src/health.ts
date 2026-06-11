import type { HealthViewModel } from "./types";

function formatElapsed(date: number, now: number): string {
  const deltaMs = Math.max(0, now - date);
  const minutes = Math.floor(deltaMs / 60000);

  if (minutes < 1) {
    return "menos de 1 minuto";
  }

  if (minutes === 1) {
    return "1 minuto";
  }

  if (minutes < 60) {
    return `${minutes} minutos`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours === 1) {
    return "1 hora";
  }

  return `${hours} horas`;
}

export function renderHealthPage(view: HealthViewModel): string {
  const exampleUrl = `https://TU_API_SECRET@${view.baseUrl.replace(/^https?:\/\//, "")}/api/v1/`;
  const latestBlock = view.latest
    ? `
      <section>
        <h2>Ultima lectura</h2>
        <p class="reading">${view.latest.sgv} mg/dL</p>
        <p>Recibida hace: ${formatElapsed(view.latest.date, Date.now())}</p>
        <p>Direccion: ${view.latest.direction ?? "Sin dato"}</p>
      </section>
    `
    : `
      <section>
        <h2>Todavia no he recibido lecturas.</h2>
        <p>Configura xDrip+ con esta URL:</p>
        <code>${exampleUrl}</code>
      </section>
    `;

  return `<!doctype html>
<html lang="es">
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
      code {
        display: block;
        padding: 0.75rem;
        border-radius: 12px;
        background: #eef6ff;
        overflow-wrap: anywhere;
      }
      a {
        color: #0b5dbb;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>TinyScout Lite esta funcionando <span class="ok">OK</span></h1>
      <p>Servidor secundario/recovery para lecturas CGM compatibles con Nightscout.</p>
      ${latestBlock}
      <section>
        <h2>Estado</h2>
        <p>Lecturas guardadas: ${view.count}</p>
        <p><a href="/api/v1/status.json">Ver status JSON</a></p>
      </section>
    </main>
  </body>
</html>`;
}
