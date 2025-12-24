import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-9xl font-bold bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent">
                404
            </h1>
            <h2 className="text-2xl font-medium text-white mt-4 mb-2">Page Not Found</h2>
            <p className="text-zinc-500 max-w-md mb-8">
                The music stopped. We couldn't find the page you were looking for.
            </p>

            <Link
                href="/"
                className="px-6 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition-transform"
            >
                Return Home
            </Link>
        </div>
    );
}
