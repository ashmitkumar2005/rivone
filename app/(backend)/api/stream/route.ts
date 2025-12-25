export const runtime = "edge"
export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { getRequestContext } from "@cloudflare/next-on-pages";
import { isAuthenticated } from "@/lib/auth-check";

export async function GET(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return new Response("Unauthorized", { status: 401 });
    }
    try {
        const { searchParams } = new URL(request.url)
        const fileId = searchParams.get("id")

        if (!fileId) {
            return new Response("missing file id", { status: 400 })
        }

        const { env } = getRequestContext();
        const token = env.BOT_TOKEN;
        if (!token) {
            console.error("BOT_TOKEN is missing")
            return new Response("BOT_TOKEN missing", { status: 500 })
        }

        // Fetch metadata with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        let metaRes;
        try {
            metaRes = await fetch(
                `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`,
                {
                    cache: "no-store",
                    signal: controller.signal
                }
            );
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.error("Telegram API timeout (metadata)");
                return new Response("Telegram API timeout", { status: 504 });
            }
            throw error;
        }
        clearTimeout(timeoutId);

        if (!metaRes.ok) {
            const errorText = await metaRes.text()
            console.error("Telegram getFile API error:", metaRes.status, errorText)
            return new Response(`Telegram getFile failed: ${metaRes.status}`, { status: metaRes.status })
        }

        const meta = await metaRes.json() as any
        if (!meta.ok || !meta.result?.file_path) {
            console.error("Telegram getFile returned ok:false or no file_path:", meta)
            return new Response("telegram getFile failed", { status: 404 })
        }

        const filePath = meta.result.file_path

        // Fetch actual file
        const fileRes = await fetch(
            `https://api.telegram.org/file/bot${token}/${filePath}`,
            { cache: "no-store" }
        )

        if (!fileRes.ok) {
            console.error("Telegram file download error:", fileRes.status)
            return new Response(`Telegram file download failed: ${fileRes.status}`, { status: fileRes.status })
        }

        if (!fileRes.body) {
            return new Response("empty audio stream", { status: 500 })
        }

        const download = searchParams.get("download") === "true"

        return new Response(fileRes.body, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=3600",
                "Content-Length": fileRes.headers.get("Content-Length") || "",
                ...(download && {
                    "Content-Disposition": 'attachment; filename="music.mp3"',
                }),
            },
        })
    } catch (error: any) {
        console.error("Stream error with stack:", error)
        return new Response(`Stream Error: ${error.message}`, { status: 500 })
    }
}
