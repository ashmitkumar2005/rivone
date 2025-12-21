"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { songs as initialSongs, Song } from "@/lib/songs";

declare global {
    interface Window {
        __audioIntensity?: number;
    }
}

export default function PlayerPage() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isHoveringUI, setIsHoveringUI] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const fetchSongs = async () => {
        try {
            const res = await fetch("/api/songs");
            const data = await res.json();
            if (Array.isArray(data)) {
                setSongs(data);
            }
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                await fetchSongs();
            }
        } catch (error) {
            console.error("Sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteSong = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent song selection
        if (!confirm("Are you sure you want to delete this song? it won't be restored by sync.")) return;

        try {
            const res = await fetch("/api/songs/delete", {
                method: "POST",
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                await fetchSongs();
                if (currentSong?.id === id) {
                    setCurrentSong(null);
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                }
            }
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.__isHoveringUI = isHoveringUI;
        }
    }, [isHoveringUI]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Initialize Web Audio API
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            const gainNode = ctx.createGain();
            const source = ctx.createMediaElementSource(audio);

            analyser.fftSize = 256;

            // Connect: Source -> Gain -> Analyser -> Destination
            source.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(ctx.destination);

            // Set initial gain
            gainNode.gain.value = volume;

            audioContextRef.current = ctx;
            analyserRef.current = analyser;
            gainNodeRef.current = gainNode;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const analyze = () => {
                if (analyserRef.current && !audio.paused) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    // Focus more on bass frequencies (first 10 bins) for the pulse
                    const bassSum = dataArray.slice(0, 10).reduce((a, b) => a + b, 0);
                    const average = bassSum / 10;
                    window.__audioIntensity = Math.pow(average / 150, 2);
                } else {
                    window.__audioIntensity = 0;
                }
                requestAnimationFrame(analyze);
            };
            analyze();
        }

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
    }, [isPlaying]);

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

        // Resume AudioContext on interaction
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }

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
        if (audioRef.current && gainNodeRef.current) {
            // Keep native volume at 1 and use gain node for control
            audioRef.current.volume = 1;
            gainNodeRef.current.gain.value = vol;
            setVolume(vol);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none animate-fade-in" />

            <div
                className="relative z-10 w-full max-w-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[85vh] animate-fade-in-up"
                onMouseEnter={() => setIsHoveringUI(true)}
                onMouseLeave={() => setIsHoveringUI(false)}
            >
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 mb-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                            Song Registry
                        </h2>
                        <p className="text-zinc-500 text-sm mt-1">Select a track to stream</p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-3 md:gap-3">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`p-3 md:px-4 md:py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${isSyncing
                                ? "bg-white/5 border-white/5 text-zinc-500 cursor-not-allowed"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                                }`}
                            aria-label="Sync"
                        >
                            <svg className={`w-5 h-5 md:w-4 md:h-4 ${isSyncing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden md:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
                        </button>
                        <Link href="/restore" className="p-3 md:px-4 md:py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-medium flex items-center gap-2" aria-label="Trash">
                            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="hidden md:inline">Trash</span>
                        </Link>
                        <Link href="/" className="p-3 md:px-4 md:py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all text-sm font-medium flex items-center gap-2" aria-label="Exit">
                            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            <span className="hidden md:inline">Exit</span>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-40 md:pb-0">
                    {songs.map((song) => (
                        <button
                            key={song.id}
                            onClick={() => handleSongClick(song)}
                            className={`w-full text-left p-5 border rounded-2xl transition-all duration-300 group ${currentSong?.id === song.id
                                ? "bg-white border-white scale-[1.02] shadow-lg shadow-white/20"
                                : "bg-white/[0.05] border-white/10 hover:border-white/30 hover:bg-white/[0.08]"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1 pr-4">
                                    <p className={`font-bold text-lg transition-colors truncate ${currentSong?.id === song.id ? "text-black" : "text-white"}`}>
                                        {song.title}
                                    </p>
                                    <p className={`text-sm transition-colors truncate ${currentSong?.id === song.id ? "text-black/60" : "text-zinc-300"}`}>
                                        {song.artist}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {currentSong?.id === song.id && (
                                        <div className="flex gap-1 items-end h-4">
                                            <div className="w-1 bg-black animate-[music-bar_0.6s_ease-in-out_infinite]" />
                                            <div className="w-1 bg-black animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                                            <div className="w-1 bg-black animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => handleDeleteSong(e, song.id)}
                                        className={`p-2 rounded-xl transition-all ${currentSong?.id === song.id
                                            ? "text-black/40 hover:text-black hover:bg-black/5"
                                            : "text-white/20 hover:text-red-400 hover:bg-white/10"
                                            }`}
                                        title="Delete song"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
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
                    <div id="player-active-trigger" className="hidden" />
                    <div className="bg-white/[0.02] backdrop-blur-3xl border-t border-white/10 p-4 md:px-8">
                        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-8">
                            <div className="flex-1 min-w-0 flex items-center gap-4 text-center md:text-left">
                                <div className="w-14 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                                    {currentSong.thumbId ? (
                                        <img
                                            src={`/api/stream?id=${currentSong.thumbId}`}
                                            alt={currentSong.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl">🎵</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-lg truncate text-white">{currentSong.title}</p>
                                    <p className="text-sm text-zinc-300 truncate">{currentSong.artist}</p>
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
                                            <span className="text-[10px] font-bold text-white tabular-nums w-10 text-right">{formatTime(currentTime)}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max={duration || 0}
                                                step="0.01"
                                                value={currentTime}
                                                onChange={handleSeek}
                                                className="flex-1 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/40 transition-all"
                                            />
                                            <span className="text-[10px] font-bold text-white tabular-nums w-10">{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-32 shrink-0">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolume}
                                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/40 transition-all"
                                />
                            </div>
                        </div>

                        {/* Mobile Footer */}
                        <div className="md:hidden w-full flex justify-center mt-4">
                            <a
                                href="https://ashmit-kumar.vercel.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 opacity-60"
                            >
                                <span className="text-[10px] text-gray-400 tracking-wide">Made with</span>
                                <span className="text-red-500 text-xs">❤️</span>
                                <span className="text-[10px] text-gray-400 tracking-wide">by</span>
                                <span className="text-[10px] font-semibold text-zinc-300">
                                    Ashmit Kumar
                                </span>
                            </a>
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
