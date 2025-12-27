import Link from "next/link";
import { cookies } from "next/headers";
import GuestLoginButton from "@/components/GuestLoginButton";

export default async function Home() {
  const cookieStore = await cookies();
  const accessVal = cookieStore.get("rivon-access")?.value;
  const hasAccess = accessVal === "true" || accessVal === "guest";

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

      <div className="mt-12 flex flex-col items-center gap-4">
        <Link
          href={hasAccess ? "/player" : "/access"}
          className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors transform hover:scale-105 active:scale-95 duration-200"
        >
          {hasAccess ? "Access Playlist" : "Unlock with Key"}
        </Link>
        {!hasAccess && <GuestLoginButton />}
      </div>
    </main>
  );
}
