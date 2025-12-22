# RIVONE

**Private Music. Your Space.**

RIVONE is a high-fidelity, personal music streaming application built with Next.js. It features a stunning, immersive UI with liquid background effects, seamless Telegram-based audio streaming, and a glassmorphism aesthetic.
<img width="1920" height="1080" alt="Screenshot_20251222_225809" src="https://github.com/user-attachments/assets/d75d9f89-cd1b-4462-88e0-05d7d3ba9153" />
<img width="1920" height="1080" alt="Screenshot_20251222_225842" src="https://github.com/user-attachments/assets/a0e806cc-52e9-4cea-98f1-3bc02afa62e7" />
<img width="1920" height="1080" alt="Screenshot_20251222_225922" src="https://github.com/user-attachments/assets/7509eb2f-1165-484d-a76a-016a03d8824b" />



##  Features

-   **Immersive Visuals**:
    -   **Liquid Background**: Interactive, audio-reactive 3D liquid simulation using Three.js.
    -   **Glassmorphism UI**: Premium, frosted-glass styling for all components.
    -   **Dynamic Animations**: Smooth transitions powered by Framer Motion.
    -   **Interactive Logo**: Custom expandable pill-shaped logo in the navbar.

-   **Smart Audio Player**:
    -   **Telegram Integration**: Streams audio files directly from a private Telegram channel.
    -   **Audio Visualization**: Real-time bass reactivity on the background.
    -   **Smart Footer**: A global footer that intelligently docks to the bottom-right when the player is active to avoid clutter.
    -   **Full Playback Controls**: Play, pause, seek, volume, and track info.

-   **Music Management**:
    -   **Sync System**: `Sync` button to fetch the latest audio files from your Telegram channel.
    -   **Song Registry**: A verified list of your available tracks.
    -   **Persistent Deletion**: Delete songs locally, and they stay deleted (via `ignored.json`) even after re-syncing.

##  Tech Stack

-   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: [Framer Motion](https://www.framer.com/motion/)
-   **3D Effects**: [Three.js](https://threejs.org/) & `threejs-components`
-   **Backend**: Next.js API Routes (Node.js runtime)
-   **Database**: Local JSON based (`data/songs.json`) with Telegram as the file host.

##  Getting Started

### Prerequisites

-   Node.js 18+
-   A Telegram Bot Token

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/ashmitkumar2005/rivone.git
    cd rivone
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory and add your keys:
    ```env
    BOT_TOKEN=your_telegram_bot_token
    ```

    *Note: The `BOT_TOKEN` is used to fetch file paths from Telegram's API.*

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser.

##  Project Structure

```
rivone/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes (stream, sync, deletion)
│   ├── player/           # Music Player Page
│   ├── globals.css       # Global styles & animations
│   ├── layout.tsx        # Root layout with Navbar & Footer
│   └── page.tsx          # Homepage
├── components/           # React Components
│   ├── ui/               # Reusable UI elements (Navbar, Footer, LiquidEffect)
│   └── ExpandableLogo.tsx # Custom Logo Component
├── data/                 # Local data storage
│   ├── songs.json        # Synced song list
│   └── ignored.json      # Blacklisted songs
├── public/               # Static assets (images, icons)
└── lib/                  # Utilities (types, helpers)
```

##  Credits

-   **Design & Development**: [Ashmit Kumar](https://ashmit-kumar.vercel.app)
-   **Made with**: ❤️ and Next.js

---

&copy; 2025 RIVONE. All rights reserved.
