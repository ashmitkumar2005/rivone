import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the auth cookie
    response.cookies.delete("rivon-access");

    return response;
}
