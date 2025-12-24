import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const { env } = getRequestContext();
        const token = env.BOT_TOKEN;

        if (!token || token === "process.env.BOT_TOKEN_PLACEHOLDER") {
            return NextResponse.json({ error: "BOT_TOKEN missing in environment variables" }, { status: 500 });
        }

        const response = await fetch(
            `https://api.telegram.org/bot${token}/getUpdates`
        );
        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API Error:", data);
            return NextResponse.json({ error: "Telegram API error", details: data }, { status: 500 });
        }

        const newSongs: any[] = [];
        const seenFileIds = new Set<string>();

        // Safely access KV
        let deletedSongs: any[] = [];
        try {
            deletedSongs = (await env.RIVON_DB.get("deleted_songs", { type: "json" })) || [];
        } catch (e) {
            console.warn("Failed to read deleted_songs from KV", e);
        }

        const deletedIds = new Set(deletedSongs.map(s => s.id));

        for (const update of data.result) {
            const message = update.message || update.channel_post;
            if (message?.audio) {
                const audio = message.audio;
                const fileId = audio.file_id;
                const id = audio.file_unique_id;

                if (seenFileIds.has(fileId)) continue;
                if (deletedIds.has(id)) continue;

                const thumbId = audio.thumbnail?.file_id;

                newSongs.push({
                    id: audio.file_unique_id,
                    title: audio.title || "Unknown Title",
                    artist: audio.performer || "Unknown Artist",
                    fileId,
                    ...(thumbId && { thumbId })
                });

                seenFileIds.add(fileId);
            }
        }

        let existingSongs: any[] = [];
        try {
            existingSongs = (await env.RIVON_DB.get("songs", { type: "json" })) || [];
        } catch (e) {
            console.warn("Failed to read songs from KV", e);
        }

        if (!Array.isArray(existingSongs)) existingSongs = [];

        let added = 0;
        for (const song of newSongs) {
            if (!existingSongs.some(s => s.fileId === song.fileId)) {
                existingSongs.push(song);
                added++;
            }
        }

        await env.RIVON_DB.put("songs", JSON.stringify(existingSongs));

        return NextResponse.json({
            success: true,
            added,
            total: existingSongs.length
        });

    } catch (err) {
        console.error("SYNC ERROR 👉", err);
        return NextResponse.json({ error: "Sync failed", details: String(err) }, { status: 500 });
    }
}

export async function GET() {
    return POST();
}
