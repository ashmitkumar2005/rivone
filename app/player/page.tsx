"use client";

import { useState } from "react";
import Link from "next/link";
import { songs, Song } from "@/lib/songs";

export default function PlayerPage() {
    const [currentSong, setCurrentSong] = useState<Song | null>(null);

    return (
        <main className="flex flex-1 flex-col p-8 overflow-hidden bg-black min-h-screen text-white">
            <header className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Song Registry</h2>
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
                    Exit
                </Link>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {songs.map((song) => (
                    <button
                        key={song.id}
                        onClick={() => setCurrentSong(song)}
                        className={`w-full text-left p-4 border border-zinc-800 rounded-xl transition-colors ${currentSong?.id === song.id ? "bg-white text-black" : "hover:bg-zinc-900"
                            }`}
                    >
                        <div>
                            <p className="font-bold">{song.title}</p>
                            <p className="text-sm opacity-70">{song.artist}</p>
                        </div>
                    </button>
                ))}
            </div>

            <footer className="mt-8 pt-6 border-t border-zinc-800">
                <div className="space-y-4">
                    <div>
                        <p className="text-lg font-bold">
                            {currentSong ? `Playing: ${currentSong.title}` : "Select a song"}
                        </p>
                        <p className="text-sm text-zinc-400">
                            {currentSong ? currentSong.artist : "Streaming from Telegram..."}
                        </p>
                    </div>
                    <audio
                        controls
                        autoPlay
                        key={currentSong?.id}
                        className="w-full"
                        src={currentSong ? `/api/stream?id=${currentSong.fileId}` : undefined}
                    >
                        Your browser does not support HTML5 audio.
                    </audio>
                </div>
            </footer>
        </main>
    );
}
