import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST() {
    try {
        const token = process.env.BOT_TOKEN;

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

        const newSongs: any[] = [];
        const seenFileIds = new Set();

        // 2. Process updates
        data.result.forEach((update: any) => {
            const message = update.message || update.channel_post;
            if (message && message.audio) {
                const audio = message.audio;
                const fileId = audio.file_id;

                // Create a unique ID based on the title/artist or file_id
                const id = audio.title ?
                    audio.title.toLowerCase().replace(/[^a-z0-9]/g, "-") :
                    fileId.substring(0, 10);

                if (!seenFileIds.has(fileId)) {
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

        // 3. Merge with existing songs from KV
        let existingSongs: any[] = await kv.get("songs") || [];

        // Ensure existingSongs is an array (safeguard)
        if (!Array.isArray(existingSongs)) {
            existingSongs = [];
        }

        const mergedSongs = [...existingSongs];
        let addedCount = 0;

        newSongs.forEach(song => {
            if (!mergedSongs.some(s => s.fileId === song.fileId)) {
                mergedSongs.push(song);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            await kv.set("songs", mergedSongs);
        }

        return NextResponse.json({
            success: true,
            added: addedCount,
            total: mergedSongs.length
        });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
