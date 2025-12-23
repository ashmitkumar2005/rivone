"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer
            className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center h-[28px] bg-black/40 backdrop-blur-md"
        >
            <Link
                href="https://ashmit-kumar.vercel.app"
                target="_blank"
                className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide group cursor-pointer"
            >
                <span className="text-white/40 group-hover:text-white/60 transition-colors">
                    Made with
                </span>
                <span className="animate-heartbeat text-red-500/80 group-hover:text-red-500 transition-colors">
                    ❤️
                </span>
                <span className="text-white/70 group-hover:text-white transition-colors">
                    by Ashmit Kumar
                </span>
            </Link>
        </footer>
    );
}
