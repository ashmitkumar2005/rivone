import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
    try {
        const token = process.env.BOT_TOKEN;
        if (!token) {
            return NextResponse.json({ error: "BOT_TOKEN missing" }, { status: 500 });
        }

        const response = await fetch(
            `https://api.telegram.org/bot${token}/getUpdates`
        );
        const data = await response.json();

        if (!data.ok) {
            return NextResponse.json({ error: "Telegram API error" }, { status: 500 });
        }

        const newSongs: any[] = [];
        const seenFileIds = new Set<string>();

        const deletedSongs: any[] = (await redis.get("deleted_songs")) as any[] || [];
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

        let existingSongs: any[] = (await redis.get("songs")) as any[] || [];
        if (!Array.isArray(existingSongs)) existingSongs = [];

        let added = 0;
        for (const song of newSongs) {
            if (!existingSongs.some(s => s.fileId === song.fileId)) {
                existingSongs.push(song);
                added++;
            }
        }

        await redis.set("songs", existingSongs);

        return NextResponse.json({
            success: true,
            added,
            total: existingSongs.length
        });

    } catch (err) {
        console.error("SYNC ERROR 👉", err);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}

export async function GET() {
    return POST();
}
