export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-white animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-b-2 border-white/50 animate-spin-reverse"></div>
                </div>
                <p className="text-white/50 text-sm font-medium tracking-widest uppercase animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}
