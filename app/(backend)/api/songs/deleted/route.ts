import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { isAuthenticated, unauthorizedResponse } from "@/lib/auth-check";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    if (!isAuthenticated(req)) return unauthorizedResponse();
    try {
        const { env } = getRequestContext();
        const deletedSongs = await env.RIVONE_KV.get("deleted_songs", { type: "json" });
        return NextResponse.json(deletedSongs || []);
    } catch (error) {
        return NextResponse.json({ error: "Failed to load deleted songs" }, { status: 500 });
    }
}
