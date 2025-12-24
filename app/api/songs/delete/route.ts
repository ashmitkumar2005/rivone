import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { env } = getRequestContext();
        const { id } = await request.json();

        // Read current songs from KV
        const songs: any[] = (await env.RIVON_DB.get("songs", { type: "json" })) || [];

        // Find song to delete
        const songToDelete = songs.find((s: any) => s.id === id);
        if (!songToDelete) {
            return NextResponse.json({ error: "Song not found" }, { status: 404 });
        }

        // Remove from songs
        const updatedSongs = songs.filter((s: any) => s.id !== id);

        // Add to deleted_songs
        const deletedSongs: any[] = (await env.RIVON_DB.get("deleted_songs", { type: "json" })) || [];
        if (!deletedSongs.some(s => s.id === id)) {
            deletedSongs.push(songToDelete);
        }

        // Update KV
        await env.RIVON_DB.put("songs", JSON.stringify(updatedSongs));
        await env.RIVON_DB.put("deleted_songs", JSON.stringify(deletedSongs));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
    }
}
