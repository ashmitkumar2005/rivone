import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SONGS_PATH = path.join(process.cwd(), "data", "songs.json");
const IGNORED_PATH = path.join(process.cwd(), "data", "ignored.json");

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();

        // Read current songs
        const songsContent = await fs.readFile(SONGS_PATH, "utf-8");
        const songs = JSON.parse(songsContent);

        // Find song to delete
        const songToDelete = songs.find((s: any) => s.id === id);
        if (!songToDelete) {
            return NextResponse.json({ error: "Song not found" }, { status: 404 });
        }

        // Remove from songs
        const updatedSongs = songs.filter((s: any) => s.id !== id);
        await fs.writeFile(SONGS_PATH, JSON.stringify(updatedSongs, null, 2));

        // Add to ignored
        let ignored = [];
        try {
            const ignoredContent = await fs.readFile(IGNORED_PATH, "utf-8");
            ignored = JSON.parse(ignoredContent);
        } catch (e) {
            // File might not exist yet or be empty
        }

        if (!ignored.some((s: any) => s.id === id)) {
            ignored.push(songToDelete);
            await fs.writeFile(IGNORED_PATH, JSON.stringify(ignored, null, 2));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
    }
}
