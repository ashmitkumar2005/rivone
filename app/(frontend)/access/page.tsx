"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AccessPage() {
    const [key, setKey] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleUnlock = async () => {
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key }),
            });

            if (res.ok) {
                router.push("/player");
                router.refresh();
            } else {
                setError(true);
                setKey("");
                setTimeout(() => setError(false), 2000);
            }
        } catch (e) {
            console.error("Auth error", e);
            setError(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleUnlock();
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 animate-fade-in-up">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-semibold text-white">Access Key</h2>
                    <p className="text-zinc-400 text-sm">Enter your private key to continue</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="password"
                        value={key}
                        onChange={(e) => {
                            setKey(e.target.value);
                            setError(false);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="••••••••"
                        className={`w-full px-4 py-3 bg-zinc-900 border rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all ${error ? "border-red-500/50 shake" : "border-zinc-800"
                            }`}
                        autoFocus
                    />
                    <button
                        onClick={handleUnlock}
                        className="block w-full py-3 bg-zinc-100 text-black text-center font-semibold rounded-xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Unlock Space
                    </button>
                    {error && (
                        <p className="text-red-400 text-xs text-center animate-fade-in">
                            Invalid access key
                        </p>
                    )}
                </div>

                <div className="text-center">
                    <Link href="/" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
                        Go Back
                    </Link>
                </div>
            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </main>
    );
}
