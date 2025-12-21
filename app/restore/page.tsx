"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Song } from "@/lib/songs";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";

export default function RestorePage() {
    const [deletedSongs, setDeletedSongs] = useState<Song[]>([]);
    const [isRestoring, setIsRestoring] = useState<string | null>(null);

    const fetchDeletedSongs = async () => {
        try {
            const res = await fetch("/api/songs/deleted");
            const data = await res.json();
            if (Array.isArray(data)) {
                setDeletedSongs(data);
            }
        } catch (error) {
            console.error("Failed to fetch deleted songs:", error);
        }
    };

    useEffect(() => {
        fetchDeletedSongs();
    }, []);

    const handleRestore = async (id: string) => {
        setIsRestoring(id);
        try {
            const res = await fetch("/api/songs/restore", {
                method: "POST",
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                await fetchDeletedSongs();
            }
        } catch (error) {
            console.error("Restore failed:", error);
        } finally {
            setIsRestoring(null);
        }
    };

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                <LiquidEffectAnimation />
            </div>
            <div className="absolute inset-0 bg-black/50 z-0 pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-white/50 bg-clip-text text-transparent">
                            Trash Bin
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Restore deleted tracks</p>
                    </div>
                    <Link href="/player" className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-medium">
                        Back to Player
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {deletedSongs.length === 0 ? (
                        <div className="text-center py-20 text-zinc-500">
                            No deleted songs found.
                        </div>
                    ) : (
                        deletedSongs.map((song) => (
                            <div
                                key={song.id}
                                className="w-full flex items-center justify-between p-5 border border-white/10 rounded-2xl bg-white/[0.02]"
                            >
                                <div className="flex items-center gap-4 min-w-0 pr-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                                        {song.thumbId ? (
                                            <img src={`/api/stream?id=${song.thumbId}`} alt={song.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg">🗑️</span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-lg text-white truncate">{song.title}</p>
                                        <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRestore(song.id)}
                                    disabled={isRestoring === song.id}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 border border-white/10 transition-all text-sm font-medium whitespace-nowrap"
                                >
                                    {isRestoring === song.id ? "Restoring..." : "Restore"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </main>
    );
}
