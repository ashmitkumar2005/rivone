"use client";

import { useRouter } from "next/navigation";

export default function GuestLoginButton() {
    const router = useRouter();

    const handleGuestLogin = async () => {
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "guest" }),
            });

            if (res.ok) {
                router.push("/player");
                router.refresh();
            }
        } catch (e) {
            console.error("Guest auth error", e);
        }
    };

    return (
        <button
            onClick={handleGuestLogin}
            className="px-8 py-3 bg-transparent border border-white/20 text-zinc-300 font-medium rounded-full hover:bg-white/10 hover:text-white transition-all text-sm"
        >
            Enter as Guest
        </button>
    );
}
