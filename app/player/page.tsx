"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { songs, Song } from "@/lib/songs";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";

export default function PlayerPage() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isHoveringUI, setIsHoveringUI] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.__isHoveringUI = isHoveringUI;
        }
    }, [isHoveringUI]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const handleSongClick = (song: Song) => {
        setCurrentSong(song);
        if (audioRef.current) {
            audioRef.current.src = `/api/stream?id=${song.fileId}`;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentSong) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const vol = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = vol;
            setVolume(vol);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-black">
            <div className={`transition-opacity duration-300 ${isHoveringUI ? "pointer-events-none" : "pointer-events-auto"}`}>
                <LiquidEffectAnimation />
            </div>
            <div className="absolute inset-0 bg-black/85 z-0 pointer-events-none" />

            <div
                className="relative z-10 w-full max-w-2xl bg-black backdrop-blur-[150px] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[85vh]"
                onMouseEnter={() => setIsHoveringUI(true)}
                onMouseLeave={() => setIsHoveringUI(false)}
            >
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                            Song Registry
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Select a track to stream</p>
                    </div>
                    <Link href="/" className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                        Exit
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {songs.map((song) => (
                        <button
                            key={song.id}
                            onClick={() => handleSongClick(song)}
                            className={`w-full text-left p-5 border rounded-2xl transition-all duration-300 group ${currentSong?.id === song.id
                                ? "bg-white border-white scale-[1.02] shadow-lg shadow-white/10"
                                : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`font-bold text-lg transition-colors ${currentSong?.id === song.id ? "text-black" : "text-white"}`}>
                                        {song.title}
                                    </p>
                                    <p className={`text-sm transition-colors ${currentSong?.id === song.id ? "text-black/60" : "text-zinc-400"}`}>
                                        {song.artist}
                                    </p>
                                </div>
                                {currentSong?.id === song.id && (
                                    <div className="flex gap-1 items-end h-4">
                                        <div className="w-1 bg-black animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                        <div className="w-1 bg-black animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                        <div className="w-1 bg-black animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <audio ref={audioRef} />

            {currentSong && (
                <div
                    className="fixed bottom-0 left-0 right-0 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
                    onMouseEnter={() => setIsHoveringUI(true)}
                    onMouseLeave={() => setIsHoveringUI(false)}
                >
                    <div className="bg-black/95 backdrop-blur-[100px] border-t border-white/5 p-6 md:px-12">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <div className="flex-1 min-w-0 flex items-center gap-4 text-center md:text-left">
                                <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                                    <span className="text-xl">🎵</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-lg truncate text-white">{currentSong.title}</p>
                                    <p className="text-sm text-zinc-400 truncate">{currentSong.artist}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 w-full md:w-[450px]">
                                <div className="flex items-center gap-6 w-full">
                                    <button
                                        onClick={togglePlay}
                                        className="p-4 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 shrink-0"
                                    >
                                        {isPlaying ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>
                                    <div className="flex-1 flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-medium text-zinc-500 tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 0}
                                                step="0.01"
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all"
                                            />
                                            <span className="text-[10px] font-medium text-zinc-500 tabular-nums w-10">{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-32 shrink-0">
                                <svg className="w-4 h-4 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolume}
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes music-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 16px; }
                }
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
