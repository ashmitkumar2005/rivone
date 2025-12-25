"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { songs as initialSongs, Song } from "@/lib/songs";
import Lenis from "lenis";
import SongList from "@/components/player/song-list";
import { useToast } from "@/components/ui/toast";

declare global {
    interface Window {
        __audioIntensity?: number;
    }
}

interface CustomRangeProps {
    value: number;
    max: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    step?: string;
}

const CustomRange = ({ value, max, onChange, className = "", step = "0.01" }: CustomRangeProps) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    return (
        <div className={`group relative flex items-center h-4 cursor-pointer ${className}`}>
            {/* Track */}
            <div className="absolute w-full bg-white/10 rounded-full h-[2px] group-hover:h-1.5 transition-all duration-300 ease-out delay-200 group-hover:delay-0 top-1/2 -translate-y-1/2 overflow-hidden">
                {/* Shadow inner to give depth */}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Fill */}
            <div
                className="absolute bg-gradient-to-r from-white/40 to-white rounded-full h-[2px] group-hover:h-1.5 transition-all duration-300 ease-out delay-200 group-hover:delay-0 left-0 top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${percentage}%` }}
            >
                {/* Glowing Tip */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-0 group-hover:scale-100" />
            </div>

            <input
                type="range"
                min="0"
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
        </div>
    );
};

