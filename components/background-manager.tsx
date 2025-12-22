"use client";

import { usePathname } from "next/navigation";

export function BackgroundManager() {
    const pathname = usePathname();
    const isLiquidPage = pathname === "/player" || pathname === "/restore";

    if (!isLiquidPage) {
        return <div className="fixed inset-0 z-[-1] bg-black" />;
    }

    return (
        <div className="fixed inset-0 z-[-1]">
            <img
                src="/sky.jpg"
                alt="Background"
                className="w-full h-full object-cover brightness-[0.8] contrast-[1.5] scale-110"
            />
        </div>
    );
}
