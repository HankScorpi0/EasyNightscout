# TinyScout Lite

TinyScout Lite is a minimal server compatible with part of the Nightscout API. It is designed as a secondary or recovery system to receive CGM readings from xDrip+ and make them available to Nightscout-compatible apps.

Spanish version: see [README.es.md](README.es.md).

## What It Is

- A lightweight Cloudflare Worker.
- A receiver for `entries` readings.
- A quick health view at `/health`.
- A low-cost or free option for simple backup access.

## What It Is Not

- It is not full Nightscout.
- It is not a medical device.
- It is not a primary source for clinical decisions.
- It does not store real treatments, boluses, real profiles, or personal data.

## Important Warning

Use it only as a secondary or recovery system. It must not be used for clinical decisions, dosing, or treatment.

## Very Simple Deployment

The best option for non-technical users is the official Cloudflare flow with a public repository and a `Deploy to Cloudflare` button.

Official Cloudflare button:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite)

Once this project is hosted in a public GitHub or GitLab repository, that button will let you deploy it in a few clicks from the browser. Cloudflare recommends this flow to reduce manual configuration.

## Current Quick Deployment

If you do not have the button ready yet, these are the minimum steps:

1. Install dependencies:

```bash
npm install
```

2. Log in:

```bash
npm run cf:login
```

3. Deploy:

```bash
npm run deploy
```

4. Open the health page:

```text
https://your-worker.workers.dev/health
```

On the first visit, TinyScout Lite generates an `API_SECRET` automatically and shows it once on the final setup screen. Save that secret and use it in xDrip+.

If you want to validate the bundle before uploading it:

```bash
npm run cf:deploy:dry
```

## Deployment From the Cloudflare Dashboard

If you prefer to avoid the terminal, Cloudflare also lets you import a GitHub or GitLab repository from `Workers & Pages` and deploy from there. For non-technical users, this is usually the second-best option after the deploy button.

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

You can also check:

```text
https://your-worker.workers.dev/api/v1/status.json
```

## Environment Variables

- `API_SECRET`: optional override. If omitted, TinyScout Lite generates one automatically on first setup.
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
- `GET /api/v1/profile`
- `GET /api/v1/profile.json`
- `GET /api/v1/devicestatus`
- `GET /api/v1/devicestatus.json`
- `GET /health`

## Troubleshooting

### No Data Arrives

- Check that xDrip+ is using the full URL with `/api/v1/`.
- Verify that `API_SECRET` is correct.
- Check `/health` to see whether recent readings are present.

### Incorrect API_SECRET

- If the `POST` returns `401`, save the secret again with `wrangler secret put API_SECRET`.
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
