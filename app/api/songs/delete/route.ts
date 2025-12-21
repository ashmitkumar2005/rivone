import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Read current songs from Redis
        const songs: any[] = (await redis.get("songs")) as any[] || [];

        // Find song to delete
        const songToDelete = songs.find((s: any) => s.id === id);
        if (!songToDelete) {
            return NextResponse.json({ error: "Song not found" }, { status: 404 });
        }

        // Remove from songs
        const updatedSongs = songs.filter((s: any) => s.id !== id);

        // Add to deleted_songs
        const deletedSongs: any[] = (await redis.get("deleted_songs")) as any[] || [];
        if (!deletedSongs.some(s => s.id === id)) {
            deletedSongs.push(songToDelete);
        }

        // Update Redis
        await redis.set("songs", updatedSongs);
        await redis.set("deleted_songs", deletedSongs);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
    }
}
