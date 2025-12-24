# Rivone 🎵

**Private. Floating. Instant.**

Rivone is an experimental music player engineered for the Edge. It redefines personal music streaming by combining the privacy of Telegram with the performance of Cloudflare's global network.

![Rivone Player](https://indiehackers.com/images/default-avatar.png) 
*(Project Screenshot Placeholder)*

## 💡 The Concept

Most music players are clunky and privacy-invasive. Rivone is different:
- **Floating UI**: A glassmorphism-inspired interface that floats above your workflow.
- **Instant Sync**: Wirelessly syncs your personal library in seconds.
- **Edge Powered**: Zero-latency streaming from the nearest server location globally.

## 🚀 Deployment (Cloudflare Pages)

This project is optimized for **Cloudflare Pages** with Edge Runtime.

### Prerequisites
1.  **Cloudflare Account**: Required for Pages and KV.
2.  **Telegram Bot**: Required for file synchronization.

### Environment Variables
Set the following in your **Cloudflare Pages Dashboard**:
-   `PROJECT_PASSWORD`: Secure access code for the player.
-   `BOT_TOKEN`: Telegram Bot API Token.

### KV Namespace
1.  Create a KV Namespace named `rivone` in Cloudflare.
2.  Bind it to your Pages project with the variable name: `RIVONE_KV`.

### Build Settings
-   **Framework Preset**: Next.js
-   **Build Command**: `npm run pages:build`
-   **Output Directory**: `.vercel/output/static`
-   **Compatibility Flags**: `nodejs_compat`

## 🛠️ Built With

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Platform**: [Cloudflare Pages](https://pages.cloudflare.com/) (Edge Runtime)
-   **Database**: [Cloudflare KV](https://developers.cloudflare.com/kv/) (Distributed Storage)
-   **Styling**: TailwindCSS + Framer Motion
-   **Security**: Middleware Protection + Explicit API Authentication

## 🔒 Security

-   **Zero-Trust API**: All API routes strictly verify authentication cookies.
-   **Middleware Shield**: Unauthorized users are instantly redirected from UI pages.
-   **HttpOnly Cookies**: Prevents client-side script access to credentials.

## ⚠️ Intellectual Property Notice

**Copyright © 2025 Ashmit Kumar. All Rights Reserved.**

This software is **proprietary** and **closed-source**.

The code, design, and architecture contained in this repository are the intellectual property of Ashmit Kumar. Unauthorized copying, reverse engineering, distribution, or commercial use is strictly prohibited.

## 🌐 Connect

-   **GitHub**: [ashmitkumar2005](https://github.com/ashmitkumar2005)
-   **LinkedIn**: [Ashmit Kumar](https://linkedin.com/in/ashmitkumar2005)
-   **Portfolio**: [ashmit-kumar.vercel.app](https://ashmit-kumar.vercel.app)

---

*Designed & Engineered by Ashmit Kumar.*
