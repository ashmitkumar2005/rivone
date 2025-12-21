import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SONGS_PATH = path.join(process.cwd(), "data", "songs.json");

export async function GET() {
    try {
        const data = await fs.readFile(SONGS_PATH, "utf-8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: "Failed to load songs" }, { status: 500 });
    }
}
