import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const deletedSongs = await redis.get("deleted_songs");
        return NextResponse.json(deletedSongs || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to load deleted songs" }, { status: 500 });
    }
}
