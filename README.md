# TinyScout Lite

TinyScout Lite is a minimal server compatible with part of the Nightscout API. It is designed as a secondary or recovery system to receive CGM readings from xDrip+ and make them available to Nightscout-compatible apps.

Spanish version: see [README.es.md](README.es.md).

## What It Is

- A lightweight Cloudflare Worker.
- A receiver for `entries` readings and `treatments`.
- A quick health view at `/health`.
- A low-cost or free option for simple backup access.

## What It Is Not

- It is not full Nightscout.
- It is not a medical device.
- It is not a primary source for clinical decisions.
- It does not implement full Nightscout profile or devicestatus support.
- It does not yet implement the full Nightscout treatments feature set such as delete routes or advanced reconciliation behavior.

## Important Warning

Use it only as a secondary or recovery system. It must not be used for clinical decisions, dosing, or treatment.

## Very Simple Deployment

The best option for non-technical users is the official Cloudflare flow with a public repository and a `Deploy to Cloudflare` button.

Official Cloudflare button:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

This project can be deployed in a few clicks using the `Deploy to Cloudflare` button. Cloudflare recommends this flow to reduce manual configuration.

On the first visit, TinyScout Lite generates a 6-character `API_SECRET` automatically and shows it once on the final setup screen. Save that secret and use it in xDrip+.

## xDrip+ Configuration

Use the Nightscout Sync REST API option and point it to:

```text
https://API_SECRET@your-worker.workers.dev/api/v1/
```

It is important to keep the `/api/v1/` suffix.

## How To Check That It Works

Open:

```text
https://your-worker.workers.dev/health
```

The health page shows:

- the latest glucose reading
- the latest treatment
- the number of stored readings
- the number of stored treatments

You can also check:

```text
https://your-worker.workers.dev/api/v1/status.json
```

## Environment Variables

- `API_SECRET`: optional override. If omitted, TinyScout Lite generates a 6-character secret automatically on first setup.
- `READ_PUBLIC`: `true` in this configuration. The GET routes for readings and status are public to make browser access easier.
- `MAX_ENTRIES`: `2000` by default.

## Available Endpoints

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

## Treatments Support

TinyScout Lite now stores and returns Nightscout-style `treatments`.

Current support includes:

- `POST` of a single treatment object or an array of treatments
- `GET` with `count`
- `GET` filters using Nightscout-style `find[...]` query params such as `find[eventType]=Correction Bolus`
- persistence of common treatment fields like `eventType`, `created_at`, `mills`, `insulin`, `carbs`, `notes`, and `enteredBy`
- preservation of additional payload fields when they are sent by the client

Current limitations:

- no `DELETE /api/v1/treatments` yet
- no `DELETE /api/v1/treatments/{id}` yet
- no full Nightscout UUID and reconciliation behavior

## Troubleshooting

### No Data Arrives

- Check that xDrip+ is using the full URL with `/api/v1/`.
- Verify that `API_SECRET` is correct.
- Check `/health` to see whether recent readings and treatments are present.

### Incorrect API_SECRET

- If the `POST` returns `401`, verify you are using the 6-character secret shown during the first setup screen.
- If you want to replace it manually, save a new override with `wrangler secret put API_SECRET`.
- If you use `https://SECRET@host/...`, make sure the client sends Basic Auth correctly.

### xDrip+ Without `/api/v1/`

- Many integrations fail if the URL ends earlier. Use exactly `https://API_SECRET@your-worker.workers.dev/api/v1/`.

### Old Readings

- TinyScout Lite keeps only the latest `MAX_ENTRIES`.
- If the phone clock is wrong, readings may arrive with old timestamps.

### Time Difference

- `dateString` is stored in ISO UTC.
- Check the timezone and clock of the device sending the data.

## Local Development

```bash
npm install
npm run test
npm run dev
```
