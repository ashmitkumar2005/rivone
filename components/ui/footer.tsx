"use client";

import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export function Footer() {
    return (
        <footer className={`fixed bottom-4 left-0 w-full flex justify-center z-10 pointers-events-none ${outfit.className}`}>
            <a
                href="https://github.com/ashmitkumar2005"
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md shadow-lg hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:scale-105 hover:shadow-blue-500/20 border border-white/5"
            >
                <span className="text-[10px] text-gray-400 tracking-wide">Made with</span>
                <span className="text-red-500 animate-pulse text-sm drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">❤️</span>
                <span className="text-[10px] text-gray-400 tracking-wide">by</span>
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Ashmit Kumar
                </span>
            </a>
        </footer>
    );
}
