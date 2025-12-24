"use client";

import React, { memo } from "react";
import { Song } from "@/lib/songs";

interface SongListProps {
    songs: Song[];
    currentSong: Song | null;
    onSongClick: (song: Song) => void;
    onDeleteClick: (e: React.MouseEvent, id: string) => void;
}

const SongList = memo(({ songs, currentSong, onSongClick, onDeleteClick, isLoading }: SongListProps & { isLoading?: boolean }) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-[72px] md:h-[80px] p-2 md:p-3 border border-white/5 rounded-[2rem] md:rounded-2xl flex items-center gap-3 md:gap-4 animate-pulse">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-1/3" />
                            <div className="h-3 bg-white/10 rounded w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {songs.map((song) => (
                <div
                    role="button"
                    key={song.id}
                    onClick={() => onSongClick(song)}
                    className={`w-full text-left p-2 md:p-3 border rounded-[2rem] md:rounded-2xl transition-all duration-300 group flex items-center gap-3 md:gap-4 cursor-pointer select-none ${currentSong?.id === song.id
                        ? "bg-white/10 border-white/20 shadow-lg"
                        : "border-transparent hover:bg-white/5 hover:border-white/10"
                        }`}
                >
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
                        {song.thumbId ? (
                            <img
                                src={`/api/stream?id=${song.thumbId}`}
                                alt={song.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
                        )}
                        {currentSong?.id === song.id && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm md:text-base truncate transition-colors ${currentSong?.id === song.id ? "text-white" : "text-zinc-300 group-hover:text-white"
                            }`}>
                            {song.title}
                        </p>
                        <p className="text-xs md:text-sm text-zinc-500 truncate group-hover:text-zinc-400">
                            {song.artist}
                        </p>
                    </div>
                    <button
                        onClick={(e) => onDeleteClick(e, song.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-full transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                        title="Delete song"
                        aria-label="Delete song"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
});

SongList.displayName = "SongList";

export default SongList;