export default function PlayerPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
    const [volume, setVolume] = useState(2);
    const [isHoveringUI, setIsHoveringUI] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [loopMode, setLoopMode] = useState<'off' | 'playlist' | 'song'>('playlist');
    const [isShuffle, setIsShuffle] = useState(false);
    const [shuffleHistory, setShuffleHistory] = useState<string[]>([]);
    const lastVolumeRef = useRef(2); // Track volume before mute
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initial load of volume from localStorage
    useEffect(() => {
        const savedVolume = localStorage.getItem("rivone_volume");
        if (savedVolume) {
            const vol = parseFloat(savedVolume);
            setVolume(vol);
            lastVolumeRef.current = vol;
        }
    }, []);

    // Save volume to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("rivone_volume", volume.toString());
    }, [volume]);

    const fetchSongs = async () => {
        try {
            const res = await fetch("/api/songs");
            const data = (await res.json()) as Song[];
            if (Array.isArray(data)) {
                setSongs(data);
            }
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSongs();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            const data = (await res.json()) as { success: boolean };
            if (data.success) {
                await fetchSongs();
                showToast("Library synced successfully", "success");
            } else {
                showToast("Sync failed", "error");
            }
        } catch (error) {
            console.error("Sync failed:", error);
            showToast("Sync failed to connect", "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleLock = () => {
        document.cookie = "rivon-access=; path=/; max-age=0; SameSite=Lax";
        router.push("/access");
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; songId: string | null }>({
        isOpen: false,
        songId: null,
    });

    const handleDeleteSong = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setDeleteConfirmation({ isOpen: true, songId: id });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation.songId) return;

        try {
            const res = await fetch("/api/songs/delete", {
                method: "POST",
                body: JSON.stringify({ id: deleteConfirmation.songId }),
            });
            if (res.ok) {
                await fetchSongs();
                showToast("Song deleted", "success");
                if (currentSong?.id === deleteConfirmation.songId) {
                    setCurrentSong(null);
                    setIsPlaying(false);
                    if (audioRef.current) audioRef.current.pause();
                }
            } else {
                showToast("Failed to delete song", "error");
            }
        } catch (error) {
            console.error("Delete failed:", error);
            showToast("Delete request failed", "error");
        } finally {
            setDeleteConfirmation({ isOpen: false, songId: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ isOpen: false, songId: null });
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

        if (isShuffle && shuffleHistory.length > 0) {
            const prevSongId = shuffleHistory[shuffleHistory.length - 1];
            const prevSong = songs.find(s => s.id === prevSongId);
            if (prevSong) {
                setShuffleHistory(prev => prev.slice(0, -1));
                handleSongClick(prevSong);
                return;
            }
        }

        const currentIndex = songs.findIndex(s => s.id === currentSong.id);
        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
            prevIndex = songs.length - 1;
        }

        handleSongClick(songs[prevIndex]);
    }, [currentSong, songs, handleSongClick, isShuffle, shuffleHistory]);

    const playNext = useCallback(() => {
        if (!currentSong || songs.length === 0) return;

        if (isShuffle) {
            setShuffleHistory(prev => [...prev, currentSong.id]);
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * songs.length);
            } while (songs.length > 1 && songs[nextIndex].id === currentSong.id);

            handleSongClick(songs[nextIndex]);
            return;
        }

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
    }, [currentSong, songs, loopMode, handleSongClick, isShuffle]);

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
        <main className="relative min-h-screen w-full flex items-center justify-center md:justify-end flex-col p-4 md:pt-8 md:px-8 md:pb-40 overflow-hidden">
            <div className="absolute inset-0 bg-black/30 z-0 pointer-events-none animate-fade-in" />

            <div
                className="relative z-10 w-full max-w-2xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col max-h-[65vh] md:max-h-[80vh] animate-fade-in-up"
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
                            onClick={handleLock}
                            className="p-3 md:px-4 md:py-2 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all text-sm font-medium flex items-center gap-2"
                            aria-label="Lock"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="hidden md:inline">Lock</span>
                        </button>
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

                    </div>
                </header>

                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-40 md:pb-0"
                    onWheel={(e) => e.stopPropagation()}
                >
                    <SongList
                        songs={songs}
                        currentSong={currentSong}
                        onSongClick={handleSongClick}
                        onDeleteClick={handleDeleteSong}
                        isLoading={isLoading}
                    />
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

                    <div className="flex justify-center mb-[20px]">
                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-fade-in-up">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] md:text-xs font-medium text-zinc-400 uppercase tracking-wider">Now Playing</span>
                            <div className="h-3 w-[1px] bg-white/10 mx-1" />
                            <span className="text-xs md:text-sm font-medium text-white max-w-[200px] md:max-w-xs truncate">
                                {currentSong.title} <span className="text-zinc-500 mx-1">•</span> {currentSong.artist}
                            </span>
                        </div>
                    </div>


                    <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-2 md:px-4 md:py-2 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
                        {/* Desktop Single Line Layout */}
                        <div className="hidden md:flex flex-row items-center gap-6 w-full relative z-10 h-10">

                            {/* Left: Controls */}
                            <div className="flex items-center gap-4 flex-none">
                                <button
                                    onClick={() => setIsShuffle(!isShuffle)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white/10 ${isShuffle ? 'text-white' : 'text-zinc-500'}`}
                                    title="Shuffle"
                                    aria-label="Toggle Shuffle"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </button>
                                <button onClick={playPrevious} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white" aria-label="Previous Song">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                                </button>
                                <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-white to-zinc-400 text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] border border-white/50 shrink-0" aria-label={isPlaying ? "Pause" : "Play"}>
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <button onClick={playNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white" aria-label="Next Song">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                                </button>
                                <button
                                    onClick={() => setLoopMode(prev => prev === 'off' ? 'playlist' : prev === 'playlist' ? 'song' : 'off')}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:bg-white/10 ${loopMode !== 'off' ? 'text-white' : 'text-zinc-500'}`}
                                    aria-label="Toggle Loop Mode"
                                >
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {loopMode === 'song' && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-white text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>}
                                    </div>
                                </button>
                            </div>

                            {/* Middle: Progress Bar */}
                            <div className="flex-1 flex items-center gap-3 min-w-0">
                                <span className="text-xs font-medium text-zinc-400 tabular-nums w-[32px] text-right">{formatTime(currentTime)}</span>
                                <CustomRange
                                    value={currentTime}
                                    max={duration || 0}
                                    onChange={handleSeek}
                                    className="flex-1 w-full"
                                />
                                <span className="text-xs font-medium text-zinc-400 tabular-nums w-[32px]">{formatTime(duration)}</span>
                            </div>

                            {/* Right: Volume */}
                            <div className="flex items-center gap-3 flex-none pl-2 border-l border-white/10">
                                <button onClick={toggleMute} className="text-white hover:text-white/80" aria-label={volume === 0 ? "Unmute" : "Mute"}>
                                    {volume === 0 ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
                                    )}
                                </button>
                                <CustomRange
                                    value={volume}
                                    max={2}
                                    onChange={handleVolume}
                                    className="w-24"
                                />
                                <span className="text-xs font-medium text-zinc-400 tabular-nums w-[3rem] text-right">{Math.round((volume / 2) * 100)}%</span>
                            </div>
                        </div>

                        {/* Mobile Layout (Unchanged) */}
                        <div className="md:hidden flex flex-row items-center gap-1">
                            <div className="flex flex-1 flex-col gap-1 order-1">
                                <div className="flex items-center gap-[2px]">
                                    <span className="text-[10px] font-bold text-white tabular-nums w-[24px] text-right">{formatTime(currentTime)}</span>
                                    <CustomRange value={currentTime} max={duration || 0} onChange={handleSeek} className="flex-1 min-w-[15px]" />
                                    <span className="text-[10px] font-bold text-white/50 tabular-nums w-[24px]">{formatTime(duration)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-auto justify-end order-2">
                                <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white" aria-label={volume === 0 ? "Unmute" : "Mute"}>
                                    {volume === 0 ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                    )}
                                </button>
                                <button onClick={() => setIsShuffle(!isShuffle)} className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 ${isShuffle ? 'text-white' : 'text-zinc-500'}`} title="Shuffle" aria-label="Toggle Shuffle">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                </button>
                                <button onClick={() => setLoopMode(prev => prev === 'off' ? 'playlist' : prev === 'playlist' ? 'song' : 'off')} className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 ${loopMode !== 'off' ? 'text-white' : 'text-zinc-500'}`} aria-label="Toggle Loop Mode">
                                    <div className="relative flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        {loopMode === 'song' && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-white text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>}
                                    </div>
                                </button>
                                <button onClick={playPrevious} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white" aria-label="Previous Song">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                                </button>
                                <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-white to-zinc-400 text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/50 shrink-0" aria-label={isPlaying ? "Pause" : "Play"}>
                                    {isPlaying ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>
                                <button onClick={playNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white" aria-label="Next Song">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {deleteConfirmation.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                        onClick={cancelDelete}
                    />
                    <div className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-fade-in-up md:scale-100 scale-95 origin-center">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-white">Delete Song?</h3>
                            <p className="text-zinc-400 text-sm">
                                Are you sure you want to delete this song? This action cannot be undone and it won't be restored by sync.
                            </p>

                            <div className="flex w-full gap-3 mt-4">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3 px-4 rounded-2xl bg-red-500/20 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                                >
                                    Delete
                                </button>
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
