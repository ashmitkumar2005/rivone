# RIVONE

**Private Music. Your Space.**

RIVONE is a high-fidelity, personal music streaming application built with Next.js. It features a stunning, immersive UI with liquid background effects, seamless Telegram-based audio streaming, and a glassmorphism aesthetic.
<img width="1916" height="1008" alt="image" src="https://github.com/user-attachments/assets/c3c5b5be-35e4-4eb1-b81f-14b24cd05baf" />
<img width="1909" height="1008" alt="image" src="https://github.com/user-attachments/assets/36d4a4df-884d-48c8-80f3-b00dc6a70f57" />
<img width="1912" height="1013" alt="image" src="https://github.com/user-attachments/assets/707b9091-9a44-4bd1-904b-7f142cf6ec31" />




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

&copy; 2024 RIVONE. All rights reserved.
