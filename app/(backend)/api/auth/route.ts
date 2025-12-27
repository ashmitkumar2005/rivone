import { getRequestContext } from "@cloudflare/next-on-pages";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { key?: string, type?: string };
        const { key, type } = body;
        const { env } = getRequestContext();

        // Guest Access
        if (type === "guest") {
            const response = NextResponse.json({ success: true, isGuest: true });
            response.cookies.set("rivon-access", "guest", {
                path: "/",
                maxAge: 86400 * 7, // 7 days
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });
            return response;
        }

        // Default password if not set in environment (Fallback for safety)
        const validPassword = env.PROJECT_PASSWORD;

        if (!validPassword) {
            console.error("PROJECT_PASSWORD is not set in environment variables.");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (key === validPassword) {
            const response = NextResponse.json({ success: true, isAdmin: true });

            // Set a secure, HTTP-only cookie
            // Max-age: 30 days (2592000 seconds)
            response.cookies.set("rivon-access", "true", {
                path: "/",
                maxAge: 2592000,
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });

            return response;
        }

        return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
