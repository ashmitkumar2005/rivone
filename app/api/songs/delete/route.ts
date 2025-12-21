import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Read current songs from KV
        const songs: any[] = await kv.get("songs") || [];

        // Find song to delete
        const songToDelete = songs.find((s: any) => s.id === id);
        if (!songToDelete) {
            return NextResponse.json({ error: "Song not found" }, { status: 404 });
        }

        // Remove from songs
        const updatedSongs = songs.filter((s: any) => s.id !== id);

        // Update KV
        await kv.set("songs", updatedSongs);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
    }
}
