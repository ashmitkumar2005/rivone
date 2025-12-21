import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
    try {
        const songs = await kv.get("songs");
        return NextResponse.json(songs || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
    }
}
