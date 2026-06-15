# TinyScout Lite

TinyScout Lite es un servidor mínimo compatible con una parte de la API de Nightscout. Está pensado como sistema secundario o de recuperación para recibir lecturas CGM desde xDrip+ y dejarlas disponibles para apps compatibles con Nightscout.

Version in English: see [README.md](README.md).

## Lo Que Sí Es

- Un Worker ligero en Cloudflare.
- Un receptor de lecturas `entries` y `treatments`.
- Un visor rapido de salud en `/health`.
- Una version en espanol del visor en `/es/health`.
- Una opción barata o gratuita para tener un respaldo sencillo.

## Lo Que No Es

- No es Nightscout completo.
- No es un dispositivo médico.
- No es una fuente principal para decisiones clínicas.
- No implementa el soporte completo de perfiles ni `devicestatus` de Nightscout.
- Todavía no implementa todo el conjunto de funciones de `treatments` de Nightscout, como borrado o reconciliación avanzada.

## Advertencia Importante

Úsalo solo como sistema secundario o de recuperación. No debe utilizarse para tomar decisiones clínicas, dosificación o tratamiento.

## Despliegue Muy Sencillo

La opción ideal para personas no técnicas es usar el flujo oficial de Cloudflare con un repositorio público y un botón `Deploy to Cloudflare`.

Botón oficial de Cloudflare:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

Este proyecto puede desplegarse en pocos clics usando el botón `Deploy to Cloudflare`. Cloudflare recomienda este flujo para reducir la configuración manual.

En la primera visita, TinyScout Lite genera automáticamente un `API_SECRET` de 6 caracteres y lo muestra una sola vez en la pantalla final de configuración. Guarda ese secreto y úsalo en xDrip+.

## Configuración De xDrip+

Usa la opción Nightscout Sync REST API y apunta a:

```text
https://API_SECRET@tu-worker.workers.dev/api/v1/
```

Es importante mantener el sufijo `/api/v1/`.
TinyScout Lite acepta tanto el secreto en texto plano como el `SHA1(API_SECRET)` que xDrip suele enviar en la cabecera `api-secret`.

## Cómo Comprobar Que Funciona

Abre:

```text
https://tu-worker.workers.dev/health
```

Version en espanol:

```text
https://tu-worker.workers.dev/es/health
```

La página de health muestra:

- la última lectura de glucosa
- el último treatment
- la cantidad de lecturas guardadas
- la cantidad de treatments guardados

También puedes revisar:

```text
https://tu-worker.workers.dev/api/v1/status.json
```

## Variables De Entorno

- `API_SECRET`: override opcional. Si no se define, TinyScout Lite genera automáticamente un secreto de 6 caracteres en el primer setup.
- `READ_PUBLIC`: `true` en esta configuración. Las rutas GET de lecturas y estado quedan públicas para facilitar el acceso desde el navegador.
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
- `GET /api/v1/profile/current`
- `GET /api/v1/profile/current.json`
- `POST /api/v1/profile`
- `POST /api/v1/profile.json`
- `PUT /api/v1/profile`
- `PUT /api/v1/profile.json`
- `GET /api/v1/devicestatus`
- `GET /api/v1/devicestatus.json`
- `GET /health`
- `GET /es/health`

## Soporte De Treatments

TinyScout Lite ahora guarda y devuelve `treatments` al estilo Nightscout.

El soporte actual incluye:

- `POST` de un objeto treatment o un array de treatments
- `GET` con `count`
- `GET` con filtros tipo Nightscout usando `find[...]`, por ejemplo `find[eventType]=Correction Bolus`
- persistencia de campos habituales como `eventType`, `created_at`, `mills`, `insulin`, `carbs`, `notes` y `enteredBy`
- conservación de campos adicionales enviados por el cliente

Limitaciones actuales:

- todavía no existe `DELETE /api/v1/treatments`
- todavía no existe `DELETE /api/v1/treatments/{id}`
- no implementa aún todo el comportamiento de UUIDs y reconciliación de Nightscout

## Soporte De Profiles

TinyScout Lite ahora incluye compatibilidad mínima con perfiles Nightscout para integraciones como `tconnectsync`.

El soporte actual incluye:

- `GET /api/v1/profile/current` y `.json`
- `GET /api/v1/profile` y `.json`
- `POST` y `PUT` de un objeto de perfil Nightscout
- persistencia del último perfil guardado

Limitaciones actuales:

- no mantiene historial de múltiples perfiles con distintas `startDate`
- no implementa borrado de perfiles
- `devicestatus` sigue devolviendo una colección vacía

## Resolución De Problemas

### No Llegan Datos

- Revisa que xDrip+ use la URL completa con `/api/v1/`.
- Comprueba que `API_SECRET` sea correcto.
- Revisa `/health` para ver si hay lecturas y treatments recientes.

### API_SECRET Incorrecto

- Si el `POST` devuelve `401`, comprueba que estás usando el secreto de 6 caracteres mostrado en la primera pantalla de setup.
- Si quieres sustituirlo manualmente, guarda un nuevo override con `wrangler secret put API_SECRET`.
- Si usas `https://SECRET@host/...`, asegúrate de que el cliente envíe Basic Auth correctamente.

### xDrip+ Sin `/api/v1/`

- Muchas integraciones fallan si la URL termina antes. Usa exactamente `https://API_SECRET@tu-worker.workers.dev/api/v1/`.

### Lecturas Antiguas

- TinyScout Lite conserva solo las últimas `MAX_ENTRIES`.
- Si el reloj del móvil está mal, las lecturas pueden entrar con fechas antiguas.

### Diferencia Horaria

- `dateString` se guarda en ISO UTC.
- Comprueba la zona horaria y la hora del dispositivo que envía los datos.

## Desarrollo Local

```bash
npm install
npm run test
npm run dev
```
