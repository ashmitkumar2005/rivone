import Link from "next/link";

export default function PlayerPage() {
    const dummySongs = [
        { id: 1, title: "Midnight City", artist: "M83" },
        { id: 2, title: "Starboy", artist: "The Weeknd" },
        { id: 3, title: "Blinding Lights", artist: "The Weeknd" },
        { id: 4, title: "Nightcall", artist: "Kavinsky" },
    ];

    return (
        <main className="flex flex-1 flex-col p-8 overflow-hidden">
            <header className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Music Player</h2>
                <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                    Exit
                </Link>
            </header>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {dummySongs.map((song) => (
                    <div
                        key={song.id}
                        className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:bg-zinc-900 transition-colors cursor-pointer group"
                    >
                        <div>
                            <p className="text-white font-medium group-hover:text-zinc-100">{song.title}</p>
                            <p className="text-zinc-500 text-sm">{song.artist}</p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                            <span className="text-xs">▶</span>
                        </div>
                    </div>
                ))}
            </div>

            <footer className="mt-8 pt-6 border-t border-zinc-800">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold">Now Playing</p>
                            <p className="text-zinc-400 text-sm">Select a track to start listening</p>
                        </div>
                    </div>
                    <audio controls className="w-full h-10 invert opacity-80 hover:opacity-100 transition-opacity">
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </footer>
        </main>
    );
}
