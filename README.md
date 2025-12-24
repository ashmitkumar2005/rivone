# Rivone 🎵

A modern, floating-style music player built for the Edge. Rivone streams and syncs audio files directly from Telegram, leveraging Cloudflare's global network for instant access and low latency.

## ✨ Features

- **Cloudflare Edge Runtime**: Fully optimized for Cloudflare Pages and Workers.
- **Telegram Sync**: Automatically fetches audio files from a Telegram Bot.
- **KV Storage**: Uses Cloudflare KV (`RIVONE_KV`) for persistent metadata storage.
- **Floating UI**: A beautiful, responsive floating player built with Tailwind CSS.
- **Zero-Node.js**: Runs entirely on web standard APIs (Fetch, Request, Response).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Adapter**: [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages)
- **Database**: [Cloudflare KV](https://developers.cloudflare.com/kv/)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Cloudflare Account
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Installation

```bash
git clone https://github.com/ashmitkumar2005/rivone-workers.git
cd rivone-workers
npm install
```

### 2. Local Development

To run the project locally with full Cloudflare simulation:

1.  **Configure Secrets**:
    Create a `.dev.vars` file in the root directory:
    ```env
    BOT_TOKEN=your_telegram_bot_token_here
    ```

2.  **Start Preview Server**:
    Rivone uses `wrangler` to simulate the Edge environment locally.
    ```bash
    npm run preview
    ```
    Visit `http://localhost:3000`.

> **Note**: Standard `npm run dev` will not work correctly for backend logic because it does not simulate the KV storage or Edge Runtime context provided by Cloudflare.

## 📦 Deployment

### 1. Push to GitHub
Commit your changes and push to your repository.

### 2. Cloudflare Pages
1.  Connect your repository to **Cloudflare Pages**.
2.  **Build Command**: `npx @cloudflare/next-on-pages@1`
3.  **Output Directory**: `.vercel/output/static`
4.  **Compatibility Flags**: Add `nodejs_compat` in Settings -> Build.

### 3. Environment Config (Critical)
After your project is created, you must configure the backend:

1.  **Variables**: Add `BOT_TOKEN` in **Settings -> Environment Variables**.
2.  **KV Namespace**:
    - Go to **Settings -> Functions -> KV Namespace Bindings**.
    - Create/Add a binding named **exactly** `RIVONE_KV`.
    - Map it to a new KV namespace (e.g., `rivon-prod`).

## 🔄 How Sync Works

1.  **Forward Songs**: Forward mp3 files to your connected Telegram Bot.
2.  **Click Sync**: In the Rivone app player, click the "Sync" button.
3.  **Indexing**: The app fetches pending updates from Telegram and stores song metadata (Title, Artist, File ID) into your `RIVONE_KV` database.
4.  **Streaming**: Songs are streamed directly using the Telegram File ID.

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/app/api`: Edge API routes (`sync`, `songs`, `stream`, etc.).
- `/lib`: Helper functions.
- `wrangler.jsonc`: Cloudflare Workers configuration.

---

Made with ❤️ by Ashmit Kumar
