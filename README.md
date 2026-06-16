# TinyScout Lite

TinyScout Lite is a very small Nightscout-compatible service that you can deploy for free on Cloudflare.

Its purpose is simple: receive glucose data from `xDrip+` and make it available to apps that already know how to talk to Nightscout.

Spanish version: see [README.es.md](README.es.md).  
Technical guide: see [README.technical.md](README.technical.md).

## In One Sentence

TinyScout Lite lets you store your glucose data in the cloud for free, simply and easily.

## Important Warning

- This is not a medical device.
- Do not use it for dosing or treatment decisions.
- Use it only as a backup or recovery option.

## Who This Is For

This project is for you if:

- you already use `xDrip+`
- you want a free cloud deployment
- you want a simple backup if your main provider fails
- you use Nightscout-compatible apps such as `Zukkah`
- you do not want to maintain a full Nightscout installation

## What It Does

- Receives glucose readings from `xDrip+`
- Stores recent readings and treatments
- Works with Nightscout-compatible apps
- Shows a simple health page in the browser

## What It Does Not Do

- It is not full Nightscout
- It is not your primary medical system
- It does not include charts, reports, or advanced analysis

If you want a complete web app with charts and reports, full Nightscout is a better fit.

## Fastest Free Deployment

The easiest option is the official Cloudflare flow:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Deploy In 3 Steps

1. Click the `Deploy to Cloudflare` button.
2. Follow the Cloudflare screens until the deployment finishes.
3. Open the URL Cloudflare gives you, for example `https://your-worker.workers.dev/health`.

On the first visit, TinyScout Lite creates a 6-character `API_SECRET` automatically and shows it once. Save it immediately, because you will need it in `xDrip+`.

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

English `health` page example:

![English health page example](docs/images/health-en.png)

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
- Advanced users can replace it manually; see [README.technical.md](README.technical.md)

### The Page Opens But Data Is Old

- Check the phone time and timezone
- TinyScout Lite only keeps the most recent entries

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
