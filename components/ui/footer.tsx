"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function Footer() {
    const [isVisible, setIsVisible] = useState(false);
    const lastScrollY = useRef(0);
    const touchStartY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide if scrolling up
            if (currentScrollY < lastScrollY.current) {
                setIsVisible(false);
            }

            // Also hide if not at bottom (safety)
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const isAtBottom = currentScrollY + windowHeight >= docHeight - 2;
            if (!isAtBottom && currentScrollY < lastScrollY.current) { // Double check direction to avoid jitter
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        const handleWheel = (e: WheelEvent) => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const isAtBottom = scrollTop + windowHeight >= docHeight - 2;

            // Reveal: At bottom + Scroll Down
            if (isAtBottom && e.deltaY > 0) {
                setIsVisible(true);
            }
            // Hide: Scroll Up (even if still at bottom due to bounce)
            if (e.deltaY < 0) {
                setIsVisible(false);
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const touchY = e.touches[0].clientY;
            // deltaY positive = Swipe UP = Scroll Down
            // deltaY negative = Swipe DOWN = Scroll Up
            const deltaY = touchStartY.current - touchY;

            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const isAtBottom = scrollTop + windowHeight >= docHeight - 2;

            // Reveal: At bottom + Dragging content UP (Pushing down)
            if (isAtBottom && deltaY > 10) {
                setIsVisible(true);
            }
            // Hide: Dragging content DOWN (Scrolling Up)
            if (deltaY < -10) {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("wheel", handleWheel);
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchmove", handleTouchMove);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);

    return (
        <footer
            className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center h-[28px] bg-black/40 backdrop-blur-md transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-full"
                }`}
        >
            <Link
                href="https://ashmit-kumar.vercel.app"
                target="_blank"
                className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide group cursor-pointer"
            >
                <span className="text-white/40 group-hover:text-white/60 transition-colors">
                    Made with
                </span>
                <span className="animate-heartbeat text-red-500/80 group-hover:text-red-500 transition-colors">
                    ❤️
                </span>
                <span className="text-white/70 group-hover:text-white transition-colors">
                    by Ashmit Kumar
                </span>
            </Link>
        </footer>
    );
}
