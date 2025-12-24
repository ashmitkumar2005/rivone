import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const { id } = await request.json();

        // Get lists from KV
        const deletedSongs: any[] = (await env.RIVONE_KV.get("deleted_songs", { type: "json" })) || [];
        const songs: any[] = (await env.RIVONE_KV.get("songs", { type: "json" })) || [];

        // Find song in trash
        const songToRestore = deletedSongs.find((s: any) => s.id === id);
        if (!songToRestore) {
            return NextResponse.json({ error: "Song not found in trash" }, { status: 404 });
        }

        // Remove from deleted
        const updatedDeleted = deletedSongs.filter((s: any) => s.id !== id);

        // Add to active songs (if not already there)
        if (!songs.some((s: any) => s.id === id)) {
            songs.push(songToRestore);
        }

        // Update KV
        await env.RIVONE_KV.put("deleted_songs", JSON.stringify(updatedDeleted));
        await env.RIVONE_KV.put("songs", JSON.stringify(songs));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json({ error: "Failed to restore song" }, { status: 500 });
    }
}
