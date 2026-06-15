# TinyScout Lite

TinyScout Lite is a simple and free backup for your glucose data.

It receives readings from `xDrip+` and shows them through a small web page and Nightscout-compatible endpoints. It is meant to be a secondary or recovery system, not your main system.

Spanish version: see [README.es.md](README.es.md).

## In One Sentence

If your main Nightscout setup is unavailable, TinyScout Lite gives you a very small backup you can deploy for free on Cloudflare in a few clicks.

## Important Warning

- This is not a medical device.
- Do not use it for dosing or treatment decisions.
- Use it only as a backup or recovery option.

## Who This Is For

This project is for you if:

- you already use `xDrip+`
- you want a simple backup
- you want something free or very low cost
- you do not want to manage a full Nightscout installation

## What It Does

- Receives glucose readings from `xDrip+`
- Stores recent readings
- Stores `treatments`
- Shows a simple status page in the browser
- Offers basic Nightscout-compatible endpoints for compatible apps

## What It Does Not Do

- It is not full Nightscout
- It is not your primary system
- It does not include every Nightscout feature

## Fastest Free Deployment

The easiest way is the official Cloudflare flow:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Deploy In 3 Steps

1. Click the `Deploy to Cloudflare` button.
2. Follow the Cloudflare screens until the deployment finishes.
3. Open the URL Cloudflare gives you, for example `https://your-worker.workers.dev/health`.

On the first visit, TinyScout Lite creates a 6-character `API_SECRET` automatically and shows it once. Save it immediately. You will need it in `xDrip+`.

## Configure xDrip+

In `xDrip+`, use the `Nightscout Sync REST API` option and enter:

```text
https://API_SECRET@your-worker.workers.dev/api/v1/
```

Replace:

- `API_SECRET` with your 6-character secret
- `your-worker.workers.dev` with your Cloudflare URL

Important:

- keep `/api/v1/` exactly as shown
- do not remove the final `/`

## Check That It Works

Open this page in your browser:

```text
https://your-worker.workers.dev/health
```

Spanish page:

```text
https://your-worker.workers.dev/es/health
```

You should see:

- the latest glucose reading
- the latest treatment, if any
- how many readings are stored
- how many treatments are stored

You can also check:

```text
https://your-worker.workers.dev/api/v1/status.json
```

## If Something Does Not Work

### No Data Appears

- Check that `xDrip+` is using the full URL with `/api/v1/`
- Check that the `API_SECRET` is correct
- Open `/health` and see whether recent readings appear

### Error 401

- The secret is probably wrong
- Use the same 6-character secret shown during the first setup

### You Forgot The Secret

- The easiest fix is usually to deploy again and save the new secret carefully
- Advanced users can replace it manually with Wrangler secrets

### The Page Opens But Data Is Old

- Check the phone time and timezone
- TinyScout Lite only keeps the most recent entries

## Advanced Notes

TinyScout Lite also supports:

- `entries`
- `treatments`
- minimal `profile` support
- `devicestatus` as an empty collection for compatibility

Current profile support includes:

- `GET /api/v1/profile/current`
- `GET /api/v1/profile`
- `POST /api/v1/profile`
- `PUT /api/v1/profile`

Current limitations:

- it is not full Nightscout
- it does not implement delete routes for `treatments`
- it does not keep full profile history

## Technical Reference

### Environment Variables

- `API_SECRET`: optional manual secret override
- `READ_PUBLIC`: `true` in this configuration
- `MAX_ENTRIES`: `2000` by default

### Main Endpoints

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

## Local Development

```bash
npm install
npm run test
npm run dev
```
