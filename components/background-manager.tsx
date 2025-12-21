"use client";

import { usePathname } from "next/navigation";
import { LiquidEffectAnimation } from "@/components/ui/liquid-effect-animation";

export function BackgroundManager() {
    const pathname = usePathname();
    const isLiquidPage = pathname === "/player" || pathname === "/restore";

    if (!isLiquidPage) {
        return <div className="fixed inset-0 z-[-1] bg-black" />;
    }

    return (
        <div className="fixed inset-0 z-[-1]">
            <LiquidEffectAnimation />
        </div>
    );
}
