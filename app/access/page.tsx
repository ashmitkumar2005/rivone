import Link from "next/link";

export default function AccessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-white">Access Key</h2>
                    <p className="text-zinc-400 text-sm">Enter your private key to continue</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                    />
                    <Link
                        href="/player"
                        className="block w-full py-3 bg-zinc-100 text-black text-center font-semibold rounded-xl hover:bg-white transition-colors"
                    >
                        Unlock Space
                    </Link>
                </div>

                <div className="text-center">
                    <Link href="/" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
                        Go Back
                    </Link>
                </div>
            </div>
        </main>
    );
}
