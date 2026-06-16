# Guía Técnica De TinyScout Lite

Este documento es para desarrolladores y usuarios avanzados.  
Si solo quieres desplegarlo y configurarlo en `xDrip+`, consulta [README.es.md](README.es.md).

Version in English: see [README.technical.md](README.technical.md).

## Alcance

TinyScout Lite es un servicio reducido compatible con Nightscout diseñado para:

- aceptar `entries`
- aceptar `treatments`
- ofrecer compatibilidad mínima con `profile`
- exponer una página de health/status
- mantener el despliegue muy pequeño y sencillo

Limitaciones actuales:

- no es Nightscout completo
- el borrado de `treatments` es mínimo y busca sobre todo compatibilidad con clientes
- no guarda historial completo de perfiles
- `devicestatus` se expone como colección vacía por compatibilidad

## Variables De Entorno

- `API_SECRET`: secreto manual opcional
- `READ_PUBLIC`: `true` en esta configuración
- `MAX_ENTRIES`: `2000` por defecto
- `HEALTH_REFRESH_SECONDS`: `30` por defecto, valor efectivo mínimo `5`

## Endpoints Principales

- `POST /api/v1/entries`
- `GET /api/v1/entries`
- `GET /api/v1/entries/current`
- `GET /api/v1/status.json`
- `POST /api/v1/treatments`
- `GET /api/v1/treatments`
- `DELETE /api/v1/treatments/:id`
- `GET /api/v1/profile/current`
- `GET /api/v1/profile`
- `POST /api/v1/profile`
- `PUT /api/v1/profile`
- `GET /api/v1/devicestatus`
- `GET /health`
- `GET /es/health`

## Soporte De Profile

El soporte actual de perfiles incluye:

- `GET /api/v1/profile/current`
- `GET /api/v1/profile`
- `POST /api/v1/profile`
- `PUT /api/v1/profile`

## Gestión Del Secreto

En la primera visita, TinyScout Lite puede generar automáticamente un `API_SECRET` de 6 caracteres y mostrarlo una sola vez.

Si necesitas gestionarlo manualmente, define `API_SECRET` tú mismo en la configuración del Worker de Cloudflare.

## Desarrollo Local

```bash
npm install
npm run test
npm run dev
```

## Licencia

Este proyecto está licenciado bajo MIT. Consulta [LICENSE](LICENSE).
