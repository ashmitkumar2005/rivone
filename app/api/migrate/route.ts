import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
// Import the data directly since we are on the server side/build time
import initialSongs from "@/data/songs.json";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { env } = getRequestContext();

        // 1. Check if KV already has data to avoid overwriting accidentally (optional, but safer)
        const existing = await env.RIVONE_KV.get("songs", { type: "json" });
        if (existing) {
            return NextResponse.json({ message: "Data already exists" });
        }

        // Seeding initial data from your local file
        await env.RIVONE_KV.put("songs", JSON.stringify(initialSongs));

        return NextResponse.json({
            success: true,
            message: "Migrated local songs.json to Cloudflare KV",
            migratedCount: initialSongs.length
        });

    } catch (error) {
        return NextResponse.json({
            error: "Migration failed",
            details: String(error)
        }, { status: 500 });
    }
}
