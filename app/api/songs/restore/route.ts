import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Get lists
        const deletedSongs: any[] = (await redis.get("deleted_songs")) as any[] || [];
        const songs: any[] = (await redis.get("songs")) as any[] || [];

        // Find song in trash
        const songToRestore = deletedSongs.find((s: any) => s.id === id);
        if (!songToRestore) {
            return NextResponse.json({ error: "Song not found in trash" }, { status: 404 });
        }

        // Remove from deleted
        const updatedDeleted = deletedSongs.filter((s: any) => s.id !== id);

        // Add to active songs (if not already there, just in case)
        if (!songs.some((s: any) => s.id === id)) {
            songs.push(songToRestore);
        }

        // Update Redis
        await redis.set("deleted_songs", updatedDeleted);
        await redis.set("songs", songs);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json({ error: "Failed to restore song" }, { status: 500 });
    }
}
