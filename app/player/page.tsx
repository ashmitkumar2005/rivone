"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { songs as initialSongs, Song } from "@/lib/songs";
import Lenis from "lenis";

declare global {
    interface Window {
        __audioIntensity?: number;
    }
}

export default function PlayerPage() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
        if (!listRef.current) return;
        const lenis = new Lenis({
            wrapper: listRef.current,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, [songs]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isHoveringUI, setIsHoveringUI] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [loopMode, setLoopMode] = useState<'off' | 'playlist' | 'song'>('off');
    const lastVolumeRef = useRef(1); // Track volume before mute
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

    const handleSongClick = useCallback((song: Song) => {
        setCurrentSong(song);
        if (audioRef.current) {
            audioRef.current.src = `/api/stream?id=${song.fileId}`;
            audioRef.current.play();
            setIsPlaying(true);
        }
    }, []); // Dependencies: setCurrentSong, setIsPlaying (React guarantees stability for setState functions)

    const playPrevious = useCallback(() => {
        if (!currentSong || songs.length === 0) return;
        if (audioRef.current && audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            prevIndex = songs.length - 1;
        }

        handleSongClick(songs[prevIndex]);
    }, [currentSong, songs, handleSongClick]);

    const playNext = useCallback(() => {
        if (!currentSong || songs.length === 0) return;

        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        let nextIndex = currentIndex + 1;

        if (nextIndex >= songs.length) {
            if (loopMode === 'playlist') {
                nextIndex = 0; // Loop back to start
            } else {
                setIsPlaying(false); // Stop if not looping playlist
                return;
            }
        }

        handleSongClick(songs[nextIndex]);
    }, [currentSong, songs, loopMode, handleSongClick]);

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
        const handleEnded = () => {
            if (loopMode === 'song') {
                audio.currentTime = 0;
                audio.play();
            } else if (loopMode === 'playlist') {
                playNext();
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [isPlaying, loopMode, playNext, volume]); // Added playNext and volume to dependencies

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
            if (vol > 0) lastVolumeRef.current = vol; // Update last volume if not muted
        }
    };

    const toggleMute = () => {
        if (!audioRef.current || !gainNodeRef.current) return;

        if (volume > 0) {
            lastVolumeRef.current = volume;
            gainNodeRef.current.gain.value = 0;
            setVolume(0);
        } else {
            const newVol = lastVolumeRef.current || 1;
            gainNodeRef.current.gain.value = newVol;
            setVolume(newVol);
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
                className="relative z-10 w-full max-w-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[65vh] md:max-h-[75vh] animate-fade-in-up"
                onMouseEnter={() => setIsHoveringUI(true)}
                onMouseLeave={() => setIsHoveringUI(false)}
            >
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 mb-10">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                            Songs Library
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

                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-40 md:pb-0"
                    onWheel={(e) => e.stopPropagation()}
                >
                    <div className="space-y-3">
                        {songs.map((song) => (
                            <button
                                key={song.id}
                                onClick={() => handleSongClick(song)}
                                className={`w-full text-left p-2 md:p-3 border rounded-[2rem] md:rounded-2xl transition-all duration-300 group ${currentSong?.id === song.id
                                    ? "bg-white/10 border-white/20 shadow-lg"
                                    : "border-transparent hover:bg-white/5 hover:border-white/10"
                                    }`}
                            >
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/5">
                                        {song.thumbId ? (
                                            <img
                                                src={`/api/stream?id=${song.thumbId}`}
                                                alt={song.title}
                                                className="w-full h-full object-cover"
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
                                    <div className="text-xs md:text-sm text-zinc-600 tabular-nums">
                                        {formatTime(song.duration || 0)}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <audio ref={audioRef} />
            </div>

            {currentSong && (
                <div
                    className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl animate-in fade-in slide-in-from-bottom-5 duration-500"
                    onMouseEnter={() => setIsHoveringUI(true)}
                    onMouseLeave={() => setIsHoveringUI(false)}
                >
                    <div id="player-active-trigger" className="hidden" />
                    <div className="bg-black/30 backdrop-blur-2xl border border-white/10 p-2 md:px-6 md:py-3 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
                        <div className="flex flex-row items-center gap-3 md:gap-4 w-full justify-between">
                            <div className="flex-none md:flex-1 min-w-0 flex items-center gap-3 md:gap-4 text-left pl-[14px] md:pl-0">
                                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl md:rounded-xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                                    {currentSong.thumbId ? (
                                        <img
                                            src={`/api/stream?id=${currentSong.thumbId}`}
                                            alt={currentSong.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-base md:text-xl">🎵</span>
                                    )}
                                </div>
                                <div className="min-w-0 hidden md:block">
                                    <p className="font-bold text-sm md:text-lg truncate text-white">{currentSong.title}</p>
                                    <p className="text-xs md:text-sm text-zinc-300 truncate">{currentSong.artist}</p>
                                </div>
                            </div>

                            <div className="flex flex-row items-center gap-3 flex-1 min-w-0 md:flex-none md:w-[600px]">
                                <div className="flex flex-1 flex-col gap-1 w-full md:max-w-none order-1 md:order-2">
                                    <div className="flex items-center gap-2 md:gap-3">
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
                                        <span className="text-[10px] font-bold text-white/50 tabular-nums w-10">{formatTime(duration)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:gap-6 w-auto justify-end md:justify-center order-2 md:order-1">
                                    <button
                                        onClick={toggleMute}
                                        className="md:hidden p-2 rounded-full transition-all hover:bg-white/10 text-white"
                                    >
                                        {volume === 0 ? (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setLoopMode(prev => prev === 'off' ? 'playlist' : prev === 'playlist' ? 'song' : 'off')}
                                        className={`p-2 rounded-full transition-all hover:bg-white/10 ${loopMode !== 'off' ? 'text-white' : 'text-zinc-500'
                                            }`}
                                    >
                                        <div className="relative">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            {loopMode === 'song' && (
                                                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-white text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>
                                            )}
                                        </div>
                                    </button>

                                    <button
                                        onClick={playPrevious}
                                        className="p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                                    </button>

                                    <button
                                        onClick={togglePlay}
                                        className="p-2 md:p-4 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 shrink-0"
                                    >
                                        {isPlaying ? (
                                            <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={playNext}
                                        className="p-2 text-white/70 hover:text-white hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="hidden md:flex flex-1 min-w-0 justify-end items-center gap-3">
                                <button onClick={toggleMute} className="text-white hover:text-white/80 transition-colors">
                                    {volume === 0 ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolume}
                                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/40 transition-all max-w-[8rem]"
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
