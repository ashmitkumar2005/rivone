import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SONGS_PATH = path.join(process.cwd(), "data", "songs.json");
const IGNORED_PATH = path.join(process.cwd(), "data", "ignored.json");

export async function POST() {
    try {
        const token = process.env.BOT_TOKEN;
        // In a real app, you might get the chat ID from env or a settings file
        // For now, we'll try to get it from a potential env variable 
        // or we can allow syncing from the bot's updates
        if (!token) {
            return NextResponse.json({ error: "BOT_TOKEN missing" }, { status: 500 });
        }

        console.log("Syncing with Telegram...");

        // 1. Get updates to find audio files
        const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json({ error: "Telegram API error", details: data }, { status: 500 });
        }

        // 2. Load ignored songs to filter them out
        let ignoredIds: string[] = [];
        try {
            const ignoredContent = await fs.readFile(IGNORED_PATH, "utf-8");
            const ignoredData = JSON.parse(ignoredContent);
            ignoredIds = ignoredData.map((s: any) => s.id);
        } catch (e) { }

        const newSongs: any[] = [];
        const seenFileIds = new Set();

        // 3. Process updates
        data.result.forEach((update: any) => {
            const message = update.message || update.channel_post;
            if (message && message.audio) {
                const audio = message.audio;
                const fileId = audio.file_id;

                // Create a unique ID based on the title/artist or file_id
                const id = audio.title ?
                    audio.title.toLowerCase().replace(/[^a-z0-9]/g, "-") :
                    fileId.substring(0, 10);

                if (!ignoredIds.includes(id) && !seenFileIds.has(fileId)) {
                    newSongs.push({
                        id,
                        title: audio.title || "Unknown Title",
                        artist: audio.performer || "Unknown Artist",
                        fileId: fileId
                    });
                    seenFileIds.add(fileId);
                }
            }
        });

        if (newSongs.length > 0) {
            // Merge with existing songs (avoid duplicates)
            let existingSongs = [];
            try {
                const songsContent = await fs.readFile(SONGS_PATH, "utf-8");
                existingSongs = JSON.parse(songsContent);
            } catch (e) { }

            const mergedSongs = [...existingSongs];
            newSongs.forEach(song => {
                if (!mergedSongs.some(s => s.fileId === song.fileId)) {
                    mergedSongs.push(song);
                }
            });

            await fs.writeFile(SONGS_PATH, JSON.stringify(mergedSongs, null, 2));
        }

        return NextResponse.json({
            success: true,
            added: newSongs.length,
            total: (await JSON.parse(await fs.readFile(SONGS_PATH, "utf-8"))).length
        });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
