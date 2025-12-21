import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center animate-fade-in">


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
