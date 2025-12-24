import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json() as { key: string };
        const { env } = getRequestContext();

        // Default password if not set in environment (Fallback for safety)
        const validPassword = env.PROJECT_PASSWORD;

        if (!validPassword) {
            console.error("PROJECT_PASSWORD is not set in environment variables.");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (key === validPassword) {
            const response = NextResponse.json({ success: true });

            // Set a secure, HTTP-only cookie
            // Max-age: 30 days (2592000 seconds)
            response.cookies.set("rivon-access", "true", {
                path: "/",
                maxAge: 2592000,
                httpOnly: true,
                secure: true,
                sameSite: "strict",
            });

            return response;
        }

        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
