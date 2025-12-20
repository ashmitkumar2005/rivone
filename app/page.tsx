import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="absolute top-8 right-8">
        <a
          href="https://rivone.vercel.app/api/stream?id=CQACAgUAAxkBAAMDaUbZFJ5pmX3bSyE-WP2QQ5jnrgIAAlQhAAIaHzlW08gqdGv2Uuo2BA"
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium rounded-xl hover:bg-zinc-800 hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3l14 9-14 9V3z" /></svg>
          Stream
        </a>
      </div>

      <div className="space-y-4">
        <h1 className="text-6xl font-bold tracking-tighter text-white">
          RIVONE
        </h1>
        <p className="text-zinc-400 text-lg font-medium">
          Private Music. Your Space.
        </p>
      </div>

      <div className="mt-12">
        <Link
          href="/access"
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
        >
          Enter Access Key
        </Link>
      </div>
    </main>
  );
}
