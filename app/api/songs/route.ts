import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { env } = getRequestContext();
        const songs = await env.RIVONE_KV.get("songs", { type: "json" });
        return NextResponse.json(songs || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
    }
}
