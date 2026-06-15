# TinyScout Lite

TinyScout Lite es un respaldo simple y gratuito para tus datos de glucosa.

Recibe lecturas desde `xDrip+` y las muestra en una pequeña página web y en endpoints compatibles con Nightscout. Está pensado como sistema secundario o de recuperación, no como sistema principal.

Version in English: see [README.md](README.md).

## En Una Frase

Si tu Nightscout principal no está disponible, TinyScout Lite te da un respaldo muy pequeño que puedes desplegar gratis en Cloudflare en pocos clics.

## Advertencia Importante

- No es un dispositivo médico.
- No debe usarse para dosificación ni decisiones de tratamiento.
- Úsalo solo como respaldo o recuperación.

## Para Quién Es

Este proyecto es para ti si:

- ya usas `xDrip+`
- quieres un respaldo sencillo
- quieres algo gratis o de coste muy bajo
- no quieres mantener una instalación completa de Nightscout

## Qué Hace

- Recibe lecturas de glucosa desde `xDrip+`
- Guarda lecturas recientes
- Guarda `treatments`
- Muestra una página simple de estado en el navegador
- Ofrece endpoints básicos compatibles con Nightscout para apps compatibles

## Qué No Hace

- No es Nightscout completo
- No es tu sistema principal
- No incluye todas las funciones de Nightscout

## Despliegue Gratis Más Rápido

La forma más fácil es usar el flujo oficial de Cloudflare:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Despliegue En 3 Pasos

1. Haz clic en el botón `Deploy to Cloudflare`.
2. Sigue las pantallas de Cloudflare hasta que termine el despliegue.
3. Abre la URL que te da Cloudflare, por ejemplo `https://tu-worker.workers.dev/health`.

En la primera visita, TinyScout Lite crea automáticamente un `API_SECRET` de 6 caracteres y lo muestra una sola vez. Guárdalo en ese momento. Lo necesitarás en `xDrip+`.

## Configurar xDrip+

En `xDrip+`, usa la opción `Nightscout Sync REST API` e introduce:

```text
https://API_SECRET@tu-worker.workers.dev/api/v1/
```

Sustituye:

- `API_SECRET` por tu secreto de 6 caracteres
- `tu-worker.workers.dev` por la URL de Cloudflare

Importante:

- mantén `/api/v1/` exactamente como aparece
- no borres la `/` final

## Cómo Comprobar Que Funciona

Abre esta página en tu navegador:

```text
https://tu-worker.workers.dev/health
```

Página en español:

```text
https://tu-worker.workers.dev/es/health
```

Deberías ver:

- la última lectura de glucosa
- el último tratamiento, si existe
- cuántas lecturas hay guardadas
- cuántos tratamientos hay guardados

También puedes revisar:

```text
https://tu-worker.workers.dev/api/v1/status.json
```

## Si Algo No Funciona

### No Aparecen Datos

- Comprueba que `xDrip+` use la URL completa con `/api/v1/`
- Comprueba que el `API_SECRET` sea correcto
- Abre `/health` y revisa si aparecen lecturas recientes

### Error 401

- Lo más probable es que el secreto sea incorrecto
- Usa el mismo secreto de 6 caracteres que viste en la primera configuración

### Has Olvidado El Secreto

- La solución más sencilla suele ser desplegar de nuevo y guardar bien el nuevo secreto
- Los usuarios avanzados pueden cambiarlo manualmente con Wrangler secrets

### La Página Abre Pero Los Datos Son Antiguos

- Revisa la hora y la zona horaria del teléfono
- TinyScout Lite solo conserva las lecturas más recientes

## Notas Avanzadas

TinyScout Lite también soporta:

- `entries`
- `treatments`
- soporte mínimo de `profile`
- `devicestatus` como colección vacía por compatibilidad

El soporte actual de perfiles incluye:

- `GET /api/v1/profile/current`
- `GET /api/v1/profile`
- `POST /api/v1/profile`
- `PUT /api/v1/profile`

Limitaciones actuales:

- no es Nightscout completo
- no implementa rutas de borrado para `treatments`
- no guarda historial completo de perfiles

## Referencia Técnica

### Variables De Entorno

- `API_SECRET`: secreto manual opcional
- `READ_PUBLIC`: `true` en esta configuración
- `MAX_ENTRIES`: `2000` por defecto

### Endpoints Principales

- `POST /api/v1/entries`
- `GET /api/v1/entries`
- `GET /api/v1/entries/current`
- `GET /api/v1/status.json`
- `POST /api/v1/treatments`
- `GET /api/v1/treatments`
- `GET /api/v1/profile/current`
- `GET /api/v1/profile`
- `POST /api/v1/profile`
- `PUT /api/v1/profile`
- `GET /api/v1/devicestatus`
- `GET /health`
- `GET /es/health`

## Desarrollo Local

```bash
npm install
npm run test
npm run dev
```
