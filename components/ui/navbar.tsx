import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-center bg-transparent pointer-events-none">
            <Link href="/" className="pointer-events-auto flex items-center gap-2 group">
                <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-white/5 transition-transform duration-500 group-hover:scale-105">
                    <Image
                        src="/navbar-logo.svg"
                        alt="RIVONE Logo"
                        fill
                        className="object-cover"
                    />
                </div>
                <span className="text-xl md:text-2xl font-bold tracking-tighter text-white mix-blend-difference">
                    RIVONE
                </span>
            </Link>
        </nav>
    );
}
