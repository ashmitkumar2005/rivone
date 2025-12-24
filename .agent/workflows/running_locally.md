---
description: Running the project locally with Cloudflare Pages simulation
---

Since this project uses Cloudflare-specific features (Edge Runtime, KV, Bindings), standard `npm run dev` will not work for backend logic. You must use the preview command.

## Prerequisites
1.  **Node.js**: Installed.
2.  **Dependencies**: Run `npm install`.
3.  **Local Secrets**: Ensure you have a `.dev.vars` file in the root directory (this is like `.env.local` but for Wrangler).
    ```env
    # .dev.vars
    BOT_TOKEN="your_telegram_bot_token"
    ```

## Running the App
To start the local server with full Cloudflare simulation (KV, Workers):

```bash
npm run preview
```

This command does two things:
1.  **Builds** the Next.js app for Cloudflare Pages (`npm run pages:build`).
2.  **Serves** the static output using Wrangler (`npx wrangler pages dev ...`).

The app will be available at `http://localhost:8788`.

## Important Notes
- **Rebuilding**: Since this uses a build step, changes to the code are **not hot-reloaded**. You must stop and run `npm run preview` again to see changes.
- **Database**: Wrangler creates a local simulation of the `RIVON_DB` KV store in `.wrangler/state/v3/kv`. It allows you to test persistence locally.
