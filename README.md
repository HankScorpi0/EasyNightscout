# GlucoEasy

GlucoEasy is a secondary glucose monitoring service you can deploy for free on Cloudflare.

It was built for a very specific case: when your main service or official provider fails, having a lightweight secondary service gives you peace of mind without forcing you into a heavy deployment.

GlucoEasy keeps the essentials:

- act as a fallback when your primary service is down
- keep exposing a Nightscout-compatible API
- let you use apps like `xDrip+`, `Zukkah`, and other Nightscout-compatible clients
- stay very easy to install and free to deploy in the cloud

Spanish version: see [README.es.md](README.es.md).  
Technical guide: see [README.technical.md](README.technical.md).

## In One Sentence

GlucoEasy is your peace-of-mind secondary service: when the primary one fails, you still have a Nightscout-compatible layer that is easy to install and free in the cloud.

## Important Warning

- This is not a medical device.
- Do not use it for dosing or treatment decisions.
- Use it only as a backup, recovery, or lightweight compatibility layer.

## Who This Is For

This project is for you if:

- you want a secondary option when the primary service fails
- you already use `xDrip+`, `Zukkah`, or any Nightscout-compatible app
- you want something very easy to install and maintain
- you want a free cloud deployment
- you mainly care about glucose readings, boluses, and broad ecosystem compatibility

## What It Does

- Receives glucose readings from `xDrip+`
- Stores recent readings and treatments
- Mirrors the Nightscout API shape used by existing clients
- Works as a secondary layer for Nightscout-compatible apps and tools
- Shows a simple health page in the browser

## What It Does Not Do

- It is not full Nightscout
- It is not your primary medical system
- It does not include charts, reports, or advanced analysis

If you need the complete Nightscout experience, full Nightscout is still the better fit.

## Why It Exists

The goal is not to replace your main system.

The goal is to make sure that if your official provider or primary service fails, you still have a simple path to keep using the Nightscout ecosystem you already know.

## Fastest Free Deployment

The easiest option is the official Cloudflare flow:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Install In 3 Steps

1. Click the `Deploy to Cloudflare` button.
2. Follow the Cloudflare screens until the deployment finishes.
3. Open the URL Cloudflare gives you, for example `https://your-worker.workers.dev/health`.

On the first visit, GlucoEasy creates a 6-character `API_SECRET` automatically and shows it once. Save it immediately, because you will need it in `xDrip+` or any compatible client.

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

## Compatible Apps

Because GlucoEasy keeps Nightscout compatibility, you can connect it to:

- `xDrip+`
- `Zukkah`
- other apps or integrations that already speak Nightscout

That is one of its main strengths: you do not need to rebuild your workflow, only add a secondary layer.

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

## Why The Nightscout Compatibility Matters

The main value of GlucoEasy is not just that it is smaller.

It is that you can keep using the ecosystem you already know even as a secondary service:

- mobile apps
- follower tools
- integrations that already talk to the Nightscout API

That means less migration friction and a much more practical fallback plan.

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
- GlucoEasy only keeps the most recent entries

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
