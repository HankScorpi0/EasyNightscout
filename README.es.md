# TinyScout Lite

TinyScout Lite es un servidor minimo compatible con una parte de la API de Nightscout. Esta pensado como sistema secundario o de recovery para recibir lecturas CGM desde xDrip+ y dejarlas disponibles para apps compatibles con Nightscout.

Version in English: see [README.md](README.md).

## Lo Que Si Es

- Un Worker ligero en Cloudflare.
- Un receptor de lecturas `entries` y `treatments`.
- Un visor rapido de salud en `/health`.
- Una opcion barata o gratuita para tener un respaldo sencillo.

## Lo Que No Es

- No es Nightscout completo.
- No es un dispositivo medico.
- No es una fuente principal para decisiones clinicas.
- No implementa el soporte completo de perfiles ni `devicestatus` de Nightscout.
- Todavia no implementa todo el conjunto de funciones de `treatments` de Nightscout, como borrado o reconciliacion avanzada.

## Advertencia Importante

Usalo solo como sistema secundario o de recovery. No debe utilizarse para tomar decisiones clinicas, dosificacion o tratamiento.

## Despliegue Muy Sencillo

La opcion ideal para personas no tecnicas es usar el flujo oficial de Cloudflare con un repositorio publico y un boton `Deploy to Cloudflare`.

Boton oficial de Cloudflare:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

Cuando este proyecto este en GitHub o GitLab publico, ese boton permitira desplegarlo en pocos clics desde el navegador. Cloudflare recomienda este flujo para reducir la configuracion manual.

En la primera visita, TinyScout Lite genera automaticamente un `API_SECRET` de 6 caracteres y lo muestra una sola vez en la pantalla final de configuracion. Guarda ese secreto y usalo en xDrip+.

## Configuracion De xDrip+

Usa la opcion Nightscout Sync REST API y apunta a:

```text
https://API_SECRET@tu-worker.workers.dev/api/v1/
```

Es importante mantener el sufijo `/api/v1/`.

## Como Comprobar Que Funciona

Abre:

```text
https://tu-worker.workers.dev/health
```

La pagina de health muestra:

- la ultima lectura de glucosa
- el ultimo treatment
- la cantidad de lecturas guardadas
- la cantidad de treatments guardados

Tambien puedes revisar:

```text
https://tu-worker.workers.dev/api/v1/status.json
```

## Variables De Entorno

- `API_SECRET`: override opcional. Si no se define, TinyScout Lite genera automaticamente un secreto de 6 caracteres en el primer setup.
- `READ_PUBLIC`: `true` en esta configuracion. Las rutas GET de lecturas y estado quedan publicas para facilitar el acceso desde el navegador.
- `MAX_ENTRIES`: `2000` por defecto.

## Endpoints Disponibles

- `POST /api/v1/entries`
- `POST /api/v1/entries.json`
- `GET /api/v1/entries`
- `GET /api/v1/entries.json`
- `GET /api/v1/entries/sgv`
- `GET /api/v1/entries/sgv.json`
- `GET /api/v1/entries/current`
- `GET /api/v1/entries/current.json`
- `GET /api/v1/status.json`
- `GET /api/v1/treatments`
- `GET /api/v1/treatments.json`
- `POST /api/v1/treatments`
- `POST /api/v1/treatments.json`
- `GET /api/v1/profile`
- `GET /api/v1/profile.json`
- `GET /api/v1/devicestatus`
- `GET /api/v1/devicestatus.json`
- `GET /health`

## Soporte De Treatments

TinyScout Lite ahora guarda y devuelve `treatments` al estilo Nightscout.

El soporte actual incluye:

- `POST` de un objeto treatment o un array de treatments
- `GET` con `count`
- `GET` con filtros tipo Nightscout usando `find[...]`, por ejemplo `find[eventType]=Correction Bolus`
- persistencia de campos habituales como `eventType`, `created_at`, `mills`, `insulin`, `carbs`, `notes` y `enteredBy`
- conservacion de campos adicionales enviados por el cliente

Limitaciones actuales:

- todavia no existe `DELETE /api/v1/treatments`
- todavia no existe `DELETE /api/v1/treatments/{id}`
- no implementa aun todo el comportamiento de UUIDs y reconciliacion de Nightscout

## Resolucion De Problemas

### No Llegan Datos

- Revisa que xDrip+ use la URL completa con `/api/v1/`.
- Comprueba que `API_SECRET` sea correcto.
- Revisa `/health` para ver si hay lecturas y treatments recientes.

### API_SECRET Incorrecto

- Si el `POST` devuelve `401`, comprueba que estas usando el secreto de 6 caracteres mostrado en la primera pantalla de setup.
- Si quieres sustituirlo manualmente, guarda un nuevo override con `wrangler secret put API_SECRET`.
- Si usas `https://SECRET@host/...`, asegurate de que el cliente envie Basic Auth correctamente.

### xDrip+ Sin `/api/v1/`

- Muchas integraciones fallan si la URL termina antes. Usa exactamente `https://API_SECRET@tu-worker.workers.dev/api/v1/`.

### Lecturas Antiguas

- TinyScout Lite conserva solo las ultimas `MAX_ENTRIES`.
- Si el reloj del movil esta mal, las lecturas pueden entrar con fechas antiguas.

### Diferencia Horaria

- `dateString` se guarda en ISO UTC.
- Comprueba la zona horaria y la hora del dispositivo que envia los datos.

## Desarrollo Local

```bash
npm install
npm run test
npm run dev
```
